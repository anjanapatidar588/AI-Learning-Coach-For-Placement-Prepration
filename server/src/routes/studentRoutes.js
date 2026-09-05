import express from 'express';
import {
  getStudentDashboard,
  getRoadmap,
  recalculateRoadmap,
  getProgressMetrics,
  getWeakAreas,
  getAchievements
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getStudentDashboard);
router.get('/roadmap', getRoadmap);
router.post('/roadmap/recalculate', recalculateRoadmap);
router.get('/progress', getProgressMetrics);
router.get('/weak-areas', getWeakAreas);
router.get('/achievements', getAchievements);

export default router;
