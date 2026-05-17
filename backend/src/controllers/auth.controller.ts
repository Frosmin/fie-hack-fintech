import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new AppError("El nombre, correo y contraseña son requeridos", 400);
    }

    const result = await authService.registerUser({ email, password, name });
    return res.status(201).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("El correo y contraseña son requeridos", 400);
    }

    const result = await authService.loginUser({ email, password });
    return res.status(200).json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }
    return res.status(200).json(serializeBigInt({ user }));
  } catch (error) {
    next(error);
  }
}
