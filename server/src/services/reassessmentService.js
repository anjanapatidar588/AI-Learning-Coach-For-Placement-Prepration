import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import PublishedAssessment from '../models/PublishedAssessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import AssessmentAnalysis from '../models/AssessmentAnalysis.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import TopicProgress from '../models/TopicProgress.js';
import LearnerProfile from '../models/LearnerProfile.js';

import { calculateReadinessScore } from './readinessScoreService.js';
import { adaptStudentRoadmap } from './adaptiveRoadmapService.js';
import { calculateAssessmentAnalysis } from './assessmentAnalysisService.js';
import { generateAIAssessmentAnalysis } from './ai/assessmentAnalysisAIService.js';

/**
 * Generate a personalized reassessment for a student based on weak/target areas.
 * Ensures question freshness (avoids repeating previously answered assessment questions where possible).
 *
 * @param {string} userId - Student User ID
 * @returns {Promise<object>} Reassessment details and safe question list
 */
export const createPersonalizedReassessment = async (userId) => {
  // 1. Identify previous assessment attempts and used question IDs
  const previousAttempts = await AssessmentAttempt.find({ studentId: userId, status: 'COMPLETED' })
    .sort({ createdAt: -1 })
    .lean();

  const usedQuestionIds = new Set();
  previousAttempts.forEach(att => {
    (att.answers || []).forEach(ans => {
      if (ans.questionId) {
        usedQuestionIds.add(ans.questionId.toString());
      }
    });
  });

  // 2. Identify weak/target topics for reassessment
  // Sources: AssessmentAnalysis weakTopics, WeaknessAnalysis, TopicProgress accuracy < 70%
  const latestAnalysis = await AssessmentAnalysis.findOne({ studentId: userId })
    .sort({ generatedAt: -1 })
    .lean();

  let targetTopicIds = [];

  if (latestAnalysis && Array.isArray(latestAnalysis.weakTopics) && latestAnalysis.weakTopics.length > 0) {
    targetTopicIds = latestAnalysis.weakTopics
      .map(wt => (wt.topicId ? wt.topicId.toString() : null))
      .filter(Boolean);
  }

  if (targetTopicIds.length === 0) {
    const weaknessRecords = await WeaknessAnalysis.find({ userId }).lean();
    targetTopicIds = weaknessRecords
      .map(w => (w.topicId ? w.topicId.toString() : null))
      .filter(Boolean);
  }

  if (targetTopicIds.length === 0) {
    const lowProgress = await TopicProgress.find({ userId, accuracy: { $lt: 70 } }).lean();
    targetTopicIds = lowProgress
      .map(tp => (tp.topicId ? tp.topicId.toString() : null))
      .filter(Boolean);
  }

  // Fallback: If still empty, select top 5 topics from DB
  if (targetTopicIds.length === 0) {
    const defaultTopics = await Topic.find({}).limit(5).lean();
    targetTopicIds = defaultTopics.map(t => t._id.toString());
  }

  // Deduplicate topic IDs
  targetTopicIds = Array.from(new Set(targetTopicIds));

  // 3. Select fresh questions for these weak topics
  let candidateQuestions = [];

  if (targetTopicIds.length > 0) {
    candidateQuestions = await Question.find({
      topicId: { $in: targetTopicIds },
      _id: { $nin: Array.from(usedQuestionIds) }
    }).lean();
  }

  // If candidate questions are fewer than 5, expand search to all questions not in usedQuestionIds or general questions
  if (candidateQuestions.length < 5) {
    const additionalFresh = await Question.find({
      _id: { $nin: Array.from(usedQuestionIds) }
    }).limit(10 - candidateQuestions.length).lean();
    candidateQuestions = candidateQuestions.concat(additionalFresh);
  }

  // If still fewer than 5, allow duplicate questions from DB as final fallback
  if (candidateQuestions.length < 5) {
    const fallbackQuestions = await Question.find({}).limit(10).lean();
    candidateQuestions = candidateQuestions.concat(fallbackQuestions);
  }

  // Deduplicate questions by _id and slice target question count (e.g., 5-10 questions)
  const questionMap = new Map();
  candidateQuestions.forEach(q => {
    if (!questionMap.has(q._id.toString())) {
      questionMap.set(q._id.toString(), q);
    }
  });

  const selectedQuestions = Array.from(questionMap.values()).slice(0, 10);

  if (selectedQuestions.length === 0) {
    throw new Error('No questions available to build reassessment');
  }

  // 4. Create or reuse a PublishedAssessment record for this Reassessment
  const totalMarks = selectedQuestions.length * 10;
  const reassessmentTitle = `Reassessment Engine - Targeted Revision (${new Date().toLocaleDateString()})`;

  const published = await PublishedAssessment.create({
    blueprintId: new mongoose.Types.ObjectId(),
    createdBy: userId,
    title: reassessmentTitle,
    description: 'Targeted reassessment based on weak areas and mistake journal signals',
    version: '1.0',
    status: 'PUBLISHED',
    durationMinutes: 30,
    totalMarks,
    marksPerQuestion: 10,
    questionCount: selectedQuestions.length,
    subjects: Array.from(new Set(selectedQuestions.map(q => q.category || 'dsa'))),
    questions: selectedQuestions.map((q, idx) => ({
      questionId: q._id,
      marks: 10,
      order: idx + 1
    })),
    publishedAt: new Date()
  });

  // 5. Create AssessmentAttempt
  const attempt = await AssessmentAttempt.create({
    assessmentId: published._id,
    studentId: userId,
    status: 'IN_PROGRESS',
    totalQuestions: selectedQuestions.length,
    totalMarks,
    startedAt: new Date()
  });

  // 6. Build safe question payload for client (NO isCorrect, solutionCode, hidden tests)
  const safeQuestions = selectedQuestions.map(q => {
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
      topic: q.topicId ? q.topicId.toString() : 'Target Area',
      difficulty: q.difficulty || 'Medium',
      type: q.type || (options ? 'mcq' : 'coding'),
      marks: 10,
      options
    };
  });

  return {
    assessmentId: published._id.toString(),
    attemptId: attempt._id.toString(),
    title: reassessmentTitle,
    durationMinutes: 30,
    totalQuestions: safeQuestions.length,
    totalMarks,
    targetTopicsCount: targetTopicIds.length,
    questions: safeQuestions
  };
};

/**
 * Evaluate a submitted reassessment, compare with previous score, update roadmap & readiness.
 *
 * @param {string} userId - Student User ID
 * @param {string} attemptId - Reassessment Attempt ID
 * @param {Array} answers - Student submitted answers
 * @returns {Promise<object>} Comparative results + deterministic metrics + AI insights
 */
export const evaluateReassessmentSubmit = async (userId, attemptId, answers) => {
  const attempt = await AssessmentAttempt.findOne({ _id: attemptId, studentId: userId });
  if (!attempt) {
    throw new Error('Reassessment attempt not found');
  }

  const assessment = await PublishedAssessment.findById(attempt.assessmentId).populate({
    path: 'questions.questionId',
    populate: { path: 'topicId', select: 'title category subject' }
  });

  if (!assessment) {
    throw new Error('Assessment definition not found');
  }

  // 1. Fetch Student's Previous Assessment Performance for Comparison
  const previousAttempt = await AssessmentAttempt.findOne({
    studentId: userId,
    status: 'COMPLETED',
    _id: { $ne: attempt._id }
  }).sort({ createdAt: -1 }).lean();

  const previousScore = previousAttempt ? (previousAttempt.percentage || 0) : 0;

  // 2. Perform Server-side Grading
  const safeAnswers = Array.isArray(answers) ? answers : [];

  const dbQuestionsMap = new Map();
  (assessment.questions || []).forEach(qItem => {
    if (qItem.questionId) {
      dbQuestionsMap.set(qItem.questionId._id.toString(), {
        question: qItem.questionId,
        marks: qItem.marks || assessment.marksPerQuestion || 10
      });
    }
  });

  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let obtainedMarks = 0;

  const totalQuestions = assessment.questionCount || dbQuestionsMap.size;
  const marksPerQ = assessment.marksPerQuestion || 10;
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

    // Subject Metrics
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

    // Difficulty Metrics
    const diffKey = (q.difficulty || 'Medium').toLowerCase();
    if (difficultyStats[diffKey]) {
      difficultyStats[diffKey].total++;
      if (isCorrect) difficultyStats[diffKey].correct++;
    }

    // Topic Metrics
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
  });

  const unansweredCount = Math.max(0, totalQuestions - attemptedCount);
  obtainedMarks = Math.max(0, Math.min(totalMarks, obtainedMarks));
  const reassessmentPercentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

  // Accuracies
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

  // Save Attempt
  attempt.answers = processedAnswers;
  attempt.totalQuestions = totalQuestions;
  attempt.attemptedQuestions = attemptedCount;
  attempt.correctAnswers = correctCount;
  attempt.incorrectAnswers = incorrectCount;
  attempt.unansweredQuestions = unansweredCount;
  attempt.totalMarks = totalMarks;
  attempt.obtainedMarks = obtainedMarks;
  attempt.percentage = reassessmentPercentage;
  attempt.status = 'COMPLETED';
  attempt.submittedAt = new Date();
  attempt.subjectPerformance = subjectStats;
  attempt.topicPerformance = topicPerformance;
  attempt.difficultyPerformance = difficultyStats;

  await attempt.save();

  // 3. Score Comparison & Deterministic Improvement Calculation
  const pointDiff = reassessmentPercentage - previousScore;
  const improvementPrefix = pointDiff >= 0 ? '+' : '';
  const exactImprovementStatement = `Improvement: ${improvementPrefix}${pointDiff} percentage points`;

  // Compare topic performance with previous attempt
  const prevTopicMap = new Map();
  if (previousAttempt && Array.isArray(previousAttempt.topicPerformance)) {
    previousAttempt.topicPerformance.forEach(pt => {
      if (pt.topicName) prevTopicMap.set(pt.topicName, pt.accuracy || 0);
    });
  }

  const topicsImproved = [];
  const topicsStillWeak = [];
  const topicsNeedingPractice = [];

  topicPerformance.forEach(tp => {
    const prevAcc = prevTopicMap.get(tp.topicName);
    if (prevAcc !== undefined && tp.accuracy > prevAcc) {
      topicsImproved.push({
        topicId: tp.topicId,
        topicName: tp.topicName,
        previousAccuracy: prevAcc,
        newAccuracy: tp.accuracy,
        improvement: tp.accuracy - prevAcc
      });
    } else if (tp.accuracy >= 70) {
      topicsImproved.push({
        topicId: tp.topicId,
        topicName: tp.topicName,
        previousAccuracy: prevAcc || 0,
        newAccuracy: tp.accuracy,
        improvement: tp.accuracy - (prevAcc || 0)
      });
    }

    if (tp.accuracy < 60) {
      topicsStillWeak.push({
        topicId: tp.topicId,
        topicName: tp.topicName,
        accuracy: tp.accuracy
      });
    }

    if (tp.accuracy < 75) {
      topicsNeedingPractice.push({
        topicId: tp.topicId,
        topicName: tp.topicName,
        accuracy: tp.accuracy
      });
    }
  });

  // Update TopicProgress for improved topics
  for (const imp of topicsImproved) {
    if (imp.topicId) {
      await TopicProgress.findOneAndUpdate(
        { userId, topicId: imp.topicId },
        {
          $set: {
            accuracy: imp.newAccuracy,
            status: imp.newAccuracy >= 80 ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: imp.newAccuracy >= 80 ? new Date() : null
          }
        },
        { upsert: true, new: true }
      ).catch(() => {});
    }
  }

  // 4. Save AssessmentAnalysis for Reassessment
  let profile = await LearnerProfile.findOne({ userId });
  if (!profile) profile = await LearnerProfile.create({ userId });

  const deterministicAnalysis = await calculateAssessmentAnalysis(attempt, profile);

  // Qualitative Gemini interpretation (safe non-blocking)
  const aiAnalysisResult = await generateAIAssessmentAnalysis({
    subjectPerformance: subjectStats,
    topicPerformance,
    difficultyPerformance: difficultyStats,
    strongTopics: deterministicAnalysis.strongTopics,
    weakTopics: deterministicAnalysis.weakTopics,
    knowledgeGaps: deterministicAnalysis.knowledgeGaps,
    targetRole: profile.targetRoles?.[0] || 'Software Engineer',
    graduationYear: profile.graduationYear
  }).catch(() => ({ data: { summary: 'Good effort on reassessment.' }, isFallback: true }));

  const analysisDoc = await AssessmentAnalysis.create({
    studentId: userId,
    assessmentId: assessment._id,
    attemptId: attempt._id,
    generatedAt: new Date(),
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

  // 5. Update Readiness & Adaptive Roadmap
  await calculateReadinessScore(userId).catch(() => {});
  await adaptStudentRoadmap(userId, { forceRecalculate: true, assessmentAttemptId: attempt._id }).catch(() => {});

  return {
    assessmentId: assessment._id.toString(),
    attemptId: attempt._id.toString(),
    analysisId: analysisDoc._id.toString(),
    previousScore,
    reassessmentScore: reassessmentPercentage,
    pointDifference: pointDiff,
    improvementStatement: exactImprovementStatement,
    overallScore: reassessmentPercentage,
    subjectPerformance: subjectStats,
    topicPerformance,
    difficultyPerformance: difficultyStats,
    topicsImproved,
    topicsStillWeak,
    topicsNeedingPractice,
    aiInterpretation: aiAnalysisResult.data
  };
};
