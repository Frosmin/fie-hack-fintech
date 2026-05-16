import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

export function authLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests" });
  }

  entry.count += 1;
  return next();
}
