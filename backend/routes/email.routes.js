import express from "express";
import { generateEmailBody } from "../controllers/email.controller.js";

const router = express.Router();

// POST /api/generate_email_body - Generate email body based on provided data
router.post("/generate_email_body", generateEmailBody);

export default router;
