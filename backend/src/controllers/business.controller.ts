import type { NextFunction, Request, Response } from "express";
import * as businessService from "../services/business.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createBusinessSchema,
  updateBusinessSchema,
} from "../schemas/business.schema.js";

export async function createBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createBusinessSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const business = await businessService.createBusiness(parsed.data);
    return res.status(201).json(serializeBigInt(business));
  } catch (error) {
    next(error);
  }
}

export async function getBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const business = await businessService.getBusinessById(id);
    return res.status(200).json(serializeBigInt(business));
  } catch (error) {
    next(error);
  }
}

export async function getAllBusinesses(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const businesses = await businessService.getAllBusinesses();
    return res.status(200).json(serializeBigInt(businesses));
  } catch (error) {
    next(error);
  }
}

export async function getBusinessesByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.query.userId);
    if (isNaN(userId)) {
      throw new AppError("userId inválido", 400);
    }

    const businesses = await businessService.getBusinessesByUserId(userId);
    return res.status(200).json(serializeBigInt(businesses));
  } catch (error) {
    next(error);
  }
}

export async function updateBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateBusinessSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const business = await businessService.updateBusiness(id, parsed.data);
    return res.status(200).json(serializeBigInt(business));
  } catch (error) {
    next(error);
  }
}

export async function deleteBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await businessService.deleteBusiness(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}