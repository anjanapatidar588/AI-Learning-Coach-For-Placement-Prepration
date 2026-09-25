import express from 'express';
import {
  getCSCoreSubjects,
  getCSCoreTopics,
  getCSCoreAIConcept,
  submitCSCoreQuiz
} from '../controllers/csCoreController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/subjects', authorize('student'), getCSCoreSubjects);
router.get('/topics/:subjectId', authorize('student'), getCSCoreTopics);
router.post('/quiz/submit', authorize('student'), submitCSCoreQuiz);
router.post('/ai-explain', getCSCoreAIConcept);

export default router;
