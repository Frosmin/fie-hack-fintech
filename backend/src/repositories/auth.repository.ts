import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import AppError from "../errors/appError.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterInput) {
  const { name, email, password } = userData;

  const createdAt = new Date();
  const passwordHash = await bcrypt.hash(password, 10);
  const role = "analyst";
  const newUser = {
    name,
    email,
    passwordHash,
    role,
    createdAt,
  };

  const userCreated = await prisma.user.create({
    data: newUser,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!userCreated) {
    throw new AppError("Failed to create user", 500);
  }

  return userCreated;
}
