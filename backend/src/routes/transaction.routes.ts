import { Router, type Router as RouterType } from "express";
import {
  createTransaction,
  getTransaction,
  getAllTransactions,
  getTransactionsByActivity,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router: RouterType = Router();

router.post("/", createTransaction);
router.get("/", getTransactionsByActivity);
router.get("/all", getAllTransactions);
router.get("/:id", getTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
