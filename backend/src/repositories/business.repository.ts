import prisma from "../config/prisma.js";

interface CreateBusinessInput {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
  userId: number;
}

interface UpdateBusinessInput {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

const selectFields = {
  id: true,
  name: true,
  description: true,
  logoUrl: true,
  address: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
};

export async function create(data: CreateBusinessInput) {
  return prisma.business.create({
    data,
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.business.findUnique({
    where: { id: Number(id) },
    select: selectFields,
  });
}

export async function findAll() {
  return prisma.business.findMany({
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function findByUserId(userId: number) {
  return prisma.business.findMany({
    where: { userId },
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function update(id: bigint | number, data: UpdateBusinessInput) {
  return prisma.business.update({
    where: { id: Number(id) },
    data,
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.business.delete({
    where: { id: Number(id) },
  });
}