import { z } from "zod";

export const createSaleSchema = z.object({
  invoiceNumber: z.string().optional().nullable(),
  status: z.enum(["PENDIENTE", "CONFIRMADO", "COBRADO", "CANCELADO", "REEMBOLSADO"]).optional(),
  subtotal: z.number().positive(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().positive(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  locationAddress: z.string().optional().nullable(),
  locationCity: z.string().optional().nullable(),
  locationState: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  channel: z.enum(["WHATSAPP", "INSTAGRAM", "WEB", "TIENDA", "PERSONAL", "OTRO"]).optional(),
  notes: z.string().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  businessId: z.number().int().positive("El businessId es requerido"),
  paymentMethodId: z.number().int().positive("El paymentMethodId es requerido"),
  items: z.array(z.object({
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).optional(),
    notes: z.string().optional().nullable(),
    productId: z.number().int().positive(),
  })).min(1, "Al menos un item es requerido"),
});

export const updateSaleSchema = z.object({
  invoiceNumber: z.string().optional().nullable(),
  status: z.enum(["PENDIENTE", "CONFIRMADO", "COBRADO", "CANCELADO", "REEMBOLSADO"]).optional(),
  subtotal: z.number().positive().optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  locationAddress: z.string().optional().nullable(),
  locationCity: z.string().optional().nullable(),
  locationState: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  channel: z.enum(["WHATSAPP", "INSTAGRAM", "WEB", "TIENDA", "PERSONAL", "OTRO"]).optional(),
  notes: z.string().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  paymentMethodId: z.number().int().positive().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;