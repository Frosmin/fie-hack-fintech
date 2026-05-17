import type { Request } from "express";

export type AuthenticatedUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
