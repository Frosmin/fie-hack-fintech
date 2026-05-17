import { Router } from "express";
import {
  createSale,
  getSale,
  getAllSales,
  getSalesByBusiness,
  updateSale,
  deleteSale,
} from "../controllers/sale.controller.js";

const router: Router = Router();

router.post("/", createSale);
router.get("/", getSalesByBusiness);
router.get("/all", getAllSales);
router.get("/:id", getSale);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

export default router;