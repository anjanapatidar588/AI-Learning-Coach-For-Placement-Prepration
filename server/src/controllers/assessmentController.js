import {
  getPublishedInitialBaselineAssessment,
  submitStudentAssessment
} from './studentAssessmentEngineController.js';
import PublishedAssessment from '../models/PublishedAssessment.js';

/**
 * GET /api/v1/student/assessment/baseline
 * Delegates to Published INITIAL_BASELINE Assessment Discovery.
 */
export const getBaselineAssessment = async (req, res) => {
  return getPublishedInitialBaselineAssessment(req, res);
};

/**
 * POST /api/v1/student/assessment/baseline/submit
 * Submits baseline assessment using authoritative Assessment Engine.
 */
export const submitBaselineAssessment = async (req, res) => {
  try {
    let { assessmentId } = req.body;

    if (!assessmentId) {
      const activeBaseline = await PublishedAssessment.findOne({
        status: 'PUBLISHED',
        assessmentPurpose: 'INITIAL_BASELINE'
      }).sort({ publishedAt: -1 });

      if (activeBaseline) {
        assessmentId = activeBaseline._id.toString();
      }
    }

    if (assessmentId) {
      req.params.assessmentId = assessmentId;
      return submitStudentAssessment(req, res);
    }

    return res.status(404).json({
      success: false,
      message: 'No active published baseline assessment found for submission.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
