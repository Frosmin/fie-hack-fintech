import prisma from "../config/prisma.js";

interface CreateSaleItemInput {
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string | null;
  saleId: number;
  productId: number;
}

interface UpdateSaleItemInput {
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  notes?: string | null;
  productId?: number;
}

const selectFields = {
  id: true,
  quantity: true,
  unitPrice: true,
  discount: true,
  subtotal: true,
  notes: true,
  createdAt: true,
  saleId: true,
  productId: true,
};

export async function create(data: CreateSaleItemInput) {
  const subtotal = data.quantity * data.unitPrice - (data.discount || 0);
  return prisma.saleItem.create({
    data: {
      ...data,
      subtotal,
    },
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.saleItem.findUnique({
    where: { id: Number(id) },
    select: selectFields,
  });
}

export async function findBySaleId(saleId: number) {
  return prisma.saleItem.findMany({
    where: { saleId },
    select: selectFields,
    orderBy: { createdAt: "asc" },
  });
}

export async function update(id: bigint | number, data: UpdateSaleItemInput) {
  const current = await prisma.saleItem.findUnique({
    where: { id: Number(id) },
    select: { quantity: true, unitPrice: true, discount: true },
  });

  if (!current) {
    throw new Error("SaleItem not found");
  }

  const quantity = Number(data.quantity ?? current.quantity);
  const unitPrice = Number(data.unitPrice ?? current.unitPrice);
  const discount = Number(data.discount ?? current.discount);
  const subtotal = quantity * unitPrice - discount;

  return prisma.saleItem.update({
    where: { id: Number(id) },
    data: {
      ...data,
      subtotal,
    },
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.saleItem.delete({
    where: { id: Number(id) },
  });
}