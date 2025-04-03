import { Router } from "express";
const router = Router();

import { getInventory } from "../controllers/inventory.controller.js";

router.get("/", getInventory);

export default router;
