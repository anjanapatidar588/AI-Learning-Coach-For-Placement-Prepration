import express from 'express';
import {
  getStudentDashboard,
  getRoadmap,
  recalculateRoadmap,
  getProgressMetrics,
  getWeakAreas,
  getAchievements,
  getStudentProfile,
  updateStudentProfile,
  getRecommendations
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

router.get('/dashboard', getStudentDashboard);
router.get('/roadmap', getRoadmap);
router.post('/roadmap/recalculate', recalculateRoadmap);
router.get('/progress', getProgressMetrics);
router.get('/weak-areas', getWeakAreas);
router.get('/achievements', getAchievements);
router.get('/recommendations', getRecommendations);

export default router;
