import { Router } from "express"
import { createStreamChannel, createVideoInvite, getOrder, listOrders } from "../controllers/order.controller.js"

const router = Router()

router.route("/").get(listOrders)
router.route("/:id").get(getOrder)
router.route("/:id/stream-channel").post(createStreamChannel)
router.route("/:id/video-inite").post(createVideoInvite)


export default router