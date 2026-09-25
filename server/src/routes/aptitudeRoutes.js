import express from 'express';
import {
  getAptitudeTopics,
  getAptitudeQuiz,
  submitAptitudeQuiz,
  getAptitudeAIExplain
} from '../controllers/aptitudeController.js';
import { protect } from '../middleware/authMiddleware.js';

import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/topics', authorize('student'), getAptitudeTopics);
router.get('/quiz/:topicId', authorize('student'), getAptitudeQuiz);
router.post('/quiz/submit', authorize('student'), submitAptitudeQuiz);
router.post('/ai-explain', authorize('student'), getAptitudeAIExplain);

export default router;
