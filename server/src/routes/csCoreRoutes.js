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
router.use(authorize('student'));

router.get('/subjects', getCSCoreSubjects);
router.get('/topics/:subjectId', getCSCoreTopics);
router.post('/quiz/submit', submitCSCoreQuiz);
router.post('/ai-explain', getCSCoreAIConcept);

export default router;

