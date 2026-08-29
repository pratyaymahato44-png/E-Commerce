import "dotenv/config"
import express from "express"
import cors from "cors"
import {clerkMiddleware} from "@clerk/express"
import { clerkWebHookHandler } from "./webhooks/clerk.js"
import { getEnv } from "./lib/env.js"

const env = getEnv()
const app = express()


const rawJson = express.raw({type: "application/json", limit: "1mb"})

app.post("/webhook/clerk", rawJson, (req, res) => {
    void clerkWebHookHandler(req, res)
})

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())



app.listen(env.PORT, () => {
    console.log("server is running on Port:", env.PORT);
    
})