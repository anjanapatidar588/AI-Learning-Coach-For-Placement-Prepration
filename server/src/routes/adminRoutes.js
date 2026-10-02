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
  updateAIConfig,
  getAdminCompanies,
  createAdminCompany,
  updateAdminCompany,
  deleteAdminCompany
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import {
  getAdminAssessmentBlueprints,
  getAdminAssessmentBlueprintById,
  createAdminAssessmentBlueprint,
  updateAdminAssessmentBlueprint,
  deleteAdminAssessmentBlueprint,
  generateBlueprintQuestions,
  getBlueprintQuestionsForReview,
  updateBlueprintQuestion,
  approveBlueprint,
  publishBlueprint,
  unpublishBlueprint,
  archiveBlueprint
} from '../controllers/adminAssessmentController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/analytics', getAdminDashboardStats);
router.get('/students', getStudentsList);
router.get('/students/:studentId', getAdminStudentById);

// Assessment Blueprint & Assessment CRUD & AI Generation Routes
router.get('/assessments', getAdminAssessmentBlueprints);
router.post('/assessments', createAdminAssessmentBlueprint);
router.get('/assessments/:blueprintId', getAdminAssessmentBlueprintById);
router.put('/assessments/:blueprintId', updateAdminAssessmentBlueprint);
router.delete('/assessments/:blueprintId', deleteAdminAssessmentBlueprint);
router.post('/assessments/:blueprintId/generate', generateBlueprintQuestions);
router.post('/assessments/:blueprintId/generate-questions', generateBlueprintQuestions);
router.get('/assessments/:blueprintId/questions', getBlueprintQuestionsForReview);
router.put('/assessments/:blueprintId/questions/:questionId', updateBlueprintQuestion);
router.post('/assessments/:blueprintId/approve', approveBlueprint);
router.post('/assessments/:blueprintId/publish', publishBlueprint);
router.post('/assessments/:blueprintId/unpublish', unpublishBlueprint);
router.post('/assessments/:blueprintId/archive', archiveBlueprint);

router.get('/assessment-blueprints', getAdminAssessmentBlueprints);
router.post('/assessment-blueprints', createAdminAssessmentBlueprint);
router.get('/assessment-blueprints/:blueprintId', getAdminAssessmentBlueprintById);
router.put('/assessment-blueprints/:blueprintId', updateAdminAssessmentBlueprint);
router.delete('/assessment-blueprints/:blueprintId', deleteAdminAssessmentBlueprint);
router.post('/assessment-blueprints/:blueprintId/generate-questions', generateBlueprintQuestions);
router.get('/assessment-blueprints/:blueprintId/questions', getBlueprintQuestionsForReview);
router.put('/assessment-blueprints/:blueprintId/questions/:questionId', updateBlueprintQuestion);
router.post('/assessment-blueprints/:blueprintId/approve', approveBlueprint);
router.post('/assessment-blueprints/:blueprintId/publish', publishBlueprint);
router.post('/assessment-blueprints/:blueprintId/unpublish', unpublishBlueprint);
router.post('/assessment-blueprints/:blueprintId/archive', archiveBlueprint);

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

// Company Management Routes
router.get('/companies', getAdminCompanies);
router.post('/companies', createAdminCompany);
router.put('/companies/:companyId', updateAdminCompany);
router.delete('/companies/:companyId', deleteAdminCompany);

export default router;
