import { z } from "zod";

export const createTransactionSchema = z.object({
  nameCuate: z.string().min(1, "El nombre es requerido"),
  amount: z.number().positive("El monto debe ser positivo"),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "REFUND"]),
  description: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  activityId: z.number().int().positive("El activityId es requerido"),
});

export const updateTransactionSchema = z.object({
  nameCuate: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "REFUND"]).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
});

export const batchTransactionSchema = z.object({
  activityId: z.number().int().positive("El activityId es requerido"),
  mode: z.enum(["charge", "pay"]),
  transactions: z.array(
    z.object({
      nameCuate: z.string().min(1, "El nombre es requerido"),
      amount: z.union([
        z.number().positive("El monto debe ser positivo"),
        z.string().transform((val) => parseFloat(val)).pipe(z.number().positive("El monto debe ser positivo"))
      ]),
      type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "REFUND"]),
      description: z.string().optional().nullable(),
      bankName: z.string().optional().nullable(),
      accountNumber: z.string().optional().nullable(),
    })
  ).min(1, "Al menos una transacción es requerida").max(500, "Máximo 500 transacciones permitidas"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type BatchTransactionInput = z.infer<typeof batchTransactionSchema>;
