import { Router } from "express";
import { getCategory, getProductBySlug, listProduct } from "../controllers/product.controller.js";

const router = Router()

router.route("/").get(listProduct)
router.route("/categories").get(getCategory)
router.route("/:slug").get(getProductBySlug)


export default router