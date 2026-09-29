import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';

/**
 * Deterministically analyzes a completed AssessmentAttempt.
 *
 * @param {object} attempt - Document or plain JS object of AssessmentAttempt
 * @param {object} [studentProfile=null] - Optional LearnerProfile document/object
 * @returns {Promise<object>} Deterministic objective analysis
 */
export const calculateAssessmentAnalysis = async (attempt, studentProfile = null) => {
  if (!attempt) {
    throw new Error('Assessment attempt is required for analysis');
  }

  const userId = attempt.studentId ? (attempt.studentId._id || attempt.studentId) : null;

  // 1. Overall Performance Extraction
  const overallPerformance = {
    totalQuestions: attempt.totalQuestions || 0,
    attempted: attempt.attemptedQuestions || 0,
    correct: attempt.correctAnswers || 0,
    incorrect: attempt.incorrectAnswers || 0,
    unanswered: attempt.unansweredQuestions || 0,
    totalMarks: attempt.totalMarks || 0,
    obtainedMarks: attempt.obtainedMarks || 0,
    percentage: typeof attempt.percentage === 'number' ? attempt.percentage : 0
  };

  // 2. Subject & Difficulty Performance
  const subjectPerformance = attempt.subjectPerformance || {};
  const difficultyPerformance = attempt.difficultyPerformance || {
    easy: { total: 0, correct: 0, accuracy: 0 },
    medium: { total: 0, correct: 0, accuracy: 0 },
    hard: { total: 0, correct: 0, accuracy: 0 }
  };

  // Fetch historical attempt tracks & historical weakness records for context if userId exists
  let historicalAttempts = [];
  let historicalWeaknesses = [];

  if (userId) {
    historicalAttempts = await AttemptTrack.find({ userId }).sort({ createdAt: -1 }).lean().catch(() => []);
    historicalWeaknesses = await WeaknessAnalysis.find({ userId }).lean().catch(() => []);
  }

  // 3. Topic Performance Processing
  const rawTopics = Array.isArray(attempt.topicPerformance) ? attempt.topicPerformance : [];

  const strongTopics = [];
  const weakTopics = [];
  const priorityTopics = [];
  const processedTopicList = [];

  rawTopics.forEach(t => {
    const topicId = t.topicId ? (t.topicId._id || t.topicId) : null;
    const topicName = t.topicName || 'General Topic';
    const category = t.category || t.subject || 'dsa';
    const total = t.total || 0;
    const correct = t.correct || 0;
    const incorrect = Math.max(0, total - correct);
    const accuracy = typeof t.accuracy === 'number' ? t.accuracy : (total > 0 ? Math.round((correct / total) * 100) : 0);

    // Classification Thresholds
    // >= 80%: Strong
    // 60% - 79%: Developing
    // 40% - 59%: Weak
    // < 40%: Critical
    let classification = 'Developing';
    if (accuracy >= 80) {
      classification = 'Strong';
    } else if (accuracy >= 60) {
      classification = 'Developing';
    } else if (accuracy >= 40) {
      classification = 'Weak';
    } else {
      classification = 'Critical';
    }

    // Historical failure check
    const histWeak = historicalWeaknesses.find(w => {
      const wId = w.topicId ? (w.topicId._id || w.topicId).toString() : null;
      return wId && topicId && wId === topicId.toString();
    });
    const repeatFailures = histWeak ? (histWeak.failureCount || 0) : 0;

    // Priority Determination
    let priority = 'Low';
    if (classification === 'Critical' || (accuracy < 50 && total >= 3) || repeatFailures >= 3) {
      priority = 'Critical';
    } else if (classification === 'Weak' || repeatFailures >= 1) {
      priority = 'High';
    } else if (classification === 'Developing') {
      priority = 'Medium';
    } else {
      priority = 'Low';
    }

    const topicObj = {
      topicId,
      topicName,
      subject: category,
      accuracy,
      attempted: total,
      correct,
      incorrect,
      classification,
      priority
    };

    processedTopicList.push(topicObj);

    if (classification === 'Strong') {
      strongTopics.push({
        topicId,
        topicName,
        subject: category,
        accuracy,
        attempted: total,
        correct,
        classification: 'Strong'
      });
    } else if (classification === 'Weak' || classification === 'Critical') {
      weakTopics.push({
        topicId,
        topicName,
        subject: category,
        accuracy,
        attempted: total,
        correct,
        incorrect,
        classification,
        priority
      });
    }

    priorityTopics.push({
      topicId,
      topicName,
      subject: category,
      priority,
      accuracy
    });
  });

  // Sort priority topics by priority severity (Critical > High > Medium > Low) then accuracy ascending
  const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  priorityTopics.sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return a.accuracy - b.accuracy;
  });

  // 4. Evidence-based Knowledge Gap Analysis
  const knowledgeGaps = [];

  const easyMetrics = difficultyPerformance.easy || { total: 0, correct: 0, accuracy: 0 };
  const mediumMetrics = difficultyPerformance.medium || { total: 0, correct: 0, accuracy: 0 };
  const hardMetrics = difficultyPerformance.hard || { total: 0, correct: 0, accuracy: 0 };

  // Rule 1: CONCEPT_GAP
  // Low accuracy across Easy questions or critical weakness in basic topics
  processedTopicList.forEach(t => {
    if (t.classification === 'Critical' || (easyMetrics.total > 0 && easyMetrics.accuracy < 50)) {
      const confidence = t.attempted >= 3 || easyMetrics.total >= 3 ? 'HIGH' : 'LOW';
      knowledgeGaps.push({
        gapType: 'CONCEPT_GAP',
        topicName: t.topicName,
        subject: t.subject,
        evidence: `Low accuracy (${t.accuracy}%) in ${t.topicName} indicates fundamental concept gaps.`,
        confidence,
        recommendedAction: `Review core concept notes and fundamental definitions for ${t.topicName} before solving complex problems.`
      });
    }
  });

  // Rule 2: DIFFICULTY_GAP
  // Good Easy accuracy (>= 70%) but poor Medium/Hard accuracy (< 50%)
  const medHardTotal = mediumMetrics.total + hardMetrics.total;
  const medHardCorrect = mediumMetrics.correct + hardMetrics.correct;
  const medHardAcc = medHardTotal > 0 ? Math.round((medHardCorrect / medHardTotal) * 100) : 0;

  if (easyMetrics.accuracy >= 70 && medHardTotal > 0 && medHardAcc < 50) {
    const confidence = medHardTotal >= 3 ? 'HIGH' : 'LOW';
    knowledgeGaps.push({
      gapType: 'DIFFICULTY_GAP',
      topicName: 'Medium/Hard Problems',
      subject: 'Overall',
      evidence: `Demonstrated ${easyMetrics.accuracy}% accuracy on Easy questions, but accuracy drops to ${medHardAcc}% on Medium/Hard questions.`,
      confidence,
      recommendedAction: 'Practice multi-step problem solving and edge-case handling on Medium difficulty challenges.'
    });
  }

  // Rule 3: PRACTICE_GAP
  // High accuracy on attempted questions but overall low volume/attempt count
  if (overallPerformance.attempted < overallPerformance.totalQuestions * 0.6) {
    knowledgeGaps.push({
      gapType: 'PRACTICE_GAP',
      topicName: 'Time & Volume',
      subject: 'Overall Assessment',
      evidence: `Only ${overallPerformance.attempted} out of ${overallPerformance.totalQuestions} questions attempted (${overallPerformance.unanswered} unanswered).`,
      confidence: 'MEDIUM',
      recommendedAction: 'Work on time management and practice timed mock tests to increase attempt speed.'
    });
  }

  // Rule 4: PATTERN_GAP
  // Repeat historical failures detected
  historicalWeaknesses.forEach(w => {
    if ((w.failureCount || 0) >= 3 || w.severity === 'High') {
      const tName = w.topicId?.title || w.identifiedPattern || 'Topic';
      knowledgeGaps.push({
        gapType: 'PATTERN_GAP',
        topicName: tName,
        subject: w.category || 'dsa',
        evidence: `Historical pattern of repeated failures in ${tName} (${w.failureCount} failed attempts).`,
        confidence: 'HIGH',
        recommendedAction: `Focus on pattern recognition exercises for ${tName} to avoid repeating common logic pitfalls.`
      });
    }
  });

  // Deduplicate knowledge gaps by gapType and topicName
  const uniqueGapsMap = new Map();
  knowledgeGaps.forEach(g => {
    const key = `${g.gapType}::${g.topicName}`;
    if (!uniqueGapsMap.has(key)) {
      uniqueGapsMap.set(key, g);
    }
  });
  const finalKnowledgeGaps = Array.from(uniqueGapsMap.values());

  // 5. Recommended Learning Order
  const recommendedLearningOrder = [...processedTopicList]
    .sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return a.accuracy - b.accuracy;
    })
    .map((t, idx) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subject: t.subject,
      order: idx + 1
    }));

  return {
    overallPerformance,
    subjectPerformance,
    topicPerformance: processedTopicList,
    difficultyPerformance,
    strongTopics,
    weakTopics,
    knowledgeGaps: finalKnowledgeGaps,
    priorityTopics,
    recommendedLearningOrder
  };
};
