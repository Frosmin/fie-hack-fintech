import { z } from "zod";

export const createSaleItemSchema = z.object({
  quantity: z.number().positive("La cantidad debe ser positiva"),
  unitPrice: z.number().positive("El precio unitario debe ser positivo"),
  discount: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  saleId: z.number().int().positive("El saleId es requerido"),
  productId: z.number().int().positive("El productId es requerido"),
});

export const updateSaleItemSchema = z.object({
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  productId: z.number().int().positive().optional(),
});

export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;
export type UpdateSaleItemInput = z.infer<typeof updateSaleItemSchema>;