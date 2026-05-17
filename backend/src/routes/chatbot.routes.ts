import { Router } from "express";
import { sendChatbotMessage } from "../controllers/chatbot.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/message", authRequired, sendChatbotMessage);

export default router;
