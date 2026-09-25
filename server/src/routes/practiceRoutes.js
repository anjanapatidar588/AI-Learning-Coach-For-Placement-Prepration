import express from 'express';
import { filterPracticeQuestions } from '../controllers/practiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/filter', authorize('student'), filterPracticeQuestions);

export default router;
