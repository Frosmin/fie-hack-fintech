import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { DEFAULTS } from "../config";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, DEFAULTS.JWT_SECRET) as JwtPayload;
    if (!payload || typeof payload !== "object") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userRole = req.user?.role || "user";
  if (userRole !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  return next();
}
