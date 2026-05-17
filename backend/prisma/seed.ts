import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const TEST_USER = {
  name: "Emprendedora Demo",
  email: "demo.tinka@example.com",
  password: "Demo12345",
};

const idSelect = {
  id: true,
} as const;

async function ensurePaymentMethod(name: string, type: "CASH" | "TRANSFER" | "WALLET" | "CARD" | "OTHER", sortOrder: number) {
  const existing = await prisma.paymentMethod.findFirst({
    where: { name, type },
    select: idSelect,
  });

  if (existing) return existing;

  return prisma.paymentMethod.create({
    data: {
      name,
      type,
      isActive: true,
      isDefault: sortOrder === 1,
      sortOrder,
    },
    select: idSelect,
  });
}

async function ensureBusiness(input: {
  userId: bigint;
  name: string;
  description: string;
  address: string;
  phone: string;
}) {
  const existing = await prisma.$queryRaw<Array<{ id: bigint }>>`
    SELECT "id"
    FROM "Business"
    WHERE "userId" = ${input.userId} AND "name" = ${input.name}
    LIMIT 1
  `;

  if (existing[0]) return existing[0];

  const created = await prisma.$queryRaw<Array<{ id: bigint }>>`
    INSERT INTO "Business" (
      "name",
      "description",
      "address",
      "phone",
      "isActive",
      "createdAt",
      "updatedAt",
      "userId"
    )
    VALUES (
      ${input.name},
      ${input.description},
      ${input.address},
      ${input.phone},
      true,
      NOW(),
      NOW(),
      ${input.userId}
    )
    RETURNING "id"
  `;

  return created[0]!;
}

async function ensureActivity(input: {
  businessId: bigint;
  name: string;
  description: string;
  icon: string;
}) {
  const existing = await prisma.$queryRaw<Array<{ id: bigint; name: string }>>`
    SELECT "id", "name"
    FROM "Activity"
    WHERE "businessId" = ${input.businessId} AND "name" = ${input.name}
    LIMIT 1
  `;

  if (existing[0]) return existing[0];

  const created = await prisma.$queryRaw<Array<{ id: bigint; name: string }>>`
    INSERT INTO "Activity" (
      "name",
      "description",
      "icon",
      "isActive",
      "createdAt",
      "updatedAt",
      "businessId"
    )
    VALUES (
      ${input.name},
      ${input.description},
      ${input.icon},
      true,
      NOW(),
      NOW(),
      ${input.businessId}
    )
    RETURNING "id", "name"
  `;

  return created[0]!;
}

async function ensureProduct(input: {
  name: string;
  description: string;
  sku: string;
  basePrice: number;
  cost: number;
  unit: string;
  minPrice: number;
  maxPrice: number;
  businessId: bigint;
  activityId: bigint;
}) {
  return prisma.product.upsert({
    where: { sku: input.sku },
    update: {
      name: input.name,
      description: input.description,
      basePrice: input.basePrice,
      cost: input.cost,
      unit: input.unit,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      businessId: input.businessId,
      activityId: input.activityId,
      isActive: true,
    },
    create: input,
    select: idSelect,
  });
}

async function createSale(input: {
  businessId: bigint;
  paymentMethodId: bigint;
  invoiceNumber: string;
  status?: "CONFIRMADO" | "COBRADO" | "PENDIENTE";
  channel: "TIENDA" | "WHATSAPP" | "INSTAGRAM" | "PERSONAL" | "OTRO";
  locationCity: string;
  createdAt: Date;
  items: Array<{
    productId: bigint;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
}) {
  const existing = await prisma.sale.findUnique({
    where: { invoiceNumber: input.invoiceNumber },
  });

  if (existing) return existing;

  const items = input.items.map((item) => ({
    ...item,
    discount: item.discount ?? 0,
    subtotal: item.quantity * item.unitPrice - (item.discount ?? 0),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return prisma.sale.create({
    data: {
      invoiceNumber: input.invoiceNumber,
      status: input.status ?? "COBRADO",
      subtotal,
      taxAmount: 0,
      totalAmount: subtotal,
      channel: input.channel,
      locationCity: input.locationCity,
      locationState: "La Paz",
      createdAt: input.createdAt,
      completedAt: input.createdAt,
      businessId: input.businessId,
      paymentMethodId: input.paymentMethodId,
      items: {
        create: items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          subtotal: item.subtotal,
          productId: item.productId,
        })),
      },
    },
  });
}

async function setBusinessBalance(businessId: bigint, amount: number) {
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { BusinessMoney: amount },
    });
  } catch {
    // Some shared databases may not have the optional balance migration yet.
  }
}

async function setActivityBalance(activityId: bigint, amount: number) {
  try {
    await prisma.activity.update({
      where: { id: activityId },
      data: { activityMoney: amount },
    });
  } catch {
    // Some shared databases may not have the optional balance migration yet.
  }
}

async function createDemoTransactions(activityIds: {
  gifts: bigint;
  fairs: bigint;
  whatsapp: bigint;
  shop: bigint;
}) {
  try {
    await prisma.bankTransaction.createMany({
      data: [
        {
          nameCuate: "Cliente feria Sopocachi",
          amount: 1380,
          type: "DEPOSIT",
          description: "Cobros acumulados de feria",
          status: "COMPLETED",
          bankName: "Banco FIE",
          activityId: activityIds.fairs,
          date: new Date("2026-05-12T19:00:00-04:00"),
        },
        {
          nameCuate: "Proveedor cajas",
          amount: 420,
          type: "PAYMENT",
          description: "Compra de insumos para cajas premium",
          status: "COMPLETED",
          bankName: "Banco FIE",
          activityId: activityIds.gifts,
          date: new Date("2026-05-13T11:00:00-04:00"),
        },
        {
          nameCuate: "Pedido oficina Central",
          amount: 980,
          type: "DEPOSIT",
          description: "Pedido semanal de granola y masitas",
          status: "COMPLETED",
          bankName: "Banco FIE",
          activityId: activityIds.whatsapp,
          date: new Date("2026-05-14T12:30:00-04:00"),
        },
        {
          nameCuate: "Compra ingredientes",
          amount: 310,
          type: "PAYMENT",
          description: "Avena, frutos secos y empaques",
          status: "COMPLETED",
          bankName: "Banco FIE",
          activityId: activityIds.shop,
          date: new Date("2026-05-15T08:45:00-04:00"),
        },
      ],
      skipDuplicates: true,
    });
  } catch {
    console.log("Transacciones demo omitidas: la tabla BankTransaction no existe en esta base.");
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

  const user = await prisma.user.upsert({
    where: { email: TEST_USER.email },
    update: {
      name: TEST_USER.name,
      passwordHash,
      role: "analyst",
    },
    create: {
      name: TEST_USER.name,
      email: TEST_USER.email,
      passwordHash,
      role: "analyst",
    },
    select: idSelect,
  });

  const [cash, qr, transfer] = await Promise.all([
    ensurePaymentMethod("Efectivo", "CASH", 1),
    ensurePaymentMethod("QR", "WALLET", 2),
    ensurePaymentMethod("Transferencia", "TRANSFER", 3),
  ]);

  const creative = await ensureBusiness({
    name: "Tinka Creativa",
    description: "Productos personalizados, detalles para eventos y ventas por redes sociales.",
    address: "Zona Sopocachi",
    phone: "70000001",
    userId: user.id,
  });

  const food = await ensureBusiness({
    name: "Sabor Andino",
    description: "Venta de snacks saludables, masitas y pedidos por WhatsApp.",
    address: "Miraflores",
    phone: "70000002",
    userId: user.id,
  });

  const [gifts, fairs, whatsapp, shop] = await Promise.all([
    ensureActivity({
      businessId: creative.id,
      name: "Regalos personalizados",
      description: "Tazas, llaveros y cajas de regalo para fechas especiales.",
      icon: "gift",
    }),
    ensureActivity({
      businessId: creative.id,
      name: "Ferias de temporada",
      description: "Ventas presenciales en ferias barriales y eventos de emprendedores.",
      icon: "store",
    }),
    ensureActivity({
      businessId: food.id,
      name: "Pedidos por WhatsApp",
      description: "Entregas programadas a oficinas y clientes frecuentes.",
      icon: "message",
    }),
    ensureActivity({
      businessId: food.id,
      name: "Punto de venta",
      description: "Ventas directas en tienda y fines de semana.",
      icon: "shop",
    }),
  ]);

  await Promise.all([
    setBusinessBalance(creative.id, 3840),
    setBusinessBalance(food.id, 2215),
    setActivityBalance(gifts.id, 2460),
    setActivityBalance(fairs.id, 1380),
    setActivityBalance(whatsapp.id, 1640),
    setActivityBalance(shop.id, 575),
  ]);

  const products = await Promise.all([
    ensureProduct({
      name: "Taza personalizada",
      description: "Taza sublimada con nombre o diseno del cliente.",
      sku: `DEMO-TAZA-${user.id}`,
      basePrice: 45,
      cost: 22,
      unit: "unidad",
      minPrice: 40,
      maxPrice: 55,
      businessId: creative.id,
      activityId: gifts.id,
    }),
    ensureProduct({
      name: "Caja de regalo premium",
      description: "Caja decorada con dulces, tarjeta y detalle personalizado.",
      sku: `DEMO-CAJA-${user.id}`,
      basePrice: 120,
      cost: 68,
      unit: "unidad",
      minPrice: 105,
      maxPrice: 145,
      businessId: creative.id,
      activityId: gifts.id,
    }),
    ensureProduct({
      name: "Pack feria emprendedora",
      description: "Combo economico para ventas rapidas en feria.",
      sku: `DEMO-PACK-FERIA-${user.id}`,
      basePrice: 35,
      cost: 18,
      unit: "pack",
      minPrice: 30,
      maxPrice: 42,
      businessId: creative.id,
      activityId: fairs.id,
    }),
    ensureProduct({
      name: "Granola artesanal",
      description: "Bolsa de granola con frutos secos.",
      sku: `DEMO-GRANOLA-${user.id}`,
      basePrice: 28,
      cost: 14,
      unit: "bolsa",
      minPrice: 25,
      maxPrice: 35,
      businessId: food.id,
      activityId: whatsapp.id,
    }),
    ensureProduct({
      name: "Caja de masitas",
      description: "Caja surtida para oficina o familia.",
      sku: `DEMO-MASITAS-${user.id}`,
      basePrice: 65,
      cost: 34,
      unit: "caja",
      minPrice: 58,
      maxPrice: 75,
      businessId: food.id,
      activityId: shop.id,
    }),
  ]);

  const [taza, caja, packFeria, granola, masitas] = products;

  await Promise.all([
    createSale({
      businessId: creative.id,
      paymentMethodId: qr.id,
      invoiceNumber: `DEMO-CRE-001-${user.id}`,
      channel: "INSTAGRAM",
      locationCity: "La Paz",
      createdAt: new Date("2026-05-10T10:30:00-04:00"),
      items: [{ productId: taza.id, quantity: 3, unitPrice: 45 }],
    }),
    createSale({
      businessId: creative.id,
      paymentMethodId: transfer.id,
      invoiceNumber: `DEMO-CRE-002-${user.id}`,
      channel: "WHATSAPP",
      locationCity: "La Paz",
      createdAt: new Date("2026-05-11T16:20:00-04:00"),
      items: [{ productId: caja.id, quantity: 2, unitPrice: 120 }],
    }),
    createSale({
      businessId: creative.id,
      paymentMethodId: cash.id,
      invoiceNumber: `DEMO-CRE-003-${user.id}`,
      channel: "TIENDA",
      locationCity: "El Alto",
      createdAt: new Date("2026-05-12T13:10:00-04:00"),
      items: [
        { productId: packFeria.id, quantity: 8, unitPrice: 35 },
        { productId: taza.id, quantity: 1, unitPrice: 42 },
      ],
    }),
    createSale({
      businessId: food.id,
      paymentMethodId: qr.id,
      invoiceNumber: `DEMO-FOOD-001-${user.id}`,
      channel: "WHATSAPP",
      locationCity: "La Paz",
      createdAt: new Date("2026-05-13T09:15:00-04:00"),
      items: [{ productId: granola.id, quantity: 12, unitPrice: 28 }],
    }),
    createSale({
      businessId: food.id,
      paymentMethodId: transfer.id,
      invoiceNumber: `DEMO-FOOD-002-${user.id}`,
      channel: "PERSONAL",
      locationCity: "La Paz",
      createdAt: new Date("2026-05-14T18:45:00-04:00"),
      items: [{ productId: masitas.id, quantity: 5, unitPrice: 65 }],
    }),
  ]);

  await createDemoTransactions({
    gifts: gifts.id,
    fairs: fairs.id,
    whatsapp: whatsapp.id,
    shop: shop.id,
  });

  console.log("Seed demo listo:");
  console.log(`Email: ${TEST_USER.email}`);
  console.log(`Password: ${TEST_USER.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
