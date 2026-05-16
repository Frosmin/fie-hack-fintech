export const DEFAULTS = {
 PORT: Number(process.env.PORT ?? 3000),
 BASE_URL: process.env.BASE_URL ?? '',
 DATABASE_URL: process.env.DATABASE_URL ?? '',
 JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me',
 JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',
 DB_POOL_MIN: Number(process.env.DB_POOL_MIN ?? 5),
 DB_POOL_MAX: Number(process.env.DB_POOL_MAX ?? 25),
 DB_IDLE_TIMEOUT_MS: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30000),
}
