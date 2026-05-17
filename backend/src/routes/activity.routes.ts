import { Router, type Router as RouterType } from "express";
import {
  createActivity,
  getActivity,
  getAllActivities,
  getActivitiesByBusiness,
  updateActivity,
  deleteActivity,
} from "../controllers/activity.controller.js";

const router: RouterType = Router();

router.post("/", createActivity);
router.get("/", getActivitiesByBusiness);
router.get("/all", getAllActivities);
router.get("/:id", getActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

export default router;