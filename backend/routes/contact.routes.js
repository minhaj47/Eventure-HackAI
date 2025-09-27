import express from 'express';
import { extractContacts } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/extract_all_contacts', extractContacts);
router.post('/extract-contacts', extractContacts); // Added for frontend compatibility

export default router;