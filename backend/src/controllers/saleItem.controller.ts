import type { NextFunction, Request, Response } from "express";
import * as saleItemService from "../services/saleItem.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createSaleItemSchema,
  updateSaleItemSchema,
} from "../schemas/saleItem.schema.js";

export async function createSaleItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createSaleItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const item = await saleItemService.createSaleItem(parsed.data);
    return res.status(201).json(serializeBigInt(item));
  } catch (error) {
    next(error);
  }
}

export async function getSaleItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const item = await saleItemService.getSaleItemById(id);
    return res.status(200).json(serializeBigInt(item));
  } catch (error) {
    next(error);
  }
}

export async function getSaleItemsBySale(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const saleId = Number(req.params.saleId);
    if (isNaN(saleId)) {
      throw new AppError("saleId inválido", 400);
    }

    const items = await saleItemService.getSaleItemsBySaleId(saleId);
    return res.status(200).json(serializeBigInt(items));
  } catch (error) {
    next(error);
  }
}

export async function updateSaleItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateSaleItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const item = await saleItemService.updateSaleItem(id, parsed.data);
    return res.status(200).json(serializeBigInt(item));
  } catch (error) {
    next(error);
  }
}

export async function deleteSaleItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await saleItemService.deleteSaleItem(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}