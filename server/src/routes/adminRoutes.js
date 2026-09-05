import express from 'express';
import {
  getAdminDashboardStats,
  getStudentsList,
  manageQuestions,
  getAIConfigs,
  updateAIConfig
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/students', getStudentsList);
router.route('/questions').get(manageQuestions).post(manageQuestions);
router.get('/ai-config', getAIConfigs);
router.put('/ai-config/:id', updateAIConfig);

export default router;
