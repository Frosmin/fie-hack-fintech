import * as saleRepository from "../repositories/sale.repository.js";
import AppError from "../errors/appError.js";

interface SaleItemInput {
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string | null;
  productId: number;
}

interface CreateSaleInput {
  invoiceNumber?: string | null;
  status?: "PENDIENTE" | "CONFIRMADO" | "COBRADO" | "CANCELADO" | "REEMBOLSADO";
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  channel?: "WHATSAPP" | "INSTAGRAM" | "WEB" | "TIENDA" | "PERSONAL" | "OTRO";
  notes?: string | null;
  completedAt?: Date | string | null;
  businessId: number;
  paymentMethodId: number;
  items: SaleItemInput[];
}

interface UpdateSaleInput {
  invoiceNumber?: string | null;
  status?: "PENDIENTE" | "CONFIRMADO" | "COBRADO" | "CANCELADO" | "REEMBOLSADO";
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  channel?: "WHATSAPP" | "INSTAGRAM" | "WEB" | "TIENDA" | "PERSONAL" | "OTRO";
  notes?: string | null;
  completedAt?: Date | string | null;
  paymentMethodId?: number;
}

export async function createSale(data: CreateSaleInput) {
  return saleRepository.create(data);
}

export async function getSaleById(id: bigint | number) {
  const sale = await saleRepository.findById(id);
  if (!sale) {
    throw new AppError("Venta no encontrada", 404);
  }
  return sale;
}

export async function getAllSales() {
  return saleRepository.findAll();
}

export async function getSalesByBusinessId(businessId: number) {
  return saleRepository.findByBusinessId(businessId);
}

export async function updateSale(id: bigint | number, data: UpdateSaleInput) {
  const sale = await saleRepository.findById(id);
  if (!sale) {
    throw new AppError("Venta no encontrada", 404);
  }
  return saleRepository.update(id, data);
}

export async function deleteSale(id: bigint | number) {
  const sale = await saleRepository.findById(id);
  if (!sale) {
    throw new AppError("Venta no encontrada", 404);
  }
  await saleRepository.deleteById(id);
  return { deleted: true };
}