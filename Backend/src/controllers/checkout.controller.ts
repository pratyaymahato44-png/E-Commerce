import type { Request, Response, NextFunction } from "express"
import { getEnv } from "../lib/env.js"
import z from "zod"
import { getAuth } from "@clerk/express"

import { getLocalUser } from "../lib/user.js"
import { db } from "../db/index.js"
import { and, eq, inArray } from "drizzle-orm"
import { products, CheckoutSessionLine, checkoutSession } from "../db/schema.js"
import { polarCreateCheckout } from "../lib/polar.js"

const env = getEnv()

const cartSchema = z.object({
    items: z.array(
        z.object({
            productId: z.uuid(),
            quantity: z.number().int().positive()
        })
    ).min(1)
})
const createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            res.status(401).json({ error: "Unauthorized Access" })
            return
        }
        const parsed = cartSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid cart", details: parsed.error.flatten })
            return
        }

        // polar access token is required
        if (!env.POLAR_ACCESS_TOKEN) {
            res.status(503).json({ error: "Payment is not configured" })
            return
        }

        const localUser = await getLocalUser(userId)

        if (!localUser) {
            res.status(503).json({ error: "Account not synced yet" })
            return
        }

        const ids = parsed.data.items.map((id) => id.productId)

        const prodRows = await db
            .select()
            .from(products)
            .where(and(inArray(products.id, ids), eq(products.active, true)))

        if (prodRows.length !== ids.length) {
            res.status(400).json({ error: "One or more products are invalid" })
            return
        }

        //calculate actual price
        const byId = new Map(prodRows.map((p) => [p.id, p]));
        let totalCents = 0;
        const lines: CheckoutSessionLine[] = [];

        for (const line of parsed.data.items) {
            const p = byId.get(line.productId)!;
            totalCents += p.priceCents * line.quantity;
            lines.push({
                productId: p.id,
                quantity: line.quantity,
                unitPriceCents: p.priceCents,
            });
        }

        if (totalCents < 10) {
            res.status(400).json({
                error: "Total below Polar minimum (e.g. USD requires at least 10 cents)",
            });
            return;
        }

        const [session] = await db
            .insert(checkoutSession)
            .values({
                userId: localUser.id,
                lines,
                totalCents,
                currency: "usd",
            })
            .returning();

            const successUrl = `${env.CORS_ORIGIN}/checkout/return?checkout_id={CHECKOUT_ID}`
            const returnUrl = `${env.CORS_ORIGIN}/cart`

            const checkout = await polarCreateCheckout(env, {
                products: [env.POLAR_CHECKOUT_PRODUCT_ID],
                prices: {
                    [env.POLAR_CHECKOUT_PRODUCT_ID]: [
                        {
                            amount_type: "fixed",
                            price_currency: "usd",
                            price_amount: totalCents
                        }
                    ]
                },
                success_url: successUrl,
                return_url: returnUrl,
                external_customer_id: userId,
                metadata: {checkout_session_id: session.id}
            })

            await db.update(checkoutSession)
            .set({polarCheckoutId: checkout.id})
            .where(eq(checkoutSession.id, session.id))

            res.json({checkoutUrl: checkout.url})
    } catch (error) {
        next(error)
    }
}

export {
    createCheckout
}