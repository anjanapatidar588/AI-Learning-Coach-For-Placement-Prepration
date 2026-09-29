import Roadmap from '../models/Roadmap.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import AssessmentAnalysis from '../models/AssessmentAnalysis.js';
import LearnerProfile from '../models/LearnerProfile.js';
import Topic from '../models/Topic.js';

/**
 * Deterministically adapts and personalizes a student's learning roadmap based on:
 * - Assessment performance
 * - Strong & Weak topics
 * - Knowledge gaps
 * - Target placement date
 * - Daily preparation time
 * - Historical attempts & profile state
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {object} [options={}]
 * @param {boolean} [options.forceRecalculate=false]
 * @param {string} [options.assessmentAttemptId]
 * @returns {Promise<{ roadmap: object, adaptiveSummary: object }>}
 */
export const adaptStudentRoadmap = async (userId, options = {}) => {
  const forceRecalculate = !!options.forceRecalculate;

  // 1. Fetch all student performance data, latest assessment analysis, profile, and topics
  const [existingRoadmap, attempts, weaknesses, analyses, profile, topics] = await Promise.all([
    Roadmap.findOne({ userId }),
    AttemptTrack.find({ userId }).populate({
      path: 'questionId',
      select: 'title category difficulty topicId',
      populate: { path: 'topicId', select: 'title category' }
    }).lean().catch(() => []),
    WeaknessAnalysis.find({ userId }).populate('topicId', 'title category').lean().catch(() => []),
    AssessmentAnalysis.find({ studentId: userId }).sort({ generatedAt: -1 }).limit(3).lean().catch(() => []),
    LearnerProfile.findOne({ userId }).lean().catch(() => null),
    Topic.find().sort({ order: 1, createdAt: 1 }).lean().catch(() => [])
  ]);

  const hasPerformanceData = attempts.length > 0 || weaknesses.length > 0 || analyses.length > 0;
  const latestAnalysis = analyses[0] || null;

  // Calculate Target Date impact & available preparation window
  let daysRemaining = null;
  if (profile && profile.targetDate) {
    const targetMs = new Date(profile.targetDate).getTime();
    const nowMs = Date.now();
    if (!isNaN(targetMs) && targetMs > nowMs) {
      daysRemaining = Math.max(1, Math.round((targetMs - nowMs) / (1000 * 60 * 60 * 24)));
    }
  }

  // Calculate Daily Study Capacity (Minutes per node) based on profile.dailyPreparationTime
  const prepTimeStr = (profile?.dailyPreparationTime || '').toLowerCase();
  let defaultEstimatedMinutes = 45;
  let dailyPacingLabel = '1-2 hours / day (Moderate)';

  if (prepTimeStr.includes('<1') || prepTimeStr.includes('less') || prepTimeStr.includes('30 min')) {
    defaultEstimatedMinutes = 30;
    dailyPacingLabel = '<1 hour / day (Lightweight)';
  } else if (prepTimeStr.includes('2-3') || prepTimeStr.includes('2 to 3')) {
    defaultEstimatedMinutes = 60;
    dailyPacingLabel = '2-3 hours / day (Concept + Practice + Revision)';
  } else if (prepTimeStr.includes('3+') || prepTimeStr.includes('3-4') || prepTimeStr.includes('4+')) {
    defaultEstimatedMinutes = 90;
    dailyPacingLabel = '3+ hours / day (Deep Practice + Reinforcement)';
  }

  // 2. Build Topic Statistics Map combining AttemptTrack, WeaknessAnalysis, and AssessmentAnalysis
  const topicStats = {};

  // Initialize from Topic catalog
  topics.forEach(t => {
    const tId = t._id.toString();
    topicStats[tId] = {
      topicId: tId,
      topicName: t.title || 'Topic',
      category: t.category || t.subject || 'dsa',
      totalAttempts: 0,
      passedAttempts: 0,
      failedAttempts: 0,
      accuracy: null,
      classification: 'UNATTEMPTED',
      assessmentPriority: null,
      isWeakInAssessment: false,
      isStrongInAssessment: false,
      repeatFailures: 0
    };
  });

  // Aggregate AttemptTrack records
  attempts.forEach(att => {
    let topicId = null;
    if (att.questionId && att.questionId.topicId) {
      topicId = typeof att.questionId.topicId === 'object' && att.questionId.topicId._id
        ? att.questionId.topicId._id.toString()
        : att.questionId.topicId.toString();
    }

    if (topicId && topicStats[topicId]) {
      const stat = topicStats[topicId];
      stat.totalAttempts++;
      if (att.status === 'Accepted') {
        stat.passedAttempts++;
      } else {
        stat.failedAttempts++;
      }
    }
  });

  // Calculate attempt-based accuracy
  Object.values(topicStats).forEach(stat => {
    if (stat.totalAttempts > 0) {
      stat.accuracy = Math.round((stat.passedAttempts / stat.totalAttempts) * 100);
    }
  });

  // Merge WeaknessAnalysis records
  weaknesses.forEach(w => {
    const tId = w.topicId?._id ? w.topicId._id.toString() : (w.topicId ? w.topicId.toString() : null);
    if (tId && topicStats[tId]) {
      const stat = topicStats[tId];
      stat.repeatFailures = Math.max(stat.repeatFailures, w.failureCount || 0);
      if (typeof w.accuracyPercentage === 'number' && stat.accuracy === null) {
        stat.accuracy = w.accuracyPercentage;
      }
    }
  });

  // Merge AssessmentAnalysis snapshots if present
  if (latestAnalysis) {
    if (Array.isArray(latestAnalysis.strongTopics)) {
      latestAnalysis.strongTopics.forEach(st => {
        const tId = st.topicId ? st.topicId.toString() : null;
        if (tId && topicStats[tId]) {
          topicStats[tId].isStrongInAssessment = true;
          if (topicStats[tId].accuracy === null) topicStats[tId].accuracy = st.accuracy;
        }
      });
    }

    if (Array.isArray(latestAnalysis.weakTopics)) {
      latestAnalysis.weakTopics.forEach(wt => {
        const tId = wt.topicId ? wt.topicId.toString() : null;
        if (tId && topicStats[tId]) {
          topicStats[tId].isWeakInAssessment = true;
          topicStats[tId].assessmentPriority = wt.priority;
          if (topicStats[tId].accuracy === null) topicStats[tId].accuracy = wt.accuracy;
        }
      });
    }
  }

  // Determine Classifications
  Object.values(topicStats).forEach(stat => {
    if (stat.isStrongInAssessment || (stat.accuracy !== null && stat.accuracy >= 80)) {
      stat.classification = 'STRONG';
    } else if (stat.isWeakInAssessment || (stat.accuracy !== null && stat.accuracy < 40) || stat.repeatFailures >= 3) {
      stat.classification = 'CRITICAL';
    } else if (stat.accuracy !== null && stat.accuracy < 60) {
      stat.classification = 'WEAK';
    } else if (stat.accuracy !== null && stat.accuracy < 80) {
      stat.classification = 'DEVELOPING';
    }
  });

  // Helper: Classify guidance per topic
  const classifyTopicGuidance = (stat) => {
    let priorityScore = 50;
    let priority = 'Medium';
    let activity = 'TARGETED_PRACTICE';
    let difficulty = 'Medium';
    let reason = 'Sequential learning node.';

    if (stat.classification === 'CRITICAL') {
      priorityScore = 90;
      priority = 'High';
      activity = 'EASIER_PRACTICE';
      difficulty = 'Easy';
      reason = stat.isWeakInAssessment
        ? `Assessment identified low accuracy (${stat.accuracy ?? 35}%). Master basic patterns before advancing.`
        : `Critical weakness with repeated failures. Fundamental review recommended.`;
    } else if (stat.classification === 'WEAK') {
      priorityScore = 75;
      priority = 'High';
      activity = 'WEAK_TOPIC_REVISION';
      difficulty = 'Easy';
      reason = `Moderate assessment/practice accuracy (${stat.accuracy}%). Focused guided practice recommended.`;
    } else if (stat.classification === 'DEVELOPING') {
      priorityScore = 60;
      priority = 'Medium';
      activity = 'TARGETED_PRACTICE';
      difficulty = 'Medium';
      reason = `Progressing steadily (${stat.accuracy}% accuracy). Solve Medium problems to gain full mastery.`;
    } else if (stat.classification === 'STRONG') {
      priorityScore = 40;
      priority = 'Low';
      activity = 'HARDER_PRACTICE';
      difficulty = 'Hard';
      reason = `Strong performance demonstrated (${stat.accuracy}% accuracy). Recommended for periodic revision and Hard challenges.`;
    }

    // Adjust for Target Date urgency
    if (daysRemaining !== null && daysRemaining <= 30) {
      if (priority === 'Critical' || priority === 'High') {
        priorityScore = Math.min(100, priorityScore + 10);
        reason += ` [Urgent: Target date in ${daysRemaining} days]`;
      }
    }

    return { priorityScore, priority, activity, difficulty, reason };
  };

  // 3. Assemble or update Roadmap document
  let roadmapDoc = existingRoadmap;
  let nodesChanged = false;

  let nodesToProcess = [];

  if (roadmapDoc && Array.isArray(roadmapDoc.nodes) && roadmapDoc.nodes.length > 0) {
    // Preserve existing roadmap node structure!
    nodesToProcess = roadmapDoc.nodes.map(n => {
      const tId = n.topicId?._id ? n.topicId._id.toString() : (n.topicId ? n.topicId.toString() : null);
      const stat = tId ? topicStats[tId] : null;
      const guidance = stat ? classifyTopicGuidance(stat) : {
        priorityScore: n.priorityScore || 50,
        priority: n.priority || 'Medium',
        activity: n.recommendedActivity || 'TARGETED_PRACTICE',
        difficulty: n.recommendedDifficulty || 'Medium',
        reason: n.adaptiveReason || n.reason || 'Starter topic on your learning path.'
      };

      const nodeEstMins = defaultEstimatedMinutes;
      const nodeEstHours = Number((nodeEstMins / 60).toFixed(1));

      return {
        nodeId: n.nodeId,
        topicId: n.topicId,
        topicName: n.topicName || (n.topicId && typeof n.topicId === 'object' ? n.topicId.title : n.nodeId),
        subject: n.subject || (n.topicId && typeof n.topicId === 'object' ? n.topicId.category : 'dsa'),
        status: n.status || 'locked',
        priority: guidance.priority,
        priorityScore: guidance.priorityScore,
        estimatedHours: nodeEstHours,
        estimatedMinutes: nodeEstMins,
        recommendedActivity: guidance.activity,
        recommendedDifficulty: guidance.difficulty,
        adaptiveReason: guidance.reason,
        reason: guidance.reason,
        source: n.source || 'INITIAL'
      };
    });

    // Also add any new topic from catalog if performance data exists for it and it's missing from existing roadmap
    const existingTopicSet = new Set(
      roadmapDoc.nodes.map(n => (n.topicId?._id ? n.topicId._id.toString() : (n.topicId ? n.topicId.toString() : null))).filter(Boolean)
    );

    Object.values(topicStats).forEach(stat => {
      if (stat.topicId && !existingTopicSet.has(stat.topicId) && (stat.totalAttempts > 0 || stat.isWeakInAssessment || stat.isStrongInAssessment)) {
        const guidance = classifyTopicGuidance(stat);
        existingTopicSet.add(stat.topicId);
        nodesToProcess.push({
          nodeId: `node-${stat.topicId}`,
          topicId: stat.topicId,
          topicName: stat.topicName,
          subject: stat.category,
          status: 'in_progress',
          priority: guidance.priority,
          priorityScore: guidance.priorityScore,
          estimatedHours: Number((defaultEstimatedMinutes / 60).toFixed(1)),
          estimatedMinutes: defaultEstimatedMinutes,
          recommendedActivity: guidance.activity,
          recommendedDifficulty: guidance.difficulty,
          adaptiveReason: guidance.reason,
          reason: guidance.reason,
          source: latestAnalysis ? 'ASSESSMENT' : 'PRACTICE'
        });
      }
    });

  } else {
    // Generate new initial roadmap from topics catalog
    const topicList = topics.length > 0 ? topics : Object.values(topicStats);
    nodesToProcess = topicList.map(t => {
      const tId = t._id ? t._id.toString() : t.topicId;
      const stat = topicStats[tId] || {
        topicId: tId,
        topicName: t.title || 'Topic',
        category: t.category || t.subject || 'dsa',
        classification: 'UNATTEMPTED'
      };

      const guidance = classifyTopicGuidance(stat);
      const nodeEstMins = defaultEstimatedMinutes;
      const nodeEstHours = Number((nodeEstMins / 60).toFixed(1));

      return {
        nodeId: `node-${tId}`,
        topicId: t._id || tId,
        topicName: t.title || stat.topicName || 'Topic',
        subject: t.category || t.subject || stat.category || 'dsa',
        status: 'locked',
        priority: guidance.priority,
        priorityScore: guidance.priorityScore,
        estimatedHours: nodeEstHours,
        estimatedMinutes: nodeEstMins,
        recommendedActivity: guidance.activity,
        recommendedDifficulty: guidance.difficulty,
        adaptiveReason: guidance.reason,
        reason: guidance.reason,
        source: latestAnalysis ? 'ASSESSMENT' : (attempts.length > 0 ? 'PRACTICE' : 'INITIAL')
      };
    });
  }

  // Sort nodes dynamically according to personalized priority score descending
  nodesToProcess.sort((a, b) => b.priorityScore - a.priorityScore);

  // Assign sequence numbers after sorting
  nodesToProcess.forEach((node, idx) => {
    node.sequence = idx + 1;
  });

  // Unlock logic: Ensure at least one node is in_progress / CURRENT if no node is active
  const hasActiveNode = nodesToProcess.some(n => n.status === 'in_progress' || n.status === 'CURRENT');
  if (!hasActiveNode && nodesToProcess.length > 0) {
    const firstUncompleted = nodesToProcess.find(n => !['completed', 'COMPLETED', 'SKIPPED'].includes(n.status));
    if (firstUncompleted) {
      firstUncompleted.status = 'in_progress';
    }
  }

  if (!roadmapDoc) {
    roadmapDoc = new Roadmap({
      userId,
      nodes: nodesToProcess,
      lastGeneratedAt: new Date(),
      version: 1
    });
    nodesChanged = true;
  } else {
    roadmapDoc.nodes = nodesToProcess;
    roadmapDoc.lastGeneratedAt = new Date();
    roadmapDoc.version = (roadmapDoc.version || 1) + 1;
    nodesChanged = true;
  }

  await roadmapDoc.save();

  // Populate topic details for clean response return
  const populatedRoadmap = await Roadmap.findById(roadmapDoc._id)
    .populate('nodes.topicId', 'title category difficulty subject')
    .select('-__v')
    .lean();

  // 4. Calculate Sensible Summary & Current Learning Item
  const activeNode = (populatedRoadmap.nodes || []).find(n => n.status === 'in_progress' || n.status === 'CURRENT') || populatedRoadmap.nodes[0] || null;

  const currentLearningObj = activeNode ? {
    nodeId: activeNode.nodeId,
    topicName: activeNode.topicName || activeNode.topicId?.title || 'Starter Topic',
    subject: activeNode.subject || activeNode.topicId?.category || 'dsa',
    priority: activeNode.priority || 'Medium',
    recommendedActivity: activeNode.recommendedActivity,
    recommendedDifficulty: activeNode.recommendedDifficulty,
    reason: activeNode.adaptiveReason || activeNode.reason,
    estimatedMinutes: activeNode.estimatedMinutes || defaultEstimatedMinutes
  } : null;

  const adaptiveSummary = {
    updated: nodesChanged || forceRecalculate,
    reason: `Roadmap personalized using student performance, ${latestAnalysis ? 'assessment results' : 'practice history'}, daily capacity (${dailyPacingLabel}), and target date.`,
    dailyPreparationTime: dailyPacingLabel,
    daysRemainingTargetDate: daysRemaining,
    currentLearningItem: currentLearningObj,
    nextAction: currentLearningObj,
    totalNodes: (populatedRoadmap.nodes || []).length,
    completedNodesCount: (populatedRoadmap.nodes || []).filter(n => ['completed', 'COMPLETED'].includes(n.status)).length,
    inProgressNodesCount: (populatedRoadmap.nodes || []).filter(n => ['in_progress', 'CURRENT'].includes(n.status)).length,
    upcomingNodesCount: (populatedRoadmap.nodes || []).filter(n => ['locked', 'NOT_STARTED'].includes(n.status)).length
  };

  return {
    roadmap: populatedRoadmap,
    adaptiveSummary
  };
};
