import prisma from "../config/prisma.js";

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
  items: {
    quantity: number;
    unitPrice: number;
    discount?: number;
    notes?: string | null;
    productId: number;
  }[];
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

const selectFields = {
  id: true,
  invoiceNumber: true,
  status: true,
  subtotal: true,
  taxAmount: true,
  totalAmount: true,
  customerName: true,
  customerPhone: true,
  customerEmail: true,
  locationAddress: true,
  locationCity: true,
  locationState: true,
  latitude: true,
  longitude: true,
  channel: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  businessId: true,
  paymentMethodId: true,
};

export async function create(data: CreateSaleInput) {
  return prisma.sale.create({
    data: {
      ...data,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      items: {
        create: data.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          subtotal: item.quantity * item.unitPrice - (item.discount || 0),
          notes: item.notes,
          productId: item.productId,
        })),
      },
    },
    select: selectFields,
  });
}

export async function findById(id: bigint | number) {
  return prisma.sale.findUnique({
    where: { id: Number(id) },
    select: {
      ...selectFields,
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          discount: true,
          subtotal: true,
          notes: true,
          productId: true,
        },
      },
    },
  });
}

export async function findAll() {
  return prisma.sale.findMany({
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function findByBusinessId(businessId: number) {
  return prisma.sale.findMany({
    where: { businessId },
    select: selectFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function update(id: bigint | number, data: UpdateSaleInput) {
  const updateData = {
    ...data,
    completedAt: data.completedAt ? new Date(data.completedAt as unknown as string) : undefined,
  };
  return prisma.sale.update({
    where: { id: Number(id) },
    data: updateData,
    select: selectFields,
  });
}

export async function deleteById(id: bigint | number) {
  return prisma.sale.delete({
    where: { id: Number(id) },
  });
}