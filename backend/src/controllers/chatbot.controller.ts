import type { NextFunction, Response } from "express";
import AppError from "../errors/appError.js";
import { chatbotMessageSchema } from "../schemas/chatbot.schema.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

export async function sendChatbotMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.user?.id);
    if (!userId || Number.isNaN(userId)) {
      throw new AppError("Unauthorized", 401);
    }

    const parsed = chatbotMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Validation error",
        400,
      );
    }

    const { generateBusinessReply } = await import("../services/chatbot.service.js");
    const reply = await generateBusinessReply(userId, parsed.data);
    return res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
}
