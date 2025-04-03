import { Router } from "express";
const router = Router();

import { userLogin } from "../controllers/auth.controller.js";

router.post("/login", userLogin);

export default router;
