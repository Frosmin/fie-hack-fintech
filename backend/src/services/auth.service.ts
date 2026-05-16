import * as userRepository from "../repositories/users.repository.ts";
import * as authRepository from "../repositories/auth.repository.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../errors/appError.ts";
import { DEFAULTS } from "../config";

export async function registerUser(userData) {
  const { email } = userData;

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Usuario ya existe", 409);
  }

  const createdUser = await authRepository.registerUser(userData);
  const token = signToken(createdUser);
  return {
    token,
    user: sanitize(createdUser),
  };
}

export async function loginUser(userData) {
  const { email, password } = userData;

  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const token = signToken(user);
  return {
    token,
    user: sanitize(user),
  };
}

function signToken(user) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role || "analyst",
  };
  const secret = DEFAULTS.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret is not configured", 500);
  }
  return jwt.sign(payload, secret, { expiresIn: DEFAULTS.JWT_EXPIRES_IN });
}

function sanitize(user) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
}
