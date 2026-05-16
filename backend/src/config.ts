export const DEFAULTS = {
 PORT: Number(process.env.PORT ?? 3000),
 BASE_URL: process.env.BASE_URL ?? '',
 DATABASE_URL: process.env.DATABASE_URL ?? '',
 JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me',
 JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',
}
