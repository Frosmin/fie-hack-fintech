import { Router } from "express";
import { analyzeProduct } from "../controllers/calculator.controller.js";

const router: Router = Router();

router.post("/analyze", analyzeProduct);

export default router;
