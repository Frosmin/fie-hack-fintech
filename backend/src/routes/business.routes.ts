import { Router } from "express";
import {
  createBusiness,
  getBusiness,
  getAllBusinesses,
  getBusinessesByUser,
  updateBusiness,
  deleteBusiness,
} from "../controllers/business.controller.js";

const router: Router = Router();

router.post("/", createBusiness);
router.get("/", getBusinessesByUser);
router.get("/all", getAllBusinesses);
router.get("/:id", getBusiness);
router.put("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);

export default router;