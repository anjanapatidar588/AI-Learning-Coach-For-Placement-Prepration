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
router.use(authorize('student'));

router.get('/topics', getDSATopics);
router.get('/questions', getDSAQuestions);
router.get('/questions/:slug', getDSAQuestionBySlug);
router.post('/submit', submitDSACode);
router.post('/ai-hint', getDSAAIHint);

export default router;

