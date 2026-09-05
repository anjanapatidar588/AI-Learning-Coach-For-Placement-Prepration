import express from 'express';
import {
  startInterview,
  submitInterviewTurn,
  finishInterview
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.post('/turn', submitInterviewTurn);
router.post('/finish', finishInterview);

export default router;
