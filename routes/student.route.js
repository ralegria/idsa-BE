import express from "express";
const router = express.Router();

import { createStudent } from "../controllers/student.controller.js";

/* router.get("/", getCustomers);
router.get("/:id", getSingleCustomer); */
router.post("/", createStudent);
/* router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer); */

export default router;
