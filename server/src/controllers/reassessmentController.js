import { createPersonalizedReassessment, evaluateReassessmentSubmit } from '../services/reassessmentService.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import AssessmentAnalysis from '../models/AssessmentAnalysis.js';

/**
 * Start/Generate a fresh personalized reassessment
 * POST /api/v1/student/reassessment/start
 */
export const startReassessment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const reassessment = await createPersonalizedReassessment(userId);

    return res.status(201).json({
      success: true,
      message: 'Personalized reassessment generated successfully',
      data: reassessment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit reassessment attempt and get comparative results
 * POST /api/v1/student/reassessment/:attemptId/submit
 */
export const submitReassessment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { attemptId } = req.params;
    const { answers } = req.body;

    const result = await evaluateReassessmentSubmit(userId, attemptId, answers);

    return res.status(200).json({
      success: true,
      message: 'Reassessment evaluated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reassessment status and recommendation for student
 * GET /api/v1/student/reassessment/status
 */
export const getReassessmentStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const completedAttempts = await AssessmentAttempt.find({ studentId: userId, status: 'COMPLETED' })
      .sort({ createdAt: -1 })
      .lean();

    const latestAnalysis = await AssessmentAnalysis.findOne({ studentId: userId })
      .sort({ generatedAt: -1 })
      .lean();

    const weakTopics = latestAnalysis?.weakTopics || [];
    const previousScore = completedAttempts.length > 0 ? completedAttempts[0].percentage : 0;
    const available = completedAttempts.length > 0;

    return res.status(200).json({
      success: true,
      available,
      recommended: available && (weakTopics.length > 0 || completedAttempts.length === 1),
      attemptsCount: completedAttempts.length,
      previousScore,
      weakTopicsCount: weakTopics.length,
      weakTopics: weakTopics.map(w => ({ topicName: w.topicName, accuracy: w.accuracy }))
    });
  } catch (error) {
    next(error);
  }
};
