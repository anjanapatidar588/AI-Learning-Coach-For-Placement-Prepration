import LearnerProfile from '../../models/LearnerProfile.js';
import AttemptTrack from '../../models/AttemptTrack.js';
import WeaknessAnalysis from '../../models/WeaknessAnalysis.js';
import Roadmap from '../../models/Roadmap.js';

/**
 * Builds a concise, safe, module-specific context object and prompt text for a student.
 * EXCLUDES sensitive fields (password, passwordHash, JWT, API keys, tokens, internal DB fields).
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} [requestedModule] - 'dsa' | 'aptitude' | 'cs_core' | general
 * @returns {Promise<{ rawContext: object, formattedText: string }>}
 */
export const buildStudentContext = async (userId, requestedModule) => {
  const normModule = (requestedModule || '').toLowerCase().trim();
  const validModule = ['dsa', 'aptitude', 'cs_core'].includes(normModule) ? normModule : null;

  // 1. Learner Profile
  const profile = await LearnerProfile.findOne({ userId })
    .select('currentSkillLevel targetRoles targetDate dsaMastery aptitudeMastery csCoreMastery overallReadinessScore readinessScore weaknessVector')
    .lean()
    .catch(() => null);

  const safeProfile = {
    currentSkillLevel: profile?.currentSkillLevel || 'Intermediate',
    targetRoles: Array.isArray(profile?.targetRoles) ? profile.targetRoles : [],
    targetDate: profile?.targetDate ? new Date(profile.targetDate).toISOString().split('T')[0] : null,
    readinessScore: profile?.overallReadinessScore ?? profile?.readinessScore ?? 0,
    dsaMastery: profile?.dsaMastery ?? 0,
    aptitudeMastery: profile?.aptitudeMastery ?? 0,
    csCoreMastery: profile?.csCoreMastery ?? 0,
  };

  // 2. Recent attempts filtered by module if specified
  const attemptQuery = { userId };
  if (validModule) {
    attemptQuery.category = validModule;
  }

  const recentAttempts = await AttemptTrack.find(attemptQuery)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('questionId', 'title difficulty category')
    .select('category status timeSpentSeconds hintsUsedCount createdAt questionId')
    .lean()
    .catch(() => []);

  const totalRecent = recentAttempts.length;
  const passedRecent = recentAttempts.filter(a => a.status === 'Accepted').length;
  const recentAccuracy = totalRecent > 0 ? Math.round((passedRecent / totalRecent) * 100) : null;

  const sanitizedAttempts = recentAttempts.map(att => ({
    title: att.questionId?.title || 'Practice Question',
    category: att.category,
    status: att.status,
    difficulty: att.questionId?.difficulty || 'Unknown',
    timeSpentSeconds: att.timeSpentSeconds || 0
  }));

  // 3. Weak areas filtered by module if specified
  const weaknessQuery = { userId };
  if (validModule) {
    weaknessQuery.category = validModule;
  }

  const weaknesses = await WeaknessAnalysis.find(weaknessQuery)
    .sort({ failureCount: -1, accuracyPercentage: 1 })
    .limit(5)
    .populate('topicId', 'title category')
    .select('category failureCount accuracyPercentage severity topicId')
    .lean()
    .catch(() => []);

  let sanitizedWeaknesses = weaknesses.map(w => ({
    topic: w.topicId?.title || w.category || 'Topic',
    category: w.category,
    accuracyPercentage: w.accuracyPercentage,
    severity: w.severity,
    failureCount: w.failureCount
  }));

  // Fallback to profile weaknessVector if WeaknessAnalysis collection has no records for this filter
  if (sanitizedWeaknesses.length === 0 && Array.isArray(profile?.weaknessVector)) {
    const filteredVector = validModule 
      ? profile.weaknessVector.filter(w => (w.module || '').toLowerCase() === validModule)
      : profile.weaknessVector;
    
    sanitizedWeaknesses = filteredVector.slice(0, 5).map(w => ({
      topic: w.topicName || 'Topic',
      category: w.module || validModule || 'general',
      errorCount: w.errorCount,
      scoreWeight: w.scoreWeight
    }));
  }

  // 4. Roadmap progress
  const roadmap = await Roadmap.findOne({ userId })
    .populate('nodes.topicId', 'title category')
    .select('nodes')
    .lean()
    .catch(() => null);

  let sanitizedRoadmap = [];
  if (roadmap && Array.isArray(roadmap.nodes)) {
    const activeNodes = roadmap.nodes
      .filter(n => n.status === 'in_progress' || n.status === 'completed' || n.status === 'locked')
      .slice(0, 3);

    sanitizedRoadmap = activeNodes.map(n => ({
      topic: n.topicId?.title || n.nodeId,
      status: n.status
    }));
  }

  // Build formatted text section for Gemini prompt
  const profileLines = [
    `- Skill Level: ${safeProfile.currentSkillLevel}`,
    `- Target Roles: ${safeProfile.targetRoles.length ? safeProfile.targetRoles.join(', ') : 'Not set'}`,
    `- Target Date: ${safeProfile.targetDate || 'Not set'}`,
    `- Overall Readiness Score: ${safeProfile.readinessScore}%`,
    `- Mastery Ratings: DSA (${safeProfile.dsaMastery}%), Aptitude (${safeProfile.aptitudeMastery}%), CS Core (${safeProfile.csCoreMastery}%)`
  ].join('\n');

  let recentLines = '';
  if (totalRecent > 0) {
    const attemptsSummaryStr = sanitizedAttempts
      .map(a => `  * ${a.title} [${a.category}] (${a.difficulty}) - Status: ${a.status}`)
      .join('\n');
    recentLines = [
      `- Filter/Module Scope: ${validModule || 'all'}`,
      `- Total Recent Attempts: ${totalRecent}`,
      `- Recent Accuracy: ${recentAccuracy}% (${passedRecent}/${totalRecent} accepted)`,
      `- Recent Activity:`,
      attemptsSummaryStr
    ].join('\n');
  } else {
    recentLines = `- Filter/Module Scope: ${validModule || 'all'}\n- No recent attempts recorded for this module.`;
  }

  let weaknessLines = '';
  if (sanitizedWeaknesses.length > 0) {
    weaknessLines = sanitizedWeaknesses
      .map(w => `- Topic: ${w.topic} (Category: ${w.category}${w.accuracyPercentage !== undefined ? `, Accuracy: ${w.accuracyPercentage}%` : ''}${w.severity ? `, Severity: ${w.severity}` : ''}${w.failureCount ? `, Failures: ${w.failureCount}` : ''})`)
      .join('\n');
  } else {
    weaknessLines = '- No specific weak areas recorded in context for this module.';
  }

  let roadmapLines = '';
  if (sanitizedRoadmap.length > 0) {
    roadmapLines = sanitizedRoadmap
      .map(r => `- Topic/Node: ${r.topic} (Status: ${r.status})`)
      .join('\n');
  } else {
    roadmapLines = '- No active roadmap nodes recorded in context.';
  }

  const formattedText = [
    'Student Profile:',
    profileLines,
    '',
    'Recent Performance:',
    recentLines,
    '',
    'Weak Areas:',
    weaknessLines,
    '',
    'Roadmap Progress:',
    roadmapLines
  ].join('\n');

  return {
    rawContext: {
      profile: safeProfile,
      recentPerformance: {
        moduleScope: validModule || 'all',
        totalAttempts: totalRecent,
        passedAttempts: passedRecent,
        accuracyPercentage: recentAccuracy,
        attempts: sanitizedAttempts
      },
      weakAreas: sanitizedWeaknesses,
      roadmapProgress: sanitizedRoadmap
    },
    formattedText
  };
};
