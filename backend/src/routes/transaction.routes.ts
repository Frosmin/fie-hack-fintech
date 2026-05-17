import { Router, type Router as RouterType } from "express";
import {
  createTransaction,
  getTransaction,
  getAllTransactions,
  getTransactionsByActivity,
  updateTransaction,
  deleteTransaction,
  createBatchTransactions,
} from "../controllers/transaction.controller.js";

const router: RouterType = Router();

router.post("/", createTransaction);
router.post("/batch", createBatchTransactions);
router.get("/", getTransactionsByActivity);
router.get("/all", getAllTransactions);
router.get("/:id", getTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
