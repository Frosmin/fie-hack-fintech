import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../schemas/user.schema.js";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const user = await userService.createUser(parsed.data);
    return res.status(201).json(serializeBigInt(user));
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const user = await userService.getUserById(id);
    return res.status(200).json(serializeBigInt(user));
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json(serializeBigInt(users));
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const user = await userService.updateUser(id, parsed.data);
    return res.status(200).json(serializeBigInt(user));
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await userService.deleteUser(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}