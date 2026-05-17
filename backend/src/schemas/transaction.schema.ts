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

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
