import * as transactionRepository from "../repositories/transaction.repository.js";
import AppError from "../errors/appError.js";

interface CreateTransactionInput {
  nameCuate: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "REFUND";
  description?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  activityId: number;
}

interface UpdateTransactionInput {
  nameCuate?: string;
  amount?: number;
  type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "REFUND";
  description?: string | null;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  bankName?: string | null;
  accountNumber?: string | null;
}

export async function createTransaction(data: CreateTransactionInput) {
  return transactionRepository.create(data);
}

export async function getTransactionById(id: bigint | number) {
  const transaction = await transactionRepository.findById(id);
  if (!transaction) {
    throw new AppError("Transacción no encontrada", 404);
  }
  return transaction;
}

export async function getTransactionsByActivityId(activityId: number) {
  return transactionRepository.findByActivityId(activityId);
}

export async function getAllTransactions() {
  return transactionRepository.findAll();
}

export async function updateTransaction(
  id: bigint | number,
  data: UpdateTransactionInput,
) {
  const transaction = await transactionRepository.findById(id);
  if (!transaction) {
    throw new AppError("Transacción no encontrada", 404);
  }
  return transactionRepository.update(id, data);
}

export async function deleteTransaction(id: bigint | number) {
  const transaction = await transactionRepository.findById(id);
  if (!transaction) {
    throw new AppError("Transacción no encontrada", 404);
  }
  await transactionRepository.deleteById(id);
  return { deleted: true };
}
