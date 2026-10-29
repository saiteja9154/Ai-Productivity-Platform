import express from 'express';
import {
  chat,
  summarize,
  extractTasks,
  processMeetingNotes,
  confirmMeetingTasks,
  generateEmail,
  generateContent
} from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chat assistant - available to authenticated users
router.post('/chat', chat);

// Document summarization (text or documentId)
router.post('/summarize', summarize);

// Task extraction from text
router.post('/extract-tasks', extractTasks);

// Meeting notes processing
router.post('/process-meeting-notes', processMeetingNotes);

// Confirm and create extracted tasks directly in MongoDB
router.post('/confirm-meeting-tasks', requireAuth, confirmMeetingTasks);

// Template-based email generator
router.post('/generate-email', generateEmail);

// Content template generator
router.post('/generate-content', generateContent);

export default router;
