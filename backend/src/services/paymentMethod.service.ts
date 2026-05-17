import * as paymentMethodRepository from "../repositories/paymentMethod.repository.js";
import AppError from "../errors/appError.js";

interface CreatePaymentMethodInput {
  name: string;
  type: "CASH" | "CARD" | "TRANSFER" | "WALLET" | "OTHER";
  icon?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

interface UpdatePaymentMethodInput {
  name?: string;
  type?: "CASH" | "CARD" | "TRANSFER" | "WALLET" | "OTHER";
  icon?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

export async function createPaymentMethod(data: CreatePaymentMethodInput) {
  return paymentMethodRepository.create(data);
}

export async function getPaymentMethodById(id: bigint | number) {
  const paymentMethod = await paymentMethodRepository.findById(id);
  if (!paymentMethod) {
    throw new AppError("Método de pago no encontrado", 404);
  }
  return paymentMethod;
}

export async function getAllPaymentMethods() {
  return paymentMethodRepository.findAll();
}

export async function getActivePaymentMethods() {
  return paymentMethodRepository.findActive();
}

export async function updatePaymentMethod(
  id: bigint | number,
  data: UpdatePaymentMethodInput,
) {
  const paymentMethod = await paymentMethodRepository.findById(id);
  if (!paymentMethod) {
    throw new AppError("Método de pago no encontrado", 404);
  }
  return paymentMethodRepository.update(id, data);
}

export async function deletePaymentMethod(id: bigint | number) {
  const paymentMethod = await paymentMethodRepository.findById(id);
  if (!paymentMethod) {
    throw new AppError("Método de pago no encontrado", 404);
  }
  await paymentMethodRepository.deleteById(id);
  return { deleted: true };
}