import type { NextFunction, Request, Response } from "express";
import * as transactionService from "../services/transaction.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
  batchTransactionSchema,
} from "../schemas/transaction.schema.js";

export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const transaction = await transactionService.createTransaction(parsed.data);
    return res.status(201).json(serializeBigInt(transaction));
  } catch (error) {
    next(error);
  }
}

export async function getTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const transaction = await transactionService.getTransactionById(id);
    return res.status(200).json(serializeBigInt(transaction));
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsByActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const activityId = Number(req.query.activityId);
    if (isNaN(activityId)) {
      throw new AppError("activityId inválido", 400);
    }

    const transactions = await transactionService.getTransactionsByActivityId(activityId);
    return res.status(200).json(serializeBigInt(transactions));
  } catch (error) {
    next(error);
  }
}

export async function getAllTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const transactions = await transactionService.getAllTransactions();
    return res.status(200).json(serializeBigInt(transactions));
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const transaction = await transactionService.updateTransaction(id, parsed.data);
    return res.status(200).json(serializeBigInt(transaction));
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await transactionService.deleteTransaction(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function createBatchTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = batchTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      throw new AppError(firstError?.message ?? "Validation error", 400);
    }

    const { activityId, mode, transactions } = parsed.data;
    const result = await transactionService.createBatchTransactions(
      activityId,
      mode,
      transactions
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
