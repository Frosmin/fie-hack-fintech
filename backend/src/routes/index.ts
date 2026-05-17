import { Router } from "express";
import authRoutes from "./auth.routes.js";
import calculatorRoutes from "./calculator.routes.js";
import userRoutes from "./user.routes.js";
import businessRoutes from "./business.routes.js";
import activityRoutes from "./activity.routes.js";
import productRoutes from "./product.routes.js";
import paymentMethodRoutes from "./paymentMethod.routes.js";
import saleRoutes from "./sale.routes.js";
import saleItemRoutes from "./saleItem.routes.js";
import transactionRoutes from "./transaction.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import errorHandler from "../middlewares/error.middleware.js";

const router: Router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

router.use("/auth", authRoutes);
router.use("/calculator", calculatorRoutes);
router.use("/users", userRoutes);
router.use("/business", businessRoutes);
router.use("/activities", activityRoutes);
router.use("/products", productRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/sales", saleRoutes);
router.use("/sale-items", saleItemRoutes);
router.use("/transactions", transactionRoutes);
router.use("/chatbot", chatbotRoutes);
router.use(errorHandler);

export default router;
