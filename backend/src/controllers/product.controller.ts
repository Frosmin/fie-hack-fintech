import type { NextFunction, Request, Response } from "express";
import * as productService from "../services/product.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const product = await productService.createProduct(parsed.data);
    return res.status(201).json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const product = await productService.getProductById(id);
    return res.status(200).json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
}

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json(serializeBigInt(products));
  } catch (error) {
    next(error);
  }
}

export async function getProductsByBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const businessId = Number(req.query.businessId);
    if (isNaN(businessId)) {
      throw new AppError("businessId inválido", 400);
    }

    const products = await productService.getProductsByBusinessId(businessId);
    return res.status(200).json(serializeBigInt(products));
  } catch (error) {
    next(error);
  }
}

export async function getProductsByActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const activityId = Number(req.query.activityId);
    if (isNaN(activityId)) {
      throw new AppError("activityId inválido", 400);
    }

    const products = await productService.getProductsByActivityId(activityId);
    return res.status(200).json(serializeBigInt(products));
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const product = await productService.updateProduct(id, parsed.data);
    return res.status(200).json(serializeBigInt(product));
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await productService.deleteProduct(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}