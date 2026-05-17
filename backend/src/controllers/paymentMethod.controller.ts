import type { NextFunction, Request, Response } from "express";
import * as paymentMethodService from "../services/paymentMethod.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "../schemas/paymentMethod.schema.js";

export async function createPaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createPaymentMethodSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const paymentMethod = await paymentMethodService.createPaymentMethod(parsed.data);
    return res.status(201).json(serializeBigInt(paymentMethod));
  } catch (error) {
    next(error);
  }
}

export async function getPaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const paymentMethod = await paymentMethodService.getPaymentMethodById(id);
    return res.status(200).json(serializeBigInt(paymentMethod));
  } catch (error) {
    next(error);
  }
}

export async function getAllPaymentMethods(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const activeOnly = req.query.active === "true";
    const paymentMethods = activeOnly
      ? await paymentMethodService.getActivePaymentMethods()
      : await paymentMethodService.getAllPaymentMethods();
    return res.status(200).json(serializeBigInt(paymentMethods));
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updatePaymentMethodSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const paymentMethod = await paymentMethodService.updatePaymentMethod(id, parsed.data);
    return res.status(200).json(serializeBigInt(paymentMethod));
  } catch (error) {
    next(error);
  }
}

export async function deletePaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await paymentMethodService.deletePaymentMethod(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}