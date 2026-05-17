import prisma from "../config/prisma.js";

interface CreateActivityInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
  businessId: number;
}

interface UpdateActivityInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
}

const selectFields = {
  id: true,
  name: true,
  description: true,
  icon: true,
  qr_url: true,
  activityMoney: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  businessId: true,
};

export async function create(data: CreateActivityInput) {
  return prisma.activity.create({
    data,
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.activity.findUnique({
    where: { id: Number(id) },
    select: selectFields,
  });
}

export async function findAll() {
  return prisma.activity.findMany({
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function findByBusinessId(businessId: number) {
  return prisma.activity.findMany({
    where: { businessId },
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function update(id: bigint | number, data: UpdateActivityInput) {
  return prisma.activity.update({
    where: { id: Number(id) },
    data,
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.activity.delete({
    where: { id: Number(id) },
  });
}