import express from "express";
import { generateEmailBody, sendSingleEmail } from "../controllers/email.controller.js";

const router = express.Router();

// POST /api/generate_email_body - Generate email body based on provided data
router.post("/generate_email_body", generateEmailBody);

// POST /api/send_single_email - Send an email to a specific recipient
router.post("/send_single_email", sendSingleEmail);

export default router;
