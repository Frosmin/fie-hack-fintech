import type { NextFunction, Request, Response } from "express";
import { analyzeBudget, type BudgetInput } from "../services/calculator.service.js";
import AppError from "../errors/appError.js";

/**
 * POST /api/calculator/analyze
 * Receives a budget input payload and returns a full AI-powered analysis.
 */
export async function analyzeProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      productName,
      category,
      unitCost,
      sellingPrice,
      fixedCosts,
      variableCostPerUnit,
      estimatedMonthlySales,
      initialInvestment,
      salesChannel,
      analysisMonths,
    } = req.body;

    // ── Validations ──────────────────────────────────────────────────
    if (!productName || typeof productName !== "string") {
      throw new AppError("El nombre del producto es requerido", 400);
    }
    if (!category || typeof category !== "string") {
      throw new AppError("La categoría es requerida", 400);
    }

    const numericFields = {
      unitCost,
      sellingPrice,
      fixedCosts,
      variableCostPerUnit,
      estimatedMonthlySales,
      initialInvestment,
    };

    for (const [fieldName, value] of Object.entries(numericFields)) {
      if (value === undefined || value === null || isNaN(Number(value))) {
        throw new AppError(`El campo "${fieldName}" debe ser un número válido`, 400);
      }
      if (Number(value) < 0) {
        throw new AppError(`El campo "${fieldName}" no puede ser negativo`, 400);
      }
    }

    if (Number(sellingPrice) <= 0) {
      throw new AppError("El precio de venta debe ser mayor a cero", 400);
    }

    const input: BudgetInput = {
      productName: productName.trim(),
      category: category.trim(),
      unitCost: Number(unitCost),
      sellingPrice: Number(sellingPrice),
      fixedCosts: Number(fixedCosts),
      variableCostPerUnit: Number(variableCostPerUnit),
      estimatedMonthlySales: Number(estimatedMonthlySales),
      initialInvestment: Number(initialInvestment),
      salesChannel: (salesChannel || "presencial").trim(),
      analysisMonths: analysisMonths ? Number(analysisMonths) : 12,
    };

    const result = analyzeBudget(input);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
