import prisma from "../config/prisma.js";

interface CreateProductInput {
  name: string;
  description?: string | null;
  sku?: string | null;
  basePrice: number;
  cost?: number | null;
  unit?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  businessId: number;
  activityId?: number | null;
}

interface UpdateProductInput {
  name?: string;
  description?: string | null;
  sku?: string | null;
  basePrice?: number;
  cost?: number | null;
  unit?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  activityId?: number | null;
}

const selectFields = {
  id: true,
  name: true,
  description: true,
  sku: true,
  basePrice: true,
  cost: true,
  unit: true,
  imageUrl: true,
  isActive: true,
  minPrice: true,
  maxPrice: true,
  createdAt: true,
  updatedAt: true,
  businessId: true,
  activityId: true,
};

export async function create(data: CreateProductInput) {
  return prisma.product.create({
    data,
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.product.findUnique({
    where: { id: Number(id) },
    select: selectFields,
  });
}

export async function findAll() {
  return prisma.product.findMany({
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function findByBusinessId(businessId: number) {
  return prisma.product.findMany({
    where: { businessId },
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function findByActivityId(activityId: number) {
  return prisma.product.findMany({
    where: { activityId },
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function update(id: bigint | number, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id: Number(id) },
    data,
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.product.delete({
    where: { id: Number(id) },
  });
}