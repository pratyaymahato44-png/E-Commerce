import type { Request, Response, NextFunction } from "express";
import { getLocalUser } from "../lib/user.js"
import { getAuth } from "@clerk/express"



const getUser =  async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {userId, isAuthenticated} = getAuth(req)
        if(!isAuthenticated || !userId) {
            res.status(401).json({error: "Unauthorized"})
            return
        }

        const user = await getLocalUser(userId)
        res.json({user})
    } catch (error) {
        next(error)
    }
}

export {
    getUser
}