import express from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeResume);

export default router;
