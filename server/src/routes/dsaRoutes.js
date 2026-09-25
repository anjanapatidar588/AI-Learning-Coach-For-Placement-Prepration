import express from 'express';
import {
  getDSATopics,
  getDSAQuestions,
  getDSAQuestionBySlug,
  submitDSACode,
  getDSAAIHint
} from '../controllers/dsaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/topics', authorize('student'), getDSATopics);
router.get('/questions', authorize('student'), getDSAQuestions);
router.get('/questions/:slug', authorize('student'), getDSAQuestionBySlug);
router.post('/submit', authorize('student'), submitDSACode);
router.post('/ai-hint', authorize('student'), getDSAAIHint);

export default router;
