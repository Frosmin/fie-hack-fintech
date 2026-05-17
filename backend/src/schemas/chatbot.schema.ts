import { z } from "zod";

export const chatbotMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "El mensaje es requerido")
    .max(1000, "El mensaje no puede superar 1000 caracteres"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .max(6)
    .optional()
    .default([]),
});

export type ChatbotMessageInput = z.infer<typeof chatbotMessageSchema>;
