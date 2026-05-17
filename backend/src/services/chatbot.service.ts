import { GoogleGenAI } from "@google/genai";
import prisma from "../config/prisma.js";
import AppError from "../errors/appError.js";
import type { ChatbotMessageInput } from "../schemas/chatbot.schema.js";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const RECENT_RECORD_LIMIT = 200;
const RECENT_CONTEXT_LIMIT = 12;

const INCOME_TRANSACTION_TYPES = new Set(["DEPOSIT", "REFUND"]);

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function addGroupedAmount(
  target: Record<string, { count: number; total: number }>,
  key: string,
  amount: number,
) {
  target[key] ??= { count: 0, total: 0 };
  target[key].count += 1;
  target[key].total = roundMoney(target[key].total + amount);
}

async function findUserBusinesses(userId: number) {
  return prisma.business.findMany({
    where: { userId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      activities: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          products: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              description: true,
              basePrice: true,
              cost: true,
              unit: true,
              minPrice: true,
              maxPrice: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      products: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          basePrice: true,
          cost: true,
          unit: true,
          activityId: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function findUserSales(userId: number) {
  return prisma.sale.findMany({
      where: { business: { userId } },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        subtotal: true,
        channel: true,
        locationCity: true,
        locationState: true,
        createdAt: true,
        businessId: true,
        paymentMethod: {
          select: {
            name: true,
            type: true,
          },
        },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            discount: true,
            subtotal: true,
            product: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_RECORD_LIMIT,
    });
}

async function findUserTransactions(userId: number) {
  try {
    return await prisma.bankTransaction.findMany({
      where: { activity: { business: { userId } } },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        description: true,
        date: true,
        activityId: true,
        activity: {
          select: {
            name: true,
            businessId: true,
            business: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
      take: RECENT_RECORD_LIMIT,
    });
  } catch {
    return [];
  }
}

async function buildBusinessContext(userId: number) {
  const [businesses, sales, transactions] = await Promise.all([
    findUserBusinesses(userId),
    findUserSales(userId),
    findUserTransactions(userId),
  ]);

  const businessNames = new Map(
    businesses.map((business) => [Number(business.id), business.name]),
  );

  const salesByBusiness: Record<string, { count: number; total: number }> = {};
  const salesByStatus: Record<string, { count: number; total: number }> = {};
  const salesByChannel: Record<string, { count: number; total: number }> = {};
  const salesByPaymentMethod: Record<string, { count: number; total: number }> =
    {};

  let totalSales = 0;
  for (const sale of sales) {
    const amount = toNumber(sale.totalAmount);
    totalSales += amount;
    addGroupedAmount(
      salesByBusiness,
      businessNames.get(Number(sale.businessId)) ?? `Negocio ${sale.businessId}`,
      amount,
    );
    addGroupedAmount(salesByStatus, sale.status, amount);
    addGroupedAmount(salesByChannel, sale.channel, amount);
    addGroupedAmount(
      salesByPaymentMethod,
      `${sale.paymentMethod.name} (${sale.paymentMethod.type})`,
      amount,
    );
  }

  const transactionsByType: Record<string, { count: number; total: number }> = {};
  const transactionsByStatus: Record<string, { count: number; total: number }> =
    {};
  const transactionsByActivity: Record<string, { count: number; total: number }> =
    {};

  let totalIncome = 0;
  let totalExpense = 0;
  for (const transaction of transactions) {
    const amount = toNumber(transaction.amount);
    const signedAmount = INCOME_TRANSACTION_TYPES.has(transaction.type)
      ? amount
      : -amount;

    if (signedAmount >= 0) {
      totalIncome += signedAmount;
    } else {
      totalExpense += Math.abs(signedAmount);
    }

    addGroupedAmount(transactionsByType, transaction.type, amount);
    addGroupedAmount(transactionsByStatus, transaction.status, amount);
    addGroupedAmount(
      transactionsByActivity,
      `${transaction.activity.business.name} / ${transaction.activity.name}`,
      signedAmount,
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    currency: "BOB",
    scope: "Datos resumidos del usuario autenticado",
    businesses: businesses.map((business) => ({
      id: Number(business.id),
      name: business.name,
      description: business.description,
      balance: null,
      activityCount: business.activities.length,
      productCount: business.products.length,
      activities: business.activities.map((activity) => ({
        id: Number(activity.id),
        name: activity.name,
        description: activity.description,
        balance: null,
        productCount: activity.products.length,
        products: activity.products.slice(0, RECENT_CONTEXT_LIMIT).map((product) => ({
          id: Number(product.id),
          name: product.name,
          description: product.description,
          basePrice: roundMoney(toNumber(product.basePrice)),
          cost: product.cost === null ? null : roundMoney(toNumber(product.cost)),
          unit: product.unit,
          minPrice:
            product.minPrice === null ? null : roundMoney(toNumber(product.minPrice)),
          maxPrice:
            product.maxPrice === null ? null : roundMoney(toNumber(product.maxPrice)),
        })),
      })),
      products: business.products.slice(0, RECENT_CONTEXT_LIMIT).map((product) => ({
        id: Number(product.id),
        name: product.name,
        basePrice: roundMoney(toNumber(product.basePrice)),
        cost: product.cost === null ? null : roundMoney(toNumber(product.cost)),
        unit: product.unit,
        activityId: product.activityId === null ? null : Number(product.activityId),
      })),
    })),
    salesSummary: {
      sampledRecords: sales.length,
      total: roundMoney(totalSales),
      averageTicket:
        sales.length > 0 ? roundMoney(totalSales / sales.length) : 0,
      byBusiness: salesByBusiness,
      byStatus: salesByStatus,
      byChannel: salesByChannel,
      byPaymentMethod: salesByPaymentMethod,
      recentSales: sales.slice(0, RECENT_CONTEXT_LIMIT).map((sale) => ({
        id: Number(sale.id),
        business:
          businessNames.get(Number(sale.businessId)) ?? `Negocio ${sale.businessId}`,
        total: roundMoney(toNumber(sale.totalAmount)),
        subtotal: roundMoney(toNumber(sale.subtotal)),
        status: sale.status,
        channel: sale.channel,
        paymentMethod: sale.paymentMethod.name,
        location:
          [sale.locationCity, sale.locationState].filter(Boolean).join(", ") || null,
        createdAt: sale.createdAt.toISOString(),
        items: sale.items.map((item) => ({
          product: item.product.name,
          quantity: toNumber(item.quantity),
          unit: item.product.unit,
          unitPrice: roundMoney(toNumber(item.unitPrice)),
          discount: roundMoney(toNumber(item.discount)),
          subtotal: roundMoney(toNumber(item.subtotal)),
        })),
      })),
    },
    transactionSummary: {
      sampledRecords: transactions.length,
      totalIncome: roundMoney(totalIncome),
      totalExpense: roundMoney(totalExpense),
      netBalance: roundMoney(totalIncome - totalExpense),
      byType: transactionsByType,
      byStatus: transactionsByStatus,
      byActivity: transactionsByActivity,
      recentTransactions: transactions
        .slice(0, RECENT_CONTEXT_LIMIT)
        .map((transaction) => ({
          id: Number(transaction.id),
          business: transaction.activity.business.name,
          activity: transaction.activity.name,
          amount: roundMoney(toNumber(transaction.amount)),
          signedAmount: INCOME_TRANSACTION_TYPES.has(transaction.type)
            ? roundMoney(toNumber(transaction.amount))
            : roundMoney(-toNumber(transaction.amount)),
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          date: transaction.date.toISOString(),
        })),
    },
  };
}

function buildPrompt(context: Awaited<ReturnType<typeof buildBusinessContext>>) {
  return [
    "Eres el asistente de negocios de Tinka para emprendedores.",
    "Responde siempre en espanol claro, breve y accionable.",
    "Usa solo el contexto JSON proporcionado. Si falta informacion, dilo explicitamente.",
    "Tu alcance es: negocios, actividades, productos, ventas, metodos de pago, transacciones, ingresos, egresos y decisiones operativas del negocio.",
    "No inventes registros, montos ni tendencias. Cuando uses una muestra limitada, aclara que es una estimacion con los datos disponibles.",
    "No des asesoria financiera formal, promesas de credito ni garantias de resultados.",
    "No pidas ni expongas datos sensibles personales, bancarios o contrasenas.",
    "Si la pregunta esta fuera del negocio del usuario, redirige brevemente hacia una pregunta util sobre sus negocios.",
    "",
    "Contexto resumido del usuario autenticado:",
    JSON.stringify(context, null, 2),
  ].join("\n");
}

function formatHistory(history: ChatbotMessageInput["history"]) {
  if (!history.length) return "Sin historial previo en esta sesion.";
  return history
    .map((message) =>
      `${message.role === "user" ? "Usuario" : "Asistente"}: ${message.content}`,
    )
    .join("\n");
}

export async function generateBusinessReply(
  userId: number,
  input: ChatbotMessageInput,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError("GEMINI_API_KEY no esta configurada", 500);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const context = await buildBusinessContext(userId);
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: [
      buildPrompt(context),
      "",
      "Historial reciente de la conversacion:",
      formatHistory(input.history),
      "",
      `Pregunta actual del usuario: ${input.message}`,
    ].join("\n"),
  });

  const reply = response.text?.trim();
  if (!reply) {
    throw new AppError("Gemini no devolvio una respuesta valida", 500);
  }

  return reply;
}
