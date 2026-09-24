import express from 'express';
import {
  getCSCoreSubjects,
  getCSCoreTopicDetail,
  getCSCoreAIConcept
} from '../controllers/csCoreController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/subjects', getCSCoreSubjects);
router.get('/subjects/:subjectId', getCSCoreTopicDetail);
router.post('/ai-explain', getCSCoreAIConcept);

export default router;
