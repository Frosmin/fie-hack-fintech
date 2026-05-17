import { Router } from "express";
import {
  createSaleItem,
  getSaleItem,
  getSaleItemsBySale,
  updateSaleItem,
  deleteSaleItem,
} from "../controllers/saleItem.controller.js";

const router: Router = Router();

router.post("/", createSaleItem);
router.get("/sale/:saleId", getSaleItemsBySale);
router.get("/:id", getSaleItem);
router.put("/:id", updateSaleItem);
router.delete("/:id", deleteSaleItem);

export default router;