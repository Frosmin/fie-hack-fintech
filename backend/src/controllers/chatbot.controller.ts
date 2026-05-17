import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/appError.js";
import { chatbotMessageSchema } from "../schemas/chatbot.schema.js";
import * as chatbotService from "../services/chatbot.service.js";

export async function sendChatbotMessage(
  req: Request,
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

    const reply = await chatbotService.generateBusinessReply(userId, parsed.data);
    return res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
}
