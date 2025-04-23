import { Router } from "express";
const router = Router();

import { userLogin, userSignup } from "../controllers/auth.controller.js";

router.post("/login", userLogin);
router.post("/signup", userSignup);

export default router;

