import * as productRepository from "../repositories/product.repository.js";
import AppError from "../errors/appError.js";

interface CreateProductInput {
  name: string;
  description?: string | null;
  sku?: string | null;
  basePrice: number;
  cost?: number | null;
  unit?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  businessId: number;
  activityId?: number | null;
}

interface UpdateProductInput {
  name?: string;
  description?: string | null;
  sku?: string | null;
  basePrice?: number;
  cost?: number | null;
  unit?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  activityId?: number | null;
}

export async function createProduct(data: CreateProductInput) {
  return productRepository.create(data);
}

export async function getProductById(id: bigint | number) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }
  return product;
}

export async function getAllProducts() {
  return productRepository.findAll();
}

export async function getProductsByBusinessId(businessId: number) {
  return productRepository.findByBusinessId(businessId);
}

export async function getProductsByActivityId(activityId: number) {
  return productRepository.findByActivityId(activityId);
}

export async function updateProduct(
  id: bigint | number,
  data: UpdateProductInput,
) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }
  return productRepository.update(id, data);
}

export async function deleteProduct(id: bigint | number) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }
  await productRepository.deleteById(id);
  return { deleted: true };
}