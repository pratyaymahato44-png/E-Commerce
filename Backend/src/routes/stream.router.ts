import { Router } from "express";
import { createStreamToken } from "../controllers/stream.controller.js";

const router = Router()


router.route("/token").post(createStreamToken)


export default router