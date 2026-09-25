import express from 'express';
import { chatWithCoach, explainRecommendation } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/coach/chat', authorize('student'), chatWithCoach);
router.post('/recommendation-explain', authorize('student'), explainRecommendation);

export default router;
