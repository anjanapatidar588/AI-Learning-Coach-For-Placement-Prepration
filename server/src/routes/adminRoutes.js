import express from 'express';
import {
  getAdminDashboardStats,
  getStudentsList,
  getAdminStudentById,
  getAdminQuestions,
  getAdminQuestionById,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  getAdminTopics,
  getAdminTopicById,
  createAdminTopic,
  updateAdminTopic,
  deleteAdminTopic,
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
router.get('/students/:studentId', getAdminStudentById);

// Topic Management CRUD Routes
router.get('/topics', getAdminTopics);
router.get('/topics/:topicId', getAdminTopicById);
router.post('/topics', createAdminTopic);
router.put('/topics/:topicId', updateAdminTopic);
router.delete('/topics/:topicId', deleteAdminTopic);

// Question Management CRUD Routes
router.get('/questions', getAdminQuestions);
router.post('/questions', createAdminQuestion);
router.get('/questions/:questionId', getAdminQuestionById);
router.put('/questions/:questionId', updateAdminQuestion);
router.delete('/questions/:questionId', deleteAdminQuestion);

router.get('/ai-config', getAIConfigs);
router.put('/ai-config/:id', updateAIConfig);

export default router;
