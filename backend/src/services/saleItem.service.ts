import * as saleItemRepository from "../repositories/saleItem.repository.js";
import AppError from "../errors/appError.js";

interface CreateSaleItemInput {
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string | null;
  saleId: number;
  productId: number;
}

interface UpdateSaleItemInput {
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  notes?: string | null;
  productId?: number;
}

export async function createSaleItem(data: CreateSaleItemInput) {
  return saleItemRepository.create(data);
}

export async function getSaleItemById(id: bigint | number) {
  const item = await saleItemRepository.findById(id);
  if (!item) {
    throw new AppError("Item de venta no encontrado", 404);
  }
  return item;
}

export async function getSaleItemsBySaleId(saleId: number) {
  return saleItemRepository.findBySaleId(saleId);
}

export async function updateSaleItem(
  id: bigint | number,
  data: UpdateSaleItemInput,
) {
  const item = await saleItemRepository.findById(id);
  if (!item) {
    throw new AppError("Item de venta no encontrado", 404);
  }
  return saleItemRepository.update(id, data);
}

export async function deleteSaleItem(id: bigint | number) {
  const item = await saleItemRepository.findById(id);
  if (!item) {
    throw new AppError("Item de venta no encontrado", 404);
  }
  await saleItemRepository.deleteById(id);
  return { deleted: true };
}