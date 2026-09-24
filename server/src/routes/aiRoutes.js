import express from 'express';
import { chatWithCoach } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/coach/chat', chatWithCoach);

export default router;
