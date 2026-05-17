function readEnv(name: string, fallback = ""): string {
  const rawValue = process.env[name];
  if (rawValue === undefined) return fallback;

  const trimmedValue = rawValue.trim();
  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

export const DEFAULTS = {
  PORT: Number(process.env.PORT ?? 3000),
  BASE_URL: readEnv("BASE_URL"),
  DATABASE_URL: readEnv("DATABASE_URL"),
  JWT_SECRET: readEnv("JWT_SECRET", "dev-secret-change-me"),
  JWT_EXPIRES_IN: readEnv("JWT_EXPIRES_IN", "1h"),
  DB_POOL_MIN: Number(process.env.DB_POOL_MIN ?? 0),
  DB_POOL_MAX: Number(process.env.DB_POOL_MAX ?? 5),
  DB_IDLE_TIMEOUT_MS: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30000),
}

export { readEnv };
