import express from 'express';
import {
  getAptitudeTopics,
  getAptitudeQuiz,
  submitAptitudeQuiz,
  getAptitudeAIExplain
} from '../controllers/aptitudeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/topics', getAptitudeTopics);
router.get('/quiz/:topicId', getAptitudeQuiz);
router.post('/quiz/submit', submitAptitudeQuiz);
router.post('/ai-explain', getAptitudeAIExplain);

export default router;
