import { Router } from "express";
import {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;