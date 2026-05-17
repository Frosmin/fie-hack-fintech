import type { NextFunction, Request, Response } from "express";
import * as saleService from "../services/sale.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createSaleSchema,
  updateSaleSchema,
} from "../schemas/sale.schema.js";

export async function createSale(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createSaleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const sale = await saleService.createSale(parsed.data);
    return res.status(201).json(serializeBigInt(sale));
  } catch (error) {
    next(error);
  }
}

export async function getSale(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const sale = await saleService.getSaleById(id);
    return res.status(200).json(serializeBigInt(sale));
  } catch (error) {
    next(error);
  }
}

export async function getAllSales(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sales = await saleService.getAllSales();
    return res.status(200).json(serializeBigInt(sales));
  } catch (error) {
    next(error);
  }
}

export async function getSalesByBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const businessId = Number(req.query.businessId);
    if (isNaN(businessId)) {
      throw new AppError("businessId inválido", 400);
    }

    const sales = await saleService.getSalesByBusinessId(businessId);
    return res.status(200).json(serializeBigInt(sales));
  } catch (error) {
    next(error);
  }
}

export async function updateSale(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateSaleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const sale = await saleService.updateSale(id, parsed.data);
    return res.status(200).json(serializeBigInt(sale));
  } catch (error) {
    next(error);
  }
}

export async function deleteSale(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await saleService.deleteSale(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}