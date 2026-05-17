import { Router } from "express";
import {
  createProduct,
  getProduct,
  getAllProducts,
  getProductsByBusiness,
  getProductsByActivity,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router: Router = Router();

router.post("/", createProduct);
router.get("/", getProductsByBusiness);
router.get("/all", getAllProducts);
router.get("/activity/:activityId", getProductsByActivity);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;