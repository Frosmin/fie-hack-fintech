import prisma from "../config/prisma.js";

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

const selectFields = {
  id: true,
  nameCuate: true,
  amount: true,
  type: true,
  description: true,
  date: true,
  status: true,
  bankName: true,
  accountNumber: true,
  createdAt: true,
  updatedAt: true,
  activityId: true,
};

export async function create(data: CreateTransactionInput) {
  return prisma.bankTransaction.create({
    data,
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.bankTransaction.findUnique({
    where: { id: Number(id) },
    select: selectFields,
  });
}

export async function findByActivityId(activityId: number) {
  return prisma.bankTransaction.findMany({
    where: { activityId },
    select: selectFields,
    orderBy: { date: "desc" },
  });
}

export async function findAll() {
  return prisma.bankTransaction.findMany({
    select: selectFields,
    orderBy: { date: "desc" },
  });
}

export async function update(id: bigint | number, data: UpdateTransactionInput) {
  return prisma.bankTransaction.update({
    where: { id: Number(id) },
    data,
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.bankTransaction.delete({
    where: { id: Number(id) },
  });
}
