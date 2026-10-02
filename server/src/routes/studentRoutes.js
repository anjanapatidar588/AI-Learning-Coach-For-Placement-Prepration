import express from 'express';
import {
  getStudentDashboard,
  getRoadmap,
  recalculateRoadmap,
  updateRoadmapNodeStatus,
  getProgressMetrics,
  getWeakAreas,
  getAchievements,
  getStudentProfile,
  updateStudentProfile,
  getRecommendations
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import { getBaselineAssessment, submitBaselineAssessment } from '../controllers/assessmentController.js';
import {
  getPublishedAssessments,
  getPublishedAssessmentById,
  startStudentAssessment,
  submitStudentAssessment,
  getAssessmentAnalysisByAttemptId
} from '../controllers/studentAssessmentEngineController.js';

import {
  getTopicLearningContent,
  getTopicPracticeQuestions,
  markTopicLearningComplete,
  recordStudentConfidence,
  getIntelligentPracticeHelp,
  generateTopicTeaching,
  getAdaptiveQuestion,
  evaluateAnswer,
  evaluatePatternCheck,
  updateTopicNote
} from '../controllers/learningController.js';

import {
  createMistake,
  getMistakes,
  updateMistake,
  deleteMistake
} from '../controllers/mistakeController.js';

import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  markForRevision,
  unmarkForRevision,
  getRevisionItems,
  markTopicImportant,
  removeTopicImportant,
  getImportantTopics,
  saveConcept,
  getSavedConcepts,
  deleteSavedConcept,
  createRevisionCard,
  getRevisionCards,
  getDueRevisionCards,
  reviewCard,
  deleteRevisionCard,
  getRevisionOverview
} from '../controllers/revisionController.js';

import {
  startReassessment,
  submitReassessment,
  getReassessmentStatus
} from '../controllers/reassessmentController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

router.get('/dashboard', getStudentDashboard);
router.get('/roadmap', getRoadmap);
router.post('/roadmap/recalculate', recalculateRoadmap);
router.patch('/roadmap/nodes/:nodeId', updateRoadmapNodeStatus);
router.post('/roadmap/nodes/:nodeId/status', updateRoadmapNodeStatus);
router.get('/progress', getProgressMetrics);
router.get('/weak-areas', getWeakAreas);
router.get('/achievements', getAchievements);
router.get('/recommendations', getRecommendations);

// Guided Learning & Intelligent Practice Routes (Step 4 & Step 5)
router.get('/learning/topics/:topicId', getTopicLearningContent);
router.get('/learning/topics/:topicId/practice', getTopicPracticeQuestions);
router.post('/learning/topics/:topicId/complete', markTopicLearningComplete);
router.post('/confidence', recordStudentConfidence);
router.post('/learning/practice/intelligent-help', getIntelligentPracticeHelp);

// Adaptive AI Tutor & Practice System Routes
router.post('/learning/topics/:topicId/teach', generateTopicTeaching);
router.post('/learning/topics/:topicId/adaptive-question', getAdaptiveQuestion);
router.post('/learning/topics/:topicId/evaluate-answer', evaluateAnswer);
router.post('/learning/topics/:topicId/pattern-check', evaluatePatternCheck);
router.put('/learning/notes/:noteId', updateTopicNote);

// Mistake Journal Routes (Step 6)
router.post('/mistakes', createMistake);
router.get('/mistakes', getMistakes);
router.patch('/mistakes/:mistakeId', updateMistake);
router.delete('/mistakes/:mistakeId', deleteMistake);

// Personal Notes Routes (Step 6)
router.post('/notes', createNote);
router.get('/notes', getNotes);
router.patch('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

// Revision Center Routes (Step 6)
router.get('/revision/overview', getRevisionOverview);
router.post('/revision/mark', markForRevision);
router.post('/revision/unmark', unmarkForRevision);
router.get('/revision/items', getRevisionItems);

router.post('/revision/important-topics/mark', markTopicImportant);
router.delete('/revision/important-topics/:topicId', removeTopicImportant);
router.get('/revision/important-topics', getImportantTopics);

router.post('/revision/saved-concepts', saveConcept);
router.get('/revision/saved-concepts', getSavedConcepts);
router.delete('/revision/saved-concepts/:conceptId', deleteSavedConcept);

router.post('/revision/cards', createRevisionCard);
router.get('/revision/cards', getRevisionCards);
router.get('/revision/cards/due', getDueRevisionCards);
router.post('/revision/cards/:cardId/review', reviewCard);
router.delete('/revision/cards/:cardId', deleteRevisionCard);

// Reassessment Engine Routes (Step 6)
router.post('/reassessment/start', startReassessment);
router.post('/reassessment/:attemptId/submit', submitReassessment);
router.get('/reassessment/status', getReassessmentStatus);

// Assessment Engine Routes (Step 2)
router.get('/assessments', getPublishedAssessments);
router.get('/assessments/:assessmentId', getPublishedAssessmentById);
router.post('/assessments/:assessmentId/start', startStudentAssessment);
router.post('/assessments/:assessmentId/submit', submitStudentAssessment);
router.get('/assessments/:attemptId/analysis', getAssessmentAnalysisByAttemptId);

// Baseline Assessment Routes
router.get('/assessment/baseline', getBaselineAssessment);
router.post('/assessment/baseline/submit', submitBaselineAssessment);

export default router;
