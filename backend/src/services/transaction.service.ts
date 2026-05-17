import * as transactionRepository from "../repositories/transaction.repository.js";
import prisma from "../config/prisma.js";
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

// DEPOSIT and REFUND add to balance, everything else subtracts
const INCOME_TYPES = new Set(["DEPOSIT", "REFUND"]);

export async function createTransaction(data: CreateTransactionInput) {
  const isIncome = INCOME_TYPES.has(data.type);
  const delta = isIncome ? data.amount : -data.amount;

  // Look up the activity to find its parent business
  const activity = await prisma.activity.findUnique({
    where: { id: data.activityId },
    select: { businessId: true },
  });

  if (!activity) {
    throw new AppError("Actividad no encontrada", 404);
  }

  // Use interactive transaction for PrismaPg adapter compatibility
  const transaction = await prisma.$transaction(async (tx) => {
    const created = await tx.bankTransaction.create({ data });

    await tx.activity.update({
      where: { id: data.activityId },
      data: { activityMoney: { increment: delta } },
    });

    await tx.business.update({
      where: { id: Number(activity.businessId) },
      data: { BusinessMoney: { increment: delta } },
    });

    return created;
  });

  return transaction;
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
