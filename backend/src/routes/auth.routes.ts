import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/auth.controller";
import { authRequired } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", authRequired, getMe);

export default router;
