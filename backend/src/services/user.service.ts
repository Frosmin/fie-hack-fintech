import * as userRepository from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import AppError from "../errors/appError.js";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
}

interface UserPayload {
  id: bigint | string;
  email: string;
  name: string;
  role: string;
  createdAt?: Date;
}

export async function createUser(data: CreateUserInput) {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new AppError("El usuario ya existe", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const role = data.role || "analyst";

  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role,
  });

  return user;
}

export async function getUserById(id: bigint | number) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return user;
}

export async function getAllUsers() {
  return userRepository.findAll();
}

export async function updateUser(id: bigint | number, data: UpdateUserInput) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("El email ya está en uso", 409);
    }
  }

  return userRepository.update(id, data);
}

export async function deleteUser(id: bigint | number) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  await userRepository.deleteById(id);
  return { deleted: true };
}