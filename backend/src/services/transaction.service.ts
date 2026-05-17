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

interface BatchTransactionItem {
  nameCuate: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "REFUND";
  description?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
}

export interface BatchResult {
  success: boolean;
  created: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
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

const CHARGE_TYPES = new Set(["DEPOSIT", "REFUND"]);
const PAY_TYPES = new Set(["PAYMENT", "WITHDRAWAL", "TRANSFER"]);

export async function createBatchTransactions(
  activityId: number,
  mode: "charge" | "pay",
  transactions: BatchTransactionItem[]
): Promise<BatchResult> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { businessId: true },
  });

  if (!activity) {
    throw new AppError("Actividad no encontrada", 404);
  }

  const allowedTypes = mode === "charge" ? CHARGE_TYPES : PAY_TYPES;
  const errors: Array<{ row: number; message: string }> = [];
  const validTransactions: BatchTransactionItem[] = [];

  transactions.forEach((tx, index) => {
    if (!tx.nameCuate || tx.nameCuate.trim() === "") {
      errors.push({ row: index + 1, message: `Fila ${index + 1}: El nombre es requerido` });
      return;
    }

    if (!allowedTypes.has(tx.type)) {
      const validOptions = mode === "charge" ? "DEPOSIT, REFUND" : "PAYMENT, WITHDRAWAL, TRANSFER";
      errors.push({ row: index + 1, message: `Fila ${index + 1}: Tipo '${tx.type}' inválido. Para ${mode === "charge" ? "cobros" : "pagos"} use: ${validOptions}` });
      return;
    }

    if (typeof tx.amount !== "number" || tx.amount <= 0) {
      errors.push({ row: index + 1, message: `Fila ${index + 1}: El monto debe ser un número positivo` });
      return;
    }

    validTransactions.push(tx);
  });

  if (validTransactions.length === 0) {
    return {
      success: false,
      created: 0,
      failed: transactions.length,
      errors,
    };
  }

  let totalDelta = 0;
  const createdTransactions = await prisma.$transaction(async (tx) => {
    const created: number[] = [];

    for (const txData of validTransactions) {
      const isIncome = INCOME_TYPES.has(txData.type);
      const delta = isIncome ? txData.amount : -txData.amount;
      totalDelta += delta;

      await tx.bankTransaction.create({
        data: {
          nameCuate: txData.nameCuate,
          amount: txData.amount,
          type: txData.type,
          description: txData.description || null,
          bankName: txData.bankName || null,
          accountNumber: txData.accountNumber || null,
          activityId,
          status: "PENDING",
        },
      });
      created.push(1);
    }

    if (totalDelta !== 0) {
      await tx.activity.update({
        where: { id: activityId },
        data: { activityMoney: { increment: totalDelta } },
      });

      await tx.business.update({
        where: { id: Number(activity.businessId) },
        data: { BusinessMoney: { increment: totalDelta } },
      });
    }

    return created;
  });

  return {
    success: errors.length === 0,
    created: validTransactions.length,
    failed: errors.length,
    errors,
  };
}
