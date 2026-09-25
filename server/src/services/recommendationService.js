import LearnerProfile from '../models/LearnerProfile.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import Roadmap from '../models/Roadmap.js';

/**
 * Deterministically generates at most 5 personalized study recommendations
 * based strictly on stored student profile, weaknesses, roadmap, and attempts.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Array<object>>}
 */
export const generateRecommendations = async (userId) => {
  const recommendations = [];
  const seenKeys = new Set();

  const addRecommendation = (rec) => {
    const key = `${rec.type}_${rec.category}_${rec.topicName || 'general'}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      recommendations.push(rec);
    }
  };

  // Fetch student data cleanly
  const [profile, weaknesses, roadmap, attempts] = await Promise.all([
    LearnerProfile.findOne({ userId }).populate('weaknessVector.topicId', 'title category').lean().catch(() => null),
    WeaknessAnalysis.find({ userId }).populate('topicId', 'title category').lean().catch(() => []),
    Roadmap.findOne({ userId }).populate('nodes.topicId', 'title category').lean().catch(() => null),
    AttemptTrack.find({ userId }).sort({ createdAt: -1 }).limit(20).populate({
      path: 'questionId',
      select: 'title difficulty category topicId',
      populate: { path: 'topicId', select: 'title category' }
    }).lean().catch(() => [])
  ]);

  // A. Process WeaknessAnalysis records
  if (Array.isArray(weaknesses) && weaknesses.length > 0) {
    weaknesses.forEach(w => {
      const topicName = w.topicId?.title || w.category || 'Weak Topic';
      const topicId = w.topicId?._id ? w.topicId._id.toString() : null;
      const category = w.category || w.topicId?.category || 'dsa';
      const accuracy = typeof w.accuracyPercentage === 'number' ? w.accuracyPercentage : null;
      const severity = w.severity || 'Medium';
      const failures = w.failureCount || 0;

      if ((accuracy !== null && accuracy < 40) || severity === 'High' || failures >= 3) {
        addRecommendation({
          type: 'EASIER_PRACTICE',
          priority: 'high',
          category,
          topicId,
          topicName,
          title: `Master ${topicName} Fundamentals`,
          reason: accuracy !== null 
            ? `Your accuracy in ${topicName} is currently low (${accuracy}% accuracy with ${failures} failed attempts).`
            : `High severity weakness detected in ${topicName} with ${failures} failed attempts.`,
          action: `Start with Easy level ${topicName} questions to rebuild core understanding.`
        });
      } else if ((accuracy !== null && accuracy < 60) || severity === 'Medium') {
        addRecommendation({
          type: 'WEAK_TOPIC_REVISION',
          priority: (accuracy !== null && accuracy < 50) ? 'high' : 'medium',
          category,
          topicId,
          topicName,
          title: `Revise ${topicName}`,
          reason: accuracy !== null
            ? `Your recent performance in ${topicName} shows room for improvement (${accuracy}% accuracy).`
            : `Moderate weakness detected in ${topicName}.`,
          action: `Review ${topicName} concept notes and attempt revision problems.`
        });
      } else if (accuracy !== null && accuracy < 75) {
        addRecommendation({
          type: 'TARGETED_PRACTICE',
          priority: 'medium',
          category,
          topicId,
          topicName,
          title: `Targeted Practice for ${topicName}`,
          reason: `Your accuracy in ${topicName} is ${accuracy}%, which can be improved with additional practice.`,
          action: `Solve 3 to 5 targeted ${topicName} practice problems to boost accuracy.`
        });
      }
    });
  }

  // B. Fallback to LearnerProfile weaknessVector if WeaknessAnalysis has no records
  if (recommendations.length < 3 && profile?.weaknessVector && Array.isArray(profile.weaknessVector)) {
    profile.weaknessVector.forEach(w => {
      const topicName = w.topicId?.title || w.topicName || 'Weak Area';
      const topicId = w.topicId?._id ? w.topicId._id.toString() : null;
      const category = w.module || w.topicId?.category || 'dsa';
      const errorCount = w.errorCount || 0;

      if (errorCount > 0) {
        addRecommendation({
          type: 'WEAK_TOPIC_REVISION',
          priority: errorCount >= 3 ? 'high' : 'medium',
          category,
          topicId,
          topicName,
          title: `Focus on ${topicName}`,
          reason: `You have accumulated ${errorCount} errors in ${topicName}.`,
          action: `Review core concepts and complete revision exercises.`
        });
      }
    });
  }

  // C. Process Roadmap active/upcoming items
  if (roadmap?.nodes && Array.isArray(roadmap.nodes)) {
    const activeNodes = roadmap.nodes.filter(n => n.status === 'in_progress' || n.status === 'locked');
    activeNodes.slice(0, 2).forEach(n => {
      const topicName = n.topicId?.title || n.nodeId;
      const topicId = n.topicId?._id ? n.topicId._id.toString() : null;
      const category = n.topicId?.category || 'dsa';
      const statusLabel = n.status === 'in_progress' ? 'in progress' : 'upcoming';

      addRecommendation({
        type: 'ROADMAP_NEXT',
        priority: n.status === 'in_progress' ? 'medium' : 'low',
        category,
        topicId,
        topicName,
        title: `Continue Roadmap: ${topicName}`,
        reason: `${topicName} is currently ${statusLabel} on your learning roadmap.`,
        action: `Complete the recommended lessons and exercises for ${topicName}.`
      });
    });
  }

  // D. Process Attempts aggregation (if recent attempts exist)
  if (recommendations.length < 3 && Array.isArray(attempts) && attempts.length > 0) {
    const topicStats = {};
    attempts.forEach(att => {
      let topicName = 'Practice Problem';
      let topicId = null;
      if (att.questionId?.topicId) {
        topicName = att.questionId.topicId.title || att.questionId.title || topicName;
        topicId = att.questionId.topicId._id ? att.questionId.topicId._id.toString() : null;
      } else if (att.questionId?.title) {
        topicName = att.questionId.title;
      }

      const cat = att.category || 'dsa';
      const key = `${cat}::${topicName}`;
      if (!topicStats[key]) {
        topicStats[key] = {
          topicName,
          category: cat,
          topicId,
          total: 0,
          passed: 0
        };
      }
      topicStats[key].total += 1;
      if (att.status === 'Accepted') {
        topicStats[key].passed += 1;
      }
    });

    Object.values(topicStats).forEach(stat => {
      const accuracy = Math.round((stat.passed / stat.total) * 100);
      if (accuracy < 50 && stat.total >= 2) {
        addRecommendation({
          type: 'TARGETED_PRACTICE',
          priority: 'high',
          category: stat.category,
          topicId: stat.topicId,
          topicName: stat.topicName,
          title: `Targeted Practice for ${stat.topicName}`,
          reason: `Recent attempts in ${stat.topicName} show ${accuracy}% accuracy (${stat.passed}/${stat.total} accepted).`,
          action: `Practice 3 medium-difficulty questions in ${stat.topicName}.`
        });
      } else if (accuracy >= 80 && stat.total >= 3) {
        addRecommendation({
          type: 'HARDER_PRACTICE',
          priority: 'low',
          category: stat.category,
          topicId: stat.topicId,
          topicName: stat.topicName,
          title: `Challenge Yourself in ${stat.topicName}`,
          reason: `High mastery demonstrated in ${stat.topicName} with ${accuracy}% accuracy across ${stat.total} attempts.`,
          action: `Attempt Hard level questions to test advanced problem-solving skills.`
        });
      }
    });

    // General Revision fallback if recent performance exists but overall accuracy is low
    const totalAttempts = attempts.length;
    const totalPassed = attempts.filter(a => a.status === 'Accepted').length;
    const overallAcc = totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0;

    if (overallAcc < 60 && totalAttempts >= 3) {
      addRecommendation({
        type: 'GENERAL_REVISION',
        priority: 'medium',
        category: 'general',
        topicId: null,
        topicName: 'General Practice',
        title: 'General Revision & Refresher',
        reason: `Your overall practice accuracy across recent attempts is ${overallAcc}%.`,
        action: `Review recent incorrect submissions and attempt fresh practice sets.`
      });
    }
  }

  // E. Process Learner Profile Mastery for HARDER_PRACTICE
  if (profile) {
    const masteries = [
      { category: 'dsa', score: profile.dsaMastery, name: 'Data Structures & Algorithms' },
      { category: 'aptitude', score: profile.aptitudeMastery, name: 'Quantitative Aptitude' },
      { category: 'cs_core', score: profile.csCoreMastery, name: 'CS Core Subjects' }
    ];

    masteries.forEach(m => {
      if (m.score >= 80) {
        addRecommendation({
          type: 'HARDER_PRACTICE',
          priority: 'low',
          category: m.category,
          topicId: null,
          topicName: m.name,
          title: `Advance in ${m.name}`,
          reason: `You have achieved ${m.score}% mastery in ${m.name}.`,
          action: `Take on hard-level challenges or timed mock problems.`
        });
      }
    });
  }

  // Priority sorting: high -> medium -> low
  const priorityWeight = { high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

  // Return at most 5 recommendations
  return recommendations.slice(0, 5);
};
