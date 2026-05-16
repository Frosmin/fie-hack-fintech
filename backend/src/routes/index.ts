import { Router } from "express";
import authRoutes from "./auth.routes.js";
import errorHandler from "../middlewares/error.middleware.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

router.use("/auth", authRoutes);
router.use(errorHandler);

export default router;
