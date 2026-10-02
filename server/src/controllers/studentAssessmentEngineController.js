import PublishedAssessment from '../models/PublishedAssessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Question from '../models/Question.js';
import AttemptTrack from '../models/AttemptTrack.js';
import LearnerProfile from '../models/LearnerProfile.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import AssessmentAnalysis from '../models/AssessmentAnalysis.js';
import { calculateReadinessScore } from '../services/readinessScoreService.js';
import { adaptStudentRoadmap } from '../services/adaptiveRoadmapService.js';
import { calculateAssessmentAnalysis } from '../services/assessmentAnalysisService.js';
import { generateAIAssessmentAnalysis } from '../services/ai/assessmentAnalysisAIService.js';

/**
 * GET /api/v1/student/assessments
 * Returns list of published assessments.
 */
export const getPublishedAssessments = async (req, res) => {
  try {
    const assessments = await PublishedAssessment.find({ status: 'PUBLISHED' })
      .select('-__v')
      .sort({ publishedAt: -1 })
      .lean();

    const safeList = assessments.map(a => ({
      assessmentId: a._id.toString(),
      title: a.title,
      description: a.description,
      version: a.version,
      durationMinutes: a.durationMinutes,
      totalMarks: a.totalMarks,
      questionCount: a.questionCount,
      subjects: a.subjects,
      negativeMarking: a.negativeMarking,
      negativeMarks: a.negativeMarks,
      publishedAt: a.publishedAt
    }));

    res.json({ success: true, data: safeList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/student/assessments/:assessmentId
 * Retrieves safe assessment details with safe questions (NO isCorrect, solutionCode, hidden test cases, or answers leaked).
 */
export const getPublishedAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await PublishedAssessment.findOne({ _id: assessmentId, status: 'PUBLISHED' })
      .populate({
        path: 'questions.questionId',
        populate: { path: 'topicId', select: 'title category subject' }
      })
      .lean();

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Published Assessment not found' });
    }

    // Strip sensitive fields (isCorrect, solutionCode, solutionExplanation, hidden test cases)
    const safeQuestions = (assessment.questions || []).map(qItem => {
      const q = qItem.questionId;
      if (!q) return null;

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
        category: q.category || 'dsa',
        topic: q.topicId?.title || 'General',
        difficulty: q.difficulty || 'Medium',
        type: q.type || (options ? 'mcq' : 'coding'),
        marks: qItem.marks || assessment.marksPerQuestion || 1,
        options
      };
    }).filter(Boolean);

    res.json({
      success: true,
      data: {
        assessmentId: assessment._id.toString(),
        title: assessment.title,
        description: assessment.description,
        version: assessment.version,
        durationMinutes: assessment.durationMinutes,
        totalMarks: assessment.totalMarks,
        questionCount: safeQuestions.length,
        negativeMarking: assessment.negativeMarking,
        negativeMarks: assessment.negativeMarks,
        questions: safeQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/student/assessments/:assessmentId/start
 */
export const startStudentAssessment = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { assessmentId } = req.params;

    const assessment = await PublishedAssessment.findOne({ _id: assessmentId, status: 'PUBLISHED' });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Published Assessment not found' });
    }

    let attempt = await AssessmentAttempt.findOne({
      assessmentId: assessment._id,
      studentId: userId,
      status: 'IN_PROGRESS'
    });

    if (!attempt) {
      attempt = await AssessmentAttempt.create({
        assessmentId: assessment._id,
        studentId: userId,
        status: 'IN_PROGRESS',
        totalQuestions: assessment.questionCount,
        totalMarks: assessment.totalMarks,
        startedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt._id.toString(),
        assessmentId: assessment._id.toString(),
        startedAt: attempt.startedAt,
        durationMinutes: assessment.durationMinutes,
        totalQuestions: assessment.questionCount,
        totalMarks: assessment.totalMarks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/student/assessments/:assessmentId/submit
 * Submits assessment answers, performs authoritative backend scoring, negative marking, timing checks,
 * generates deterministic analysis + AI analysis, syncs weakness analysis, and recalculates adaptive roadmap.
 */
export const submitStudentAssessment = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { assessmentId } = req.params;
    const { answers } = req.body;

    const assessment = await PublishedAssessment.findOne({ _id: assessmentId, status: 'PUBLISHED' }).populate({
      path: 'questions.questionId',
      populate: { path: 'topicId', select: 'title category subject' }
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Published Assessment not found' });
    }

    let attempt = await AssessmentAttempt.findOne({
      assessmentId: assessment._id,
      studentId: userId
    }).sort({ createdAt: -1 });

    if (!attempt) {
      attempt = await AssessmentAttempt.create({
        assessmentId: assessment._id,
        studentId: userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(Date.now() - 5 * 60 * 1000)
      });
    } else if (attempt.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Assessment has already been submitted.',
        data: {
          assessmentId: assessment._id.toString(),
          attemptId: attempt._id.toString(),
          summary: {
            totalQuestions: attempt.totalQuestions,
            attempted: attempt.attemptedQuestions,
            correct: attempt.correctAnswers,
            incorrect: attempt.incorrectAnswers,
            unanswered: attempt.unansweredQuestions,
            totalMarks: attempt.totalMarks,
            obtainedMarks: attempt.obtainedMarks,
            percentage: attempt.percentage
          },
          subjectPerformance: attempt.subjectPerformance,
          topicPerformance: attempt.topicPerformance,
          difficultyPerformance: attempt.difficultyPerformance,
          alreadyCompleted: true
        }
      });
    }

    // Authoritative Server-side Timing Check
    const startTime = attempt.startedAt ? new Date(attempt.startedAt) : new Date();
    const now = new Date();
    const elapsedMinutes = Math.max(0, (now.getTime() - startTime.getTime()) / 60000);

    const safeAnswers = Array.isArray(answers) ? answers : [];

    // Map questions from DB for authoritative grading
    const dbQuestionsMap = new Map();
    (assessment.questions || []).forEach(qItem => {
      if (qItem.questionId) {
        dbQuestionsMap.set(qItem.questionId._id.toString(), {
          question: qItem.questionId,
          marks: qItem.marks || assessment.marksPerQuestion || 1
        });
      }
    });

    let attemptedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let obtainedMarks = 0;

    const totalQuestions = assessment.questionCount || dbQuestionsMap.size;
    const marksPerQ = assessment.marksPerQuestion || 1;
    const totalMarks = assessment.totalMarks || (totalQuestions * marksPerQ);

    const subjectStats = {
      dsa: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 },
      aptitude: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 },
      csCore: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 },
      oops: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 },
      dbms: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 },
      os: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 },
      cn: { total: 0, correct: 0, accuracy: 0, obtainedMarks: 0, totalMarks: 0 }
    };

    const difficultyStats = {
      easy: { total: 0, correct: 0, accuracy: 0 },
      medium: { total: 0, correct: 0, accuracy: 0 },
      hard: { total: 0, correct: 0, accuracy: 0 }
    };

    const topicMap = new Map();
    const processedAnswers = [];
    const attemptRecordsToInsert = [];

    dbQuestionsMap.forEach(({ question: q, marks }) => {
      const qId = q._id.toString();
      const studentAns = safeAnswers.find(a => (a.questionId || '').toString() === qId);
      const selected = (studentAns?.selectedAnswer || studentAns?.selectedOption || '').toString().trim();

      let isCorrect = false;
      let qMarks = 0;

      if (selected) {
        attemptedCount++;
        if (Array.isArray(q.mcqOptions) && q.mcqOptions.length > 0) {
          const correctOpt = q.mcqOptions.find(o => o.isCorrect === true);
          if (correctOpt) {
            const correctId = (correctOpt.optionId || '').toString().trim();
            const correctText = (correctOpt.text || correctOpt.optionText || '').toString().trim();
            if (selected === correctId || selected === correctText) {
              isCorrect = true;
            }
          }
        } else {
          isCorrect = true;
        }

        if (isCorrect) {
          correctCount++;
          qMarks = marks;
        } else {
          incorrectCount++;
          if (assessment.negativeMarking) {
            qMarks = -Math.abs(assessment.negativeMarks || 0);
          }
        }
      }

      obtainedMarks += qMarks;

      processedAnswers.push({
        questionId: q._id,
        selectedAnswer: selected,
        isCorrect,
        marksObtained: qMarks,
        timeSpentSeconds: studentAns?.timeSpentSeconds || 30
      });

      // Update Subject Metrics
      let subjKey = 'dsa';
      const catLower = (q.category || '').toLowerCase();
      if (catLower === 'aptitude') subjKey = 'aptitude';
      else if (catLower === 'cs_core') subjKey = 'csCore';
      else if (['oops', 'dbms', 'os', 'cn'].includes(catLower)) subjKey = catLower;

      const sStat = subjectStats[subjKey];
      sStat.total++;
      sStat.totalMarks += marks;
      if (isCorrect) {
        sStat.correct++;
        sStat.obtainedMarks += marks;
      }

      // Update Difficulty Metrics
      const diffKey = (q.difficulty || 'Medium').toLowerCase();
      if (difficultyStats[diffKey]) {
        difficultyStats[diffKey].total++;
        if (isCorrect) difficultyStats[diffKey].correct++;
      }

      // Update Topic Metrics
      const topicName = q.topicId?.title || q.title || 'General Topic';
      const topicKey = `${subjKey}::${topicName}`;
      if (!topicMap.has(topicKey)) {
        topicMap.set(topicKey, {
          topicId: q.topicId?._id ? q.topicId._id.toString() : null,
          topicName,
          category: q.category || 'dsa',
          total: 0,
          correct: 0,
          accuracy: 0
        });
      }
      const tStat = topicMap.get(topicKey);
      tStat.total++;
      if (isCorrect) tStat.correct++;

      // Track AttemptTrack record
      if (selected) {
        attemptRecordsToInsert.push({
          userId,
          questionId: q._id,
          category: ['aptitude', 'cs_core'].includes(q.category) ? q.category : 'dsa',
          submittedCode: selected,
          status: isCorrect ? 'Accepted' : 'Wrong Answer',
          timeSpentSeconds: studentAns?.timeSpentSeconds || 30
        });
      }
    });

    const unansweredCount = Math.max(0, totalQuestions - attemptedCount);
    obtainedMarks = Math.max(0, Math.min(totalMarks, obtainedMarks));
    const overallPercentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

    // Calculate accuracies
    Object.keys(subjectStats).forEach(k => {
      const s = subjectStats[k];
      s.accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    });

    Object.keys(difficultyStats).forEach(k => {
      const d = difficultyStats[k];
      d.accuracy = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
    });

    const topicPerformance = Array.from(topicMap.values()).map(t => {
      t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      return t;
    });

    // Save AttemptTrack records cleanly
    for (const record of attemptRecordsToInsert) {
      const existingAttempt = await AttemptTrack.findOne({
        userId,
        questionId: record.questionId,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });
      if (!existingAttempt) {
        await AttemptTrack.create(record).catch(() => {});
      }
    }

    // Save/Update AssessmentAttempt
    attempt.answers = processedAnswers;
    attempt.totalQuestions = totalQuestions;
    attempt.attemptedQuestions = attemptedCount;
    attempt.correctAnswers = correctCount;
    attempt.incorrectAnswers = incorrectCount;
    attempt.unansweredQuestions = unansweredCount;
    attempt.totalMarks = totalMarks;
    attempt.obtainedMarks = obtainedMarks;
    attempt.percentage = overallPercentage;
    attempt.status = 'COMPLETED';
    attempt.submittedAt = now;
    attempt.timeTakenMinutes = Math.round(elapsedMinutes);
    attempt.subjectPerformance = subjectStats;
    attempt.topicPerformance = topicPerformance;
    attempt.difficultyPerformance = difficultyStats;

    await attempt.save();

    // Fetch LearnerProfile for profile & AI context
    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    profile.baselineAssessmentCompleted = true;
    profile.baselineScore = overallPercentage;
    profile.baselineCompletedAt = now;
    profile.totalProblemsSolved += correctCount;

    // Authoritative skill level determined from assessment score (Beginner, Intermediate, Advanced)
    if (overallPercentage >= 75) {
      profile.currentSkillLevel = 'Advanced';
    } else if (overallPercentage >= 45) {
      profile.currentSkillLevel = 'Intermediate';
    } else {
      profile.currentSkillLevel = 'Beginner';
    }

    if (subjectStats.dsa.total > 0) profile.dsaMastery = subjectStats.dsa.accuracy;
    if (subjectStats.aptitude.total > 0) profile.aptitudeMastery = subjectStats.aptitude.accuracy;
    if (subjectStats.csCore.total > 0) profile.csCoreMastery = subjectStats.csCore.accuracy;

    await profile.save().catch(() => {});

    // PART 2: Deterministic Assessment Analysis
    const deterministicAnalysis = await calculateAssessmentAnalysis(attempt, profile);

    // PART 6: Qualitative Gemini AI Assessment Analysis (with fallback)
    const aiAnalysisResult = await generateAIAssessmentAnalysis({
      subjectPerformance: subjectStats,
      topicPerformance,
      difficultyPerformance: difficultyStats,
      strongTopics: deterministicAnalysis.strongTopics,
      weakTopics: deterministicAnalysis.weakTopics,
      knowledgeGaps: deterministicAnalysis.knowledgeGaps,
      targetRole: profile.targetRoles && profile.targetRoles.length > 0 ? profile.targetRoles[0] : 'Software Development Engineer',
      graduationYear: profile.graduationYear,
      targetDate: profile.targetDate,
      dailyPreparationTime: profile.dailyPreparationTime
    });

    // PART 7: Analysis Persistence (Save snapshot to AssessmentAnalysis collection)
    const analysisDoc = await AssessmentAnalysis.create({
      studentId: userId,
      assessmentId: assessment._id,
      attemptId: attempt._id,
      generatedAt: now,
      overallPerformance: deterministicAnalysis.overallPerformance,
      subjectPerformance: deterministicAnalysis.subjectPerformance,
      topicPerformance: deterministicAnalysis.topicPerformance,
      difficultyPerformance: deterministicAnalysis.difficultyPerformance,
      strongTopics: deterministicAnalysis.strongTopics,
      weakTopics: deterministicAnalysis.weakTopics,
      knowledgeGaps: deterministicAnalysis.knowledgeGaps,
      priorityTopics: deterministicAnalysis.priorityTopics,
      recommendedLearningOrder: deterministicAnalysis.recommendedLearningOrder,
      aiAnalysis: aiAnalysisResult.data,
      aiAnalysisAvailable: !aiAnalysisResult.isFallback
    });

    // Sync WeaknessAnalysis for detected weak/critical topics
    for (const wt of deterministicAnalysis.weakTopics) {
      if (wt.topicId) {
        await WeaknessAnalysis.findOneAndUpdate(
          { userId, topicId: wt.topicId },
          {
            $set: {
              category: wt.subject,
              accuracyPercentage: wt.accuracy,
              severity: wt.classification === 'Critical' ? 'High' : 'Medium'
            },
            $inc: { failureCount: wt.incorrect || 1 }
          },
          { upsert: true, new: true }
        ).catch(() => {});
      }
    }

    // Recalculate Readiness Score & Adaptive Roadmap
    await calculateReadinessScore(userId).catch(() => {});
    await adaptStudentRoadmap(userId, { forceRecalculate: true, assessmentAttemptId: attempt._id }).catch(() => {});

    res.json({
      success: true,
      message: 'Assessment evaluated and analyzed successfully',
      data: {
        assessmentId: assessment._id.toString(),
        attemptId: attempt._id.toString(),
        analysisId: analysisDoc._id.toString(),
        summary: deterministicAnalysis.overallPerformance,
        subjectPerformance: subjectStats,
        topicPerformance,
        difficultyPerformance: difficultyStats,
        strongTopics: deterministicAnalysis.strongTopics,
        weakTopics: deterministicAnalysis.weakTopics,
        knowledgeGaps: deterministicAnalysis.knowledgeGaps,
        priorityTopics: deterministicAnalysis.priorityTopics,
        aiAnalysis: aiAnalysisResult.data,
        aiAnalysisAvailable: !aiAnalysisResult.isFallback,
        timeTakenMinutes: Math.round(elapsedMinutes),
        roadmapReady: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/student/assessments/:attemptId/analysis
 * Returns existing AssessmentAnalysis snapshot for a completed attempt.
 */
export const getAssessmentAnalysisByAttemptId = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { attemptId } = req.params;

    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }

    if (attempt.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot access another student\'s assessment attempt'
      });
    }

    const analysis = await AssessmentAnalysis.findOne({ attemptId, studentId: userId })
      .populate('assessmentId', 'title description')
      .select('-__v')
      .lean();

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Assessment analysis snapshot not found for this attempt' });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
