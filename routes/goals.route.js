import { Router } from "express";
const router = Router();

import {
  getCurrentGoal,
  getGoalHistory,
  createGoal,
} from "../controllers/goals.controller.js";

import { verifyToken } from "../controllers/auth.controller.js";

router.get("/:user_id", getCurrentGoal);
router.get("/history/:user_id", verifyToken, getGoalHistory);
router.post("/", verifyToken, createGoal);

export default router;
