import express from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/analyze', analyzeResume);

export default router;

