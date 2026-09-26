import Roadmap from '../models/Roadmap.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import LearnerProfile from '../models/LearnerProfile.js';
import Topic from '../models/Topic.js';

/**
 * Deterministically adapts a student's learning roadmap based strictly on
 * measured performance (AttemptTrack, WeaknessAnalysis, LearnerProfile, Topic).
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {object} [options={}]
 * @param {boolean} [options.forceRecalculate=false]
 * @returns {Promise<{ roadmap: object, adaptiveSummary: object }>}
 */
export const adaptStudentRoadmap = async (userId, options = {}) => {
  const forceRecalculate = !!options.forceRecalculate;

  // 1. Fetch student performance data & existing roadmap
  const [existingRoadmap, attempts, weaknesses, profile, topics] = await Promise.all([
    Roadmap.findOne({ userId }),
    AttemptTrack.find({ userId }).populate({
      path: 'questionId',
      select: 'title category difficulty topicId',
      populate: { path: 'topicId', select: 'title category' }
    }).lean().catch(() => []),
    WeaknessAnalysis.find({ userId }).populate('topicId', 'title category').lean().catch(() => []),
    LearnerProfile.findOne({ userId }).lean().catch(() => null),
    Topic.find().sort({ order: 1, createdAt: 1 }).lean().catch(() => [])
  ]);

  const hasPerformanceData = attempts.length > 0 || weaknesses.length > 0;

  // 2. Handle cases where student has NO performance data & NO existing roadmap
  if (!existingRoadmap && !hasPerformanceData) {
    let initialNodes = [];
    if (Array.isArray(topics) && topics.length > 0) {
      initialNodes = topics.slice(0, 5).map((t, idx) => ({
        nodeId: `node-${t._id}`,
        topicId: t._id,
        status: idx === 0 ? 'in_progress' : 'locked',
        priorityScore: 50,
        estimatedHours: 3,
        recommendedActivity: 'TARGETED_PRACTICE',
        recommendedDifficulty: t.difficulty || 'Medium',
        adaptiveReason: idx === 0 ? 'Starter topic on your learning path.' : 'Upcoming topic on your learning path.'
      }));
    }

    const newRoadmap = new Roadmap({
      userId,
      nodes: initialNodes,
      lastGeneratedAt: new Date(),
      version: 1
    });

    await newRoadmap.save().catch(() => {});

    // Populate topic details for clean return
    const populated = await Roadmap.findById(newRoadmap._id)
      .populate('nodes.topicId', 'title category difficulty subject')
      .lean();

    return {
      roadmap: populated,
      adaptiveSummary: {
        updated: false,
        reason: 'Initial starter roadmap created. Practice problems to unlock performance-based adaptive recommendations.',
        nextAction: populated.nodes && populated.nodes.length > 0 ? {
          category: populated.nodes[0].topicId?.category || 'dsa',
          topicName: populated.nodes[0].topicId?.title || 'Arrays',
          activityType: 'TARGETED_PRACTICE',
          difficulty: 'Medium',
          priority: 'Medium',
          reason: 'Starter topic on your learning path.'
        } : null
      }
    };
  }

  // 3. If no existing roadmap but performance data exists, construct initial roadmap from topics
  let roadmapDoc = existingRoadmap;
  if (!roadmapDoc) {
    let initialNodes = [];
    if (Array.isArray(topics) && topics.length > 0) {
      initialNodes = topics.slice(0, 6).map((t, idx) => ({
        nodeId: `node-${t._id}`,
        topicId: t._id,
        status: idx === 0 ? 'in_progress' : 'locked',
        priorityScore: 50,
        estimatedHours: 3,
        recommendedActivity: 'TARGETED_PRACTICE',
        recommendedDifficulty: t.difficulty || 'Medium',
        adaptiveReason: 'Sequential roadmap node.'
      }));
    }
    roadmapDoc = new Roadmap({
      userId,
      nodes: initialNodes,
      lastGeneratedAt: new Date(),
      version: 1
    });
  }

  // 4. Calculate Topic-Level Performance Metrics Map
  const topicStats = {};

  // Aggregate AttemptTrack records by topic
  attempts.forEach(att => {
    let topicId = null;
    let topicName = 'General Topic';
    let category = att.category || 'dsa';

    if (att.questionId && att.questionId.topicId) {
      if (typeof att.questionId.topicId === 'object' && att.questionId.topicId._id) {
        topicId = att.questionId.topicId._id.toString();
        topicName = att.questionId.topicId.title || topicName;
      } else {
        topicId = att.questionId.topicId.toString();
      }
    }

    if (!topicId && att.questionId && att.questionId.title) {
      topicName = att.questionId.title;
    }

    const key = topicId || `${category}::${topicName}`;
    if (!topicStats[key]) {
      topicStats[key] = {
        topicId,
        topicName,
        category,
        totalAttempts: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        accuracy: 0,
        highWeakness: false,
        mediumWeakness: false
      };
    }

    topicStats[key].totalAttempts += 1;
    if (att.status === 'Accepted') {
      topicStats[key].passedAttempts += 1;
    } else {
      topicStats[key].failedAttempts += 1;
    }
  });

  // Calculate accuracy
  Object.values(topicStats).forEach(stat => {
    stat.accuracy = Math.round((stat.passedAttempts / stat.totalAttempts) * 100);
  });

  // Merge WeaknessAnalysis records into topicStats
  if (Array.isArray(weaknesses)) {
    weaknesses.forEach(w => {
      const topicId = w.topicId?._id ? w.topicId._id.toString() : (w.topicId ? w.topicId.toString() : null);
      const category = w.category || w.topicId?.category || 'dsa';
      const key = topicId || `${category}::${w.topicId?.title || 'weak'}`;

      if (!topicStats[key]) {
        topicStats[key] = {
          topicId,
          topicName: w.topicId?.title || 'Weak Area',
          category,
          totalAttempts: w.failureCount || 0,
          passedAttempts: 0,
          failedAttempts: w.failureCount || 0,
          accuracy: typeof w.accuracyPercentage === 'number' ? w.accuracyPercentage : 30,
          highWeakness: false,
          mediumWeakness: false
        };
      }

      const acc = typeof w.accuracyPercentage === 'number' ? w.accuracyPercentage : topicStats[key].accuracy;
      if (acc < 40 || w.severity === 'High' || (w.failureCount || 0) >= 3) {
        topicStats[key].highWeakness = true;
      } else if (acc < 60 || w.severity === 'Medium') {
        topicStats[key].mediumWeakness = true;
      }
    });
  }

  // Merge LearnerProfile weaknessVector if present
  if (profile && Array.isArray(profile.weaknessVector)) {
    profile.weaknessVector.forEach(w => {
      const topicId = w.topicId ? w.topicId.toString() : null;
      if (topicId && topicStats[topicId]) {
        if ((w.errorCount || 0) >= 3) {
          topicStats[topicId].highWeakness = true;
        }
      }
    });
  }

  // Helper: Determine topic classification & adaptive guidance
  const classifyTopic = (stat) => {
    if (!stat || stat.totalAttempts === 0) {
      return {
        level: 'UNATTEMPTED',
        priorityScore: 50,
        activity: 'TARGETED_PRACTICE',
        difficulty: 'Medium',
        priorityLabel: 'Medium',
        reason: 'Upcoming topic on your learning path.'
      };
    }

    const { accuracy, totalAttempts, highWeakness, mediumWeakness, failedAttempts } = stat;

    // RULE 1: VERY WEAK TOPIC
    if (accuracy < 40 || highWeakness || failedAttempts >= 3) {
      return {
        level: 'VERY_WEAK',
        priorityScore: 90,
        activity: 'EASIER_PRACTICE',
        difficulty: 'Easy',
        priorityLabel: 'High',
        reason: `Low accuracy (${accuracy}%) with ${failedAttempts} failed attempt(s). Focus on Easy concept revision.`
      };
    }

    // RULE 2: WEAK / DEVELOPING TOPIC
    if (accuracy < 60 || mediumWeakness) {
      return {
        level: 'WEAK',
        priorityScore: 75,
        activity: 'WEAK_TOPIC_REVISION',
        difficulty: 'Easy',
        priorityLabel: 'High',
        reason: `Moderate accuracy (${accuracy}%). Concept notes revision and guided practice recommended.`
      };
    }

    // RULE 3: DEVELOPING TOPIC
    if (accuracy < 80) {
      return {
        level: 'DEVELOPING',
        priorityScore: 60,
        activity: 'TARGETED_PRACTICE',
        difficulty: 'Medium',
        priorityLabel: 'Medium',
        reason: `Progressing steadily (${accuracy}% accuracy). Solve Medium practice problems to boost mastery.`
      };
    }

    // RULE 4: MASTERED TOPIC
    if (accuracy >= 85 && totalAttempts >= 5 && !highWeakness && !mediumWeakness) {
      return {
        level: 'MASTERED',
        priorityScore: 20,
        activity: 'MAINTENANCE',
        difficulty: 'Hard',
        priorityLabel: 'Low',
        reason: `High mastery demonstrated (${accuracy}% accuracy across ${totalAttempts} attempts). Topic is mastered.`
      };
    }

    // RULE 5: STRONG TOPIC
    return {
      level: 'STRONG',
      priorityScore: 40,
      activity: 'HARDER_PRACTICE',
      difficulty: 'Hard',
      priorityLabel: 'Low',
      reason: `Strong accuracy (${accuracy}% across ${totalAttempts} attempts). Attempt Hard practice challenges.`
    };
  };

  // 5. Update Existing Roadmap Nodes Safely
  let nodesChanged = false;

  const updatedNodes = (roadmapDoc.nodes || []).map(node => {
    // Preserve completed historical tasks
    if (node.status === 'completed') {
      return node;
    }

    const tId = node.topicId ? node.topicId.toString() : null;
    const stat = tId ? topicStats[tId] : null;

    if (!stat && !hasPerformanceData) {
      return node; // No changes if no performance data for this topic
    }

    const guidance = classifyTopic(stat);

    // Check if priority or guidance actually changed to prevent thrashing
    if (
      node.priorityScore !== guidance.priorityScore ||
      node.recommendedActivity !== guidance.activity ||
      node.recommendedDifficulty !== guidance.difficulty ||
      node.adaptiveReason !== guidance.reason
    ) {
      nodesChanged = true;
      node.priorityScore = guidance.priorityScore;
      node.recommendedActivity = guidance.activity;
      node.recommendedDifficulty = guidance.difficulty;
      node.adaptiveReason = guidance.reason;
    }

    // Unlock logic: If a topic becomes STRONG or MASTERED and status is in_progress, keep in_progress or complete
    if (guidance.level === 'MASTERED' && node.status === 'in_progress') {
      node.status = 'completed';
      nodesChanged = true;
    }

    return node;
  });

  // Check if any locked node should unlock if previous nodes are completed/mastered
  const hasInProgress = updatedNodes.some(n => n.status === 'in_progress');
  if (!hasInProgress) {
    const firstLocked = updatedNodes.find(n => n.status === 'locked');
    if (firstLocked) {
      firstLocked.status = 'in_progress';
      nodesChanged = true;
    }
  }

  roadmapDoc.nodes = updatedNodes;

  // 6. Save if changes occurred or if forceRecalculate requested
  if (nodesChanged || forceRecalculate || !existingRoadmap) {
    roadmapDoc.lastGeneratedAt = new Date();
    if (existingRoadmap) {
      roadmapDoc.version = (roadmapDoc.version || 1) + 1;
    }
    await roadmapDoc.save();
  }

  // 7. Calculate Sensible `nextAction`
  let nextAction = null;
  const activeNodes = (roadmapDoc.nodes || []).filter(n => n.status === 'in_progress' || n.status === 'locked');

  // Sort active nodes by priorityScore descending to select next action
  const sortedActive = [...activeNodes].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  if (sortedActive.length > 0) {
    const topNode = sortedActive[0];
    const tId = topNode.topicId ? topNode.topicId.toString() : null;
    const stat = tId ? topicStats[tId] : null;
    const guidance = classifyTopic(stat);

    // Fetch topic title if populated or available
    let topicName = stat?.topicName || 'DSA & Algorithms';
    let category = stat?.category || 'dsa';

    if (topNode.topicId && typeof topNode.topicId === 'object' && topNode.topicId.title) {
      topicName = topNode.topicId.title;
      category = topNode.topicId.category || category;
    }

    nextAction = {
      category,
      topicName,
      activityType: topNode.recommendedActivity || guidance.activity,
      difficulty: topNode.recommendedDifficulty || guidance.difficulty,
      priority: guidance.priorityLabel,
      reason: topNode.adaptiveReason || guidance.reason
    };
  }

  // 8. Populate Roadmap Nodes for Return
  const populatedRoadmap = await Roadmap.findById(roadmapDoc._id)
    .populate('nodes.topicId', 'title category difficulty subject')
    .select('-__v')
    .lean();

  const summaryReason = nodesChanged || forceRecalculate
    ? `Roadmap priorities updated dynamically based on ${attempts.length} practice attempts and ${weaknesses.length} identified weak areas.`
    : 'Roadmap is up-to-date with your current learning progress.';

  return {
    roadmap: populatedRoadmap,
    adaptiveSummary: {
      updated: nodesChanged || forceRecalculate,
      reason: summaryReason,
      nextAction
    }
  };
};
