import prisma from "../config/prisma.js";

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
}

export async function create(data: CreateUserInput) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function findById(id: bigint | number) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function findAll() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function update(id: bigint | number, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id: Number(id) },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.user.delete({
    where: { id: Number(id) },
  });
}