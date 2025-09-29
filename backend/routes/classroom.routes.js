import express from 'express';
import { createClassroom, addClassroomAnnouncement } from '../controllers/classroom.controller.js';

const router = express.Router();

// Create a new classroom
router.post('/create', createClassroom);

// Add announcement to classroom
router.post('/add_classroom_announcement', addClassroomAnnouncement);

export default router;
