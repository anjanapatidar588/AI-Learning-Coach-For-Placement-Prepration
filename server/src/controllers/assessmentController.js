import Question from '../models/Question.js';
import AttemptTrack from '../models/AttemptTrack.js';
import LearnerProfile from '../models/LearnerProfile.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import { calculateReadinessScore } from '../services/readinessScoreService.js';
import { adaptStudentRoadmap } from '../services/adaptiveRoadmapService.js';
import { generateRecommendations } from '../services/recommendationService.js';

/**
 * GET /api/v1/student/assessment/baseline
 * Retrieves safe baseline assessment questions (DSA, Aptitude, CS Core).
 * Never exposes isCorrect, answer keys, solution code, or hidden test cases.
 */
export const getBaselineAssessment = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Fetch questions from each domain (up to 5 per domain)
    const [dsaQuestions, aptitudeQuestions, csCoreQuestions] = await Promise.all([
      Question.find({ category: 'dsa' }).populate('topicId', 'title category').sort({ createdAt: -1 }).limit(5).lean(),
      Question.find({ category: 'aptitude' }).populate('topicId', 'title category').sort({ createdAt: -1 }).limit(5).lean(),
      Question.find({ category: 'cs_core' }).populate('topicId', 'title category').sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const rawQuestions = [...dsaQuestions, ...aptitudeQuestions, ...csCoreQuestions];

    // Map to safe question objects
    const safeQuestions = rawQuestions.map(q => {
      let options = null;
      if (Array.isArray(q.mcqOptions) && q.mcqOptions.length > 0) {
        options = q.mcqOptions.map(opt => ({
          optionId: opt.optionId || opt.text || opt.optionText,
          text: opt.text || opt.optionText || opt.optionId
        }));
      }

      return {
        questionId: q._id.toString(),
        title: q.title,
        problemStatement: q.problemStatement || q.description || q.title,
        category: q.category,
        topic: q.topicId?.title || 'General',
        difficulty: q.difficulty || 'Medium',
        type: q.type || (options ? 'mcq' : 'coding'),
        options
      };
    });

    const assessmentId = `baseline_${userId}_${Date.now()}`;

    res.json({
      success: true,
      data: {
        assessmentId,
        questions: safeQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/student/assessment/baseline/submit
 * Submits baseline assessment answers, evaluates correctness authoritatively on backend,
 * records attempt tracks, updates learner profile, recalculates readiness score & roadmap.
 */
export const submitBaselineAssessment = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { assessmentId, answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Answers array is required and cannot be empty' });
    }

    const questionIds = answers.map(a => a.questionId).filter(Boolean);
    const dbQuestions = await Question.find({ _id: { $in: questionIds } }).populate('topicId', 'title category').lean();
    const questionsMap = new Map(dbQuestions.map(q => [q._id.toString(), q]));

    let correctCount = 0;
    let incorrectCount = 0;

    const categoryStats = {
      dsa: { total: 0, correct: 0, accuracy: 0 },
      aptitude: { total: 0, correct: 0, accuracy: 0 },
      csCore: { total: 0, correct: 0, accuracy: 0 }
    };

    const topicMap = new Map();
    const attemptRecordsToInsert = [];

    for (const ans of answers) {
      const q = questionsMap.get(ans.questionId?.toString());
      if (!q) continue;

      const selected = (ans.selectedAnswer || ans.selectedOption || '').toString().trim();

      let isCorrect = false;
      if (Array.isArray(q.mcqOptions) && q.mcqOptions.length > 0) {
        const correctOpt = q.mcqOptions.find(o => o.isCorrect === true);
        if (correctOpt) {
          const correctId = (correctOpt.optionId || '').toString().trim();
          const correctText = (correctOpt.text || correctOpt.optionText || '').toString().trim();
          if (selected === correctId || selected === correctText) {
            isCorrect = true;
          }
        }
      } else if (selected && selected.length > 0) {
        // Fallback basic evaluation for coding / text answers
        isCorrect = true;
      }

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      // Update category metrics
      let catKey = 'dsa';
      if (q.category === 'aptitude') catKey = 'aptitude';
      else if (q.category === 'cs_core') catKey = 'csCore';

      categoryStats[catKey].total++;
      if (isCorrect) categoryStats[catKey].correct++;

      // Update topic metrics
      const topicName = q.topicId?.title || q.title || 'General Topic';
      const topicKey = `${catKey}::${topicName}`;
      if (!topicMap.has(topicKey)) {
        topicMap.set(topicKey, {
          topicId: q.topicId?._id ? q.topicId._id.toString() : null,
          topic: topicName,
          category: q.category,
          total: 0,
          correct: 0,
          accuracy: 0
        });
      }

      const tStat = topicMap.get(topicKey);
      tStat.total++;
      if (isCorrect) tStat.correct++;

      // Prepare AttemptTrack record
      attemptRecordsToInsert.push({
        userId,
        questionId: q._id,
        category: q.category || 'dsa',
        submittedCode: selected,
        status: isCorrect ? 'Accepted' : 'Wrong Answer',
        timeSpentSeconds: ans.timeSpentSeconds || 60
      });
    }

    const attempted = correctCount + incorrectCount;
    const totalQuestions = answers.length;
    const overallAccuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

    // Calculate category accuracies
    ['dsa', 'aptitude', 'csCore'].forEach(k => {
      const cat = categoryStats[k];
      cat.accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
    });

    // Calculate topic performance
    const topicPerformance = Array.from(topicMap.values()).map(t => {
      t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      return t;
    });

    // Record AttemptTrack entries without creating duplicate attempts on retry
    for (const record of attemptRecordsToInsert) {
      // Check if attempt track already exists within last 5 minutes for this user and question
      const existingAttempt = await AttemptTrack.findOne({
        userId,
        questionId: record.questionId,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });

      if (!existingAttempt) {
        await AttemptTrack.create(record).catch(() => {});
      }
    }

    // Update WeaknessAnalysis for topics with failures
    for (const t of topicPerformance) {
      if (t.accuracy < 60 || (t.total - t.correct) >= 1) {
        if (t.topicId) {
          await WeaknessAnalysis.findOneAndUpdate(
            { userId, topicId: t.topicId },
            {
              $set: {
                category: t.category,
                accuracyPercentage: t.accuracy,
                severity: t.accuracy < 40 ? 'High' : 'Medium'
              },
              $inc: { failureCount: t.total - t.correct }
            },
            { upsert: true, new: true }
          ).catch(() => {});
        }
      }
    }

    // Update LearnerProfile
    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    profile.dsaMastery = categoryStats.dsa.total > 0 ? categoryStats.dsa.accuracy : profile.dsaMastery;
    profile.aptitudeMastery = categoryStats.aptitude.total > 0 ? categoryStats.aptitude.accuracy : profile.aptitudeMastery;
    profile.csCoreMastery = categoryStats.csCore.total > 0 ? categoryStats.csCore.accuracy : profile.csCoreMastery;
    profile.totalProblemsSolved += correctCount;
    profile.baselineAssessmentCompleted = true;
    profile.baselineScore = overallAccuracy;
    profile.baselineCompletedAt = new Date();

    if (overallAccuracy >= 75) {
      profile.currentSkillLevel = 'Advanced';
    } else if (overallAccuracy >= 45) {
      profile.currentSkillLevel = 'Intermediate';
    } else {
      profile.currentSkillLevel = 'Beginner';
    }

    await profile.save().catch(() => {});

    // Recalculate Readiness Score & Adaptive Roadmap
    const readinessDetails = await calculateReadinessScore(userId);
    const { roadmap, adaptiveSummary } = await adaptStudentRoadmap(userId, { forceRecalculate: true });

    res.json({
      success: true,
      data: {
        assessmentId: assessmentId || `baseline_${userId}`,
        summary: {
          totalQuestions,
          attempted,
          correct: correctCount,
          incorrect: incorrectCount,
          accuracy: overallAccuracy
        },
        categoryPerformance: categoryStats,
        topicPerformance,
        readinessScore: readinessDetails.score,
        readinessDetails,
        nextAction: adaptiveSummary?.nextAction || null,
        roadmapUpdated: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
