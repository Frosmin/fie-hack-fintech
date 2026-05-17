import * as businessRepository from "../repositories/business.repository.js";
import AppError from "../errors/appError.js";

interface CreateBusinessInput {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
  userId: number;
}

interface UpdateBusinessInput {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

export async function createBusiness(data: CreateBusinessInput) {
  return businessRepository.create(data);
}

export async function getBusinessById(id: bigint | number) {
  const business = await businessRepository.findById(id);
  if (!business) {
    throw new AppError("Negocio no encontrado", 404);
  }
  return business;
}

export async function getAllBusinesses() {
  return businessRepository.findAll();
}

export async function getBusinessesByUserId(userId: number) {
  return businessRepository.findByUserId(userId);
}

export async function updateBusiness(
  id: bigint | number,
  data: UpdateBusinessInput,
) {
  const business = await businessRepository.findById(id);
  if (!business) {
    throw new AppError("Negocio no encontrado", 404);
  }
  return businessRepository.update(id, data);
}

export async function deleteBusiness(id: bigint | number) {
  const business = await businessRepository.findById(id);
  if (!business) {
    throw new AppError("Negocio no encontrado", 404);
  }
  await businessRepository.deleteById(id);
  return { deleted: true };
}