import MistakeJournal, { MISTAKE_CATEGORIES } from '../models/MistakeJournal.js';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';

/**
 * Record or update a mistake in Mistake Journal
 * POST /api/v1/student/mistakes
 */
export const createMistake = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      questionId,
      attemptId,
      topicId,
      subject,
      mistakeCategory,
      shortDescription,
      learningNote
    } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'questionId is required'
      });
    }

    if (!mistakeCategory || !MISTAKE_CATEGORIES.includes(mistakeCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mistake category. Must be one of: ${MISTAKE_CATEGORIES.join(', ')}`
      });
    }

    // Infer subject or topicId if question exists
    let finalTopicId = topicId || null;
    let finalSubject = subject || '';

    if (questionId && (!finalTopicId || !finalSubject)) {
      const q = await Question.findById(questionId).lean();
      if (q) {
        if (!finalTopicId) finalTopicId = q.topicId || null;
        if (!finalSubject) finalSubject = q.category || q.subject || 'dsa';
      }
    }

    // Duplicate check: if entry exists for (userId, questionId, attemptId) or (userId, questionId) if attemptId is null/undefined
    const query = { userId, questionId };
    if (attemptId) {
      query.attemptId = attemptId;
    }

    let mistake = await MistakeJournal.findOne(query);

    if (mistake) {
      // Update existing entry safely instead of creating duplicate
      mistake.mistakeCategory = mistakeCategory;
      if (shortDescription !== undefined) mistake.shortDescription = shortDescription;
      if (learningNote !== undefined) mistake.learningNote = learningNote;
      if (finalTopicId) mistake.topicId = finalTopicId;
      if (finalSubject) mistake.subject = finalSubject;
      mistake.resolved = false;
      mistake.resolvedAt = null;
      await mistake.save();
    } else {
      mistake = await MistakeJournal.create({
        userId,
        questionId,
        attemptId: attemptId || null,
        topicId: finalTopicId,
        subject: finalSubject,
        mistakeCategory,
        shortDescription: shortDescription || '',
        learningNote: learningNote || '',
        resolved: false
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Mistake recorded successfully',
      mistake
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student mistake journal with filtering and stats
 * GET /api/v1/student/mistakes
 */
export const getMistakes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { subject, topicId, topic, category, mistakeCategory, resolved } = req.query;

    const filter = { userId };

    if (subject) {
      filter.subject = new RegExp(`^${subject}$`, 'i');
    }

    const targetTopic = topicId || topic;
    if (targetTopic) {
      filter.topicId = targetTopic;
    }

    const targetCategory = category || mistakeCategory;
    if (targetCategory && MISTAKE_CATEGORIES.includes(targetCategory)) {
      filter.mistakeCategory = targetCategory;
    }

    if (resolved !== undefined && resolved !== '') {
      filter.resolved = resolved === 'true' || resolved === true;
    }

    const mistakes = await MistakeJournal.find(filter)
      .populate({
        path: 'questionId',
        select: '-isCorrect -solutionCode -solutionExplanation -hiddenTestCases -testCases'
      })
      .populate('topicId', 'name subject category')
      .sort({ createdAt: -1 })
      .lean();

    // Compute stats for the student
    const allStudentMistakes = await MistakeJournal.find({ userId }).lean();
    const total = allStudentMistakes.length;
    const resolvedCount = allStudentMistakes.filter(m => m.resolved).length;
    const unresolvedCount = total - resolvedCount;

    const categoryBreakdown = {};
    MISTAKE_CATEGORIES.forEach(cat => {
      categoryBreakdown[cat] = 0;
    });
    allStudentMistakes.forEach(m => {
      if (categoryBreakdown[m.mistakeCategory] !== undefined) {
        categoryBreakdown[m.mistakeCategory]++;
      }
    });

    return res.status(200).json({
      success: true,
      mistakes,
      stats: {
        total,
        resolved: resolvedCount,
        unresolved: unresolvedCount,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update mistake (e.g. resolve/unresolve, edit note/category)
 * PATCH /api/v1/student/mistakes/:mistakeId
 */
export const updateMistake = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { mistakeId } = req.params;
    const { resolved, learningNote, shortDescription, mistakeCategory } = req.body;

    const mistake = await MistakeJournal.findOne({ _id: mistakeId, userId });

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake record not found or access denied'
      });
    }

    if (mistakeCategory) {
      if (!MISTAKE_CATEGORIES.includes(mistakeCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mistake category'
        });
      }
      mistake.mistakeCategory = mistakeCategory;
    }

    if (learningNote !== undefined) {
      mistake.learningNote = learningNote;
    }

    if (shortDescription !== undefined) {
      mistake.shortDescription = shortDescription;
    }

    if (resolved !== undefined) {
      mistake.resolved = Boolean(resolved);
      mistake.resolvedAt = mistake.resolved ? new Date() : null;
    }

    await mistake.save();

    return res.status(200).json({
      success: true,
      message: 'Mistake updated successfully',
      mistake
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a mistake record
 * DELETE /api/v1/student/mistakes/:mistakeId
 */
export const deleteMistake = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { mistakeId } = req.params;

    const mistake = await MistakeJournal.findOneAndDelete({ _id: mistakeId, userId });

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake record not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mistake deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
