import { Router } from "express";
import {
  createPaymentMethod,
  getPaymentMethod,
  getAllPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentMethod.controller.js";

const router: Router = Router();

router.post("/", createPaymentMethod);
router.get("/", getAllPaymentMethods);
router.get("/:id", getPaymentMethod);
router.put("/:id", updatePaymentMethod);
router.delete("/:id", deletePaymentMethod);

export default router;