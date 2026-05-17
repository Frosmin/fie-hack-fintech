import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  basePrice: z.number().positive("El precio base debe ser positivo"),
  cost: z.number().positive().optional().nullable(),
  unit: z.string().optional().default("unidad"),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  minPrice: z.number().positive().optional().nullable(),
  maxPrice: z.number().positive().optional().nullable(),
  businessId: z.number().int().positive("El businessId es requerido"),
  activityId: z.number().int().positive().optional().nullable(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  basePrice: z.number().positive().optional(),
  cost: z.number().positive().optional().nullable(),
  unit: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  minPrice: z.number().positive().optional().nullable(),
  maxPrice: z.number().positive().optional().nullable(),
  activityId: z.number().int().positive().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;