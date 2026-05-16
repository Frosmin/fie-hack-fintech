import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULTS } from "./config.js";
import { PrismaClient } from "./generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: DEFAULTS.DATABASE_URL,
  max: DEFAULTS.DB_POOL_MAX,
  min: DEFAULTS.DB_POOL_MIN,
  idleTimeoutMillis: DEFAULTS.DB_IDLE_TIMEOUT_MS,
})
const prisma = new PrismaClient({ adapter });

export type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export { prisma };