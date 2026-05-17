import prisma from "../config/prisma.js";

interface CreatePaymentMethodInput {
  name: string;
  type: "CASH" | "CARD" | "TRANSFER" | "WALLET" | "OTHER";
  icon?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

interface UpdatePaymentMethodInput {
  name?: string;
  type?: "CASH" | "CARD" | "TRANSFER" | "WALLET" | "OTHER";
  icon?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

const selectFields = {
  id: true,
  name: true,
  type: true,
  icon: true,
  isActive: true,
  isDefault: true,
  sortOrder: true,
};

export async function create(data: CreatePaymentMethodInput) {
  return prisma.paymentMethod.create({
    data,
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.paymentMethod.findUnique({
    where: { id: Number(id) },
    select: selectFields,
  });
}

export async function findAll() {
  return prisma.paymentMethod.findMany({
    select: selectFields,
    orderBy: { sortOrder: "asc" },
  });
}

export async function findActive() {
  return prisma.paymentMethod.findMany({
    where: { isActive: true },
    select: selectFields,
    orderBy: { sortOrder: "asc" },
  });
}

export async function update(id: bigint | number, data: UpdatePaymentMethodInput) {
  return prisma.paymentMethod.update({
    where: { id: Number(id) },
    data,
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.paymentMethod.delete({
    where: { id: Number(id) },
  });
}