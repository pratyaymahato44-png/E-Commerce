import "dotenv/config"
import express from "express"
import { Request, Response, NextFunction } from "express"
import cors from "cors"
import {clerkMiddleware} from "@clerk/express"
import { clerkWebHookHandler } from "./webhooks/clerk.js"
import { polarWebhookHandler } from "./webhooks/polar.js"
import { getEnv } from "./lib/env.js"
import fs from "node:fs"
import path from "node:path"
import keepAliveCron from "./lib/cron.js"
import * as Sentry from "@sentry/node"
import { sentryClerkUserMiddleware } from "./middlewares/sentryClerkUser.middleware.js"

const env = getEnv()
const app = express()


const rawJson = express.raw({type: "application/json", limit: "1mb"})

app.post("/webhooks/clerk", rawJson, (req, res) => {
    void clerkWebHookHandler(req, res)
})

app.post("/webhooks/polar", rawJson, (req, res) => {
    void polarWebhookHandler(req, res)
})


const publicDir = path.join(process.cwd(), "public")

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get("/{*splat}", (req, res, next) => {
        if(req.method !== "GET" && req.method !== "HEAD"){
            next()
            return
        }
        if(req.path.startsWith("/api") || req.path.startsWith("/webhooks")){
            next()
            return
        }

        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err))
    })
    
}

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())
app.use(sentryClerkUserMiddleware)


app.get("/health", (_req, res) => {
    res.json({ok: true})
})

//import router here
import getUser from "./routes/user.router.js"
import getProduct from "./routes/product.router.js"
import streamRouter from "./routes/stream.router.js"
import checkoutRouter from "./routes/chekout.router.js" 
import adminRouter from "./routes/admin.router.js"
import orderRouter from "./routes/order.router.js"

app.use("/api/get-user", getUser)
app.use("/api/products", getProduct)
app.use("/api/stream", streamRouter)
app.use("api/checkout", checkoutRouter)
app.use("/api/admin", adminRouter)
app.use("/api/orders", orderRouter)

// sentry will be attached to the sresponse object
Sentry.setupExpressErrorHandler(app)
// Adding Error handler

app.use((_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const sentryId = (res as Response & {sentry?:string}).sentry

    res.status(500).json({
        error: "internal server error",
        ...(sentryId !== undefined && {sentryId})
    })
})


app.listen(env.PORT, () => {
    console.log("server is running on Port:", env.PORT);
    
    if(env.NODE_ENV === "production") {
        keepAliveCron.start()
    }
})