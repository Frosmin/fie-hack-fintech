import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["CASH", "CARD", "TRANSFER", "WALLET", "OTHER"], { message: "Tipo inválido" }),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["CASH", "CARD", "TRANSFER", "WALLET", "OTHER"]).optional(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;