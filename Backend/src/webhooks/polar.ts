import { Request, Response } from "express"
import { getEnv } from "../lib/env.js"
import { Webhook } from "standardwebhooks"
import { db } from "../db/index.js"
import { orders, orderItems, checkoutSession } from "../db/schema.js"
import { eq } from "drizzle-orm"



function headerString(headers: Request["headers"], name: string) {
    const value = headers[name]
    return Array.isArray(value) ? value[0] : value
}

const alreadyPaid = async(polarOrderId?: string, checkoutId?: string) => {
    if (polarOrderId) {
    const [row] = await db
      .select()
      .from(orders)
      .where(eq(orders.polarOrderId, polarOrderId))
      .limit(1);
    if (row?.status === "paid") return true;
  }
  if (checkoutId) {
    const [row] = await db
      .select()
      .from(orders)
      .where(eq(orders.polarCheckoutId, checkoutId))
      .limit(1);
    if (row?.status === "paid") return true;
  }
  return false;
}

const checkoutSessionIdFromMetadata = (order: Record<string,unknown>) => {
    const metadata = order.metadata;
    if (!metadata || typeof metadata !== "object") return undefined;
    const sessionId = (metadata as Record<string, unknown>).checkout_session_id;
    return typeof sessionId === "string" ? sessionId : undefined;
}

const fulfillCheckoutSession = async(
    sessionId: string,
    polarOrderId: string | undefined,
    checkoutId: string | undefined
) => {
    // transaction
     return await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(checkoutSession)
      .where(eq(checkoutSession.id, sessionId))
      .for("update");

    if (!session) return false;

    const [order] = await tx
      .insert(orders)
      .values({
        userId: session.userId,
        status: "paid",
        totalCents: session.totalCents,
        polarCheckoutId: checkoutId ?? session.polarCheckoutId ?? null,
        ...(polarOrderId ? { polarOrderId } : {}),
      })
      .returning();

    if (session.lines.length) {
      await tx.insert(orderItems).values(
        session.lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        })),
      );
    }

    await tx.delete(checkoutSession).where(eq(checkoutSession.id, sessionId));

    return true;
    })
}

const polarWebhookHandler = async (req: Request, res: Response) => {
    const env = getEnv()

    try {
        if (!env.POLAR_WEBHOOK_SECRET) {
            res.status(503).send("Polar webhooks not configured")
            return
        }

        const raw = req.body instanceof Buffer ? req.body : Buffer.from(String(req.body))
        const wh = new Webhook(Buffer.from(env.POLAR_WEBHOOK_SECRET, "utf-8").toString("base64"))

        const id = headerString(req.headers, "webhook-id")
        const ts = headerString(req.headers, "webhook-timestamp")
        const sig = headerString(req.headers, "webhook-signature")

        if (!id || !ts || !sig) {
            res.status(400).json({ error: "Missing webhook header" })
            return
        }

        wh.verify(raw, { "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": sig })

        const event = JSON.parse(raw.toString("utf-8")) as {
            type: string
            data?: Record<string, unknown>
        }

        if (event.type === "order.paid" && event.data) {
            const data = event.data
            const polarOrderId = typeof data.id === "string" ? data.id : undefined
            const checkoutId = typeof data.checkout_id === "string" ? data.checkout_id : undefined

            if(await alreadyPaid(polarOrderId, checkoutId)){
               res.json({ok: true, dublicate: true}) 
               return 
            }

            const sessionId = checkoutSessionIdFromMetadata(data)


            if(sessionId){
                const response = await fulfillCheckoutSession(sessionId, polarOrderId, checkoutId)

                if(response){
                    res.json({ok: true})
                    return
                }

                if(await alreadyPaid(polarOrderId, checkoutId)){
                    res.json({ok: true, dublicate: true})
                    return
                }

                console.error("polar order.paid: could not fullfill checkout session", {sessionId, checkoutId})

                res.status(500).json({error: "checkout fulfillment failed"})
            }
        }

        res.json({ok: true})



    } catch (error) {
        res.status(400).json({error: "Invalid webwook"})
    }
}

export {polarWebhookHandler}