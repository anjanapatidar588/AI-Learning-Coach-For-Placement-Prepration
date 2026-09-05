import express from 'express';
import {
  getDSATopics,
  getDSAQuestions,
  getDSAQuestionBySlug,
  submitDSACode,
  getDSAAIHint
} from '../controllers/dsaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/topics', getDSATopics);
router.get('/questions', getDSAQuestions);
router.get('/questions/:slug', getDSAQuestionBySlug);
router.post('/submit', submitDSACode);
router.post('/ai-hint', getDSAAIHint);

export default router;
