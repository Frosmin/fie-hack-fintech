import { Router } from "express";
import authRoutes from "./auth.routes";
import errorHandler from "../middlewares/error.middleware";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

router.use("/auth", authRoutes);
router.use(errorHandler);

export default router;
