import { Router } from "express";
import { addAdminProduct, deleteAdminProduct, getImagekitAuth, listAdminProducts, requireAdmin, updateAdminProduct } from "../controllers/admin.controller.js";

const router = Router()

router.use(requireAdmin)
router.route("/imagekit/auth").get(getImagekitAuth)
router.route("/products").get(listAdminProducts)
router.route("/products").post(addAdminProduct)
router.route("/products/:id").patch(updateAdminProduct)
router.route("/products/:id").delete(deleteAdminProduct)

export default router