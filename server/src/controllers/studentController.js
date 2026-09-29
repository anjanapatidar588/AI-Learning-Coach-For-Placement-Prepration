import LearnerProfile from '../models/LearnerProfile.js';
import Roadmap from '../models/Roadmap.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import AssessmentAnalysis from '../models/AssessmentAnalysis.js';
import Achievement from '../models/Achievement.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';
import { generateRecommendations } from '../services/recommendationService.js';
import { calculateReadinessScore } from '../services/readinessScoreService.js';
import { adaptStudentRoadmap } from '../services/adaptiveRoadmapService.js';

import MistakeJournal from '../models/MistakeJournal.js';
import RevisionCard from '../models/RevisionCard.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Fetch user without sensitive data
    const user = await User.findById(userId).select('-passwordHash -__v');

    let profile = await LearnerProfile.findOne({ userId }).select('-__v');
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    // Calculate deterministic Placement Readiness Score
    const readinessDetails = await calculateReadinessScore(userId);

    // Re-fetch updated profile to reflect synced scores
    profile = await LearnerProfile.findOne({ userId }).select('-__v');

    let roadmapPreview = null;
    let currentRoadmapItem = null;
    let todayTasks = [];
    let strongAreas = [];
    let weakAreas = [];
    let roadmapProgressPercent = 0;
    let assessmentStatus = {
      completed: profile.baselineAssessmentCompleted || false,
      score: profile.baselineScore || 0,
      completedAt: profile.baselineCompletedAt || null
    };

    const existingRoadmap = await Roadmap.findOne({ userId });
    const hasAttempts = await AttemptTrack.exists({ userId });
    const latestAnalysis = await AssessmentAnalysis.findOne({ studentId: userId }).sort({ generatedAt: -1 }).lean().catch(() => null);

    let completedTopicsCount = 0;
    let totalTopicsCount = 0;

    if (existingRoadmap || hasAttempts || latestAnalysis) {
      const { roadmap: adaptiveRoadmap, adaptiveSummary } = await adaptStudentRoadmap(userId, { forceRecalculate: false });
      const roadmapNodes = adaptiveRoadmap?.nodes || [];

      if (roadmapNodes.length > 0) {
        roadmapPreview = roadmapNodes.slice(0, 5).map(node => ({
          nodeId: node.nodeId,
          title: node.topicName || node.topicId?.title || node.nodeId,
          category: node.subject || node.topicId?.category || 'dsa',
          status: node.status,
          priority: node.priority || 'Medium',
          priorityScore: node.priorityScore,
          estimatedMinutes: node.estimatedMinutes || 45,
          estimatedHours: node.estimatedHours || 0.75,
          recommendedActivity: node.recommendedActivity,
          recommendedDifficulty: node.recommendedDifficulty,
          adaptiveReason: node.adaptiveReason || node.reason
        }));

        currentRoadmapItem = adaptiveSummary?.currentLearningItem || roadmapPreview.find(n => ['in_progress', 'CURRENT'].includes(n.status)) || roadmapPreview[0];
        todayTasks = roadmapNodes.filter(n => ['in_progress', 'CURRENT'].includes(n.status)).slice(0, 3);
        if (todayTasks.length === 0 && roadmapNodes.length > 0) {
          todayTasks = [roadmapNodes[0]];
        }

        completedTopicsCount = roadmapNodes.filter(n => ['completed', 'COMPLETED'].includes(n.status)).length;
        totalTopicsCount = roadmapNodes.length;
        roadmapProgressPercent = Math.round((completedTopicsCount / roadmapNodes.length) * 100);
      }
    }

    if (latestAnalysis) {
      strongAreas = (latestAnalysis.strongTopics || []).map(s => s.topicName);
      weakAreas = (latestAnalysis.weakTopics || []).map(w => ({ topicName: w.topicName, priority: w.priority, accuracy: w.accuracy }));
    }

    const recentActivity = await AttemptTrack.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('questionId', 'title difficulty category')
      .select('-__v')
      .catch(() => []);

    // Step 6 lightweight dashboard counts
    const totalSolvedQuestions = await AttemptTrack.countDocuments({ userId, isCorrect: true }).catch(() => 0);
    const unresolvedMistakesCount = await MistakeJournal.countDocuments({ userId, resolved: false }).catch(() => 0);
    const dueRevisionCardsCount = await RevisionCard.countDocuments({ userId, nextReviewAt: { $lte: new Date() } }).catch(() => 0);
    const reassessmentAvailable = Boolean(latestAnalysis || (weakAreas && weakAreas.length > 0));

    res.json({
      success: true,
      data: {
        user,
        profile,
        roadmapPreview,
        currentRoadmapItem,
        todayTasks,
        strongAreas,
        weakAreas,
        roadmapProgressPercent,
        completedTopicsCount,
        totalTopicsCount,
        totalSolvedQuestions,
        assessmentStatus,
        readinessScore: readinessDetails.score,
        readinessDetails,
        dailyGoal: null,
        recentActivity,
        unresolvedMistakesCount,
        dueRevisionCardsCount,
        reassessmentAvailable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    const profile = await LearnerProfile.findOne({ userId }).lean().catch(() => null);
    const existing = await Roadmap.findOne({ userId });
    const hasAttempts = await AttemptTrack.exists({ userId });
    const latestAnalysis = await AssessmentAnalysis.findOne({ studentId: userId }).sort({ generatedAt: -1 }).lean().catch(() => null);

    if (!existing && !hasAttempts && !latestAnalysis) {
      return res.json({ success: true, data: null, message: 'No roadmap found' });
    }

    const { roadmap, adaptiveSummary } = await adaptStudentRoadmap(userId, { forceRecalculate: false });

    if (!roadmap) {
      return res.json({ success: true, data: null, message: 'No roadmap found' });
    }

    res.json({
      success: true,
      data: formatRoadmapResponse(roadmap, adaptiveSummary, latestAnalysis, profile)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const formatRoadmapResponse = (roadmap, adaptiveSummary, latestAnalysis, profile) => {
  const nodes = (roadmap?.nodes || []).map(node => ({
    nodeId: node.nodeId,
    topicId: node.topicId?._id || node.topicId,
    topicName: node.topicName || node.topicId?.title || node.nodeId,
    subject: node.subject || node.topicId?.category || 'dsa',
    status: node.status,
    priority: node.priority || 'Medium',
    priorityScore: node.priorityScore || 50,
    estimatedMinutes: node.estimatedMinutes || 45,
    estimatedHours: node.estimatedHours || 0.75,
    recommendedActivity: node.recommendedActivity,
    recommendedDifficulty: node.recommendedDifficulty,
    adaptiveReason: node.adaptiveReason || node.reason,
    reason: node.adaptiveReason || node.reason,
    sequence: node.sequence,
    source: node.source
  }));

  // Subject-wise Learning Map Grouping
  const learningMapBySubject = {};
  nodes.forEach(node => {
    const subjKey = (node.subject || 'dsa').toLowerCase();
    if (!learningMapBySubject[subjKey]) {
      learningMapBySubject[subjKey] = {
        subjectName: subjKey.toUpperCase(),
        completed: [],
        current: [],
        upcoming: []
      };
    }
    const cat = learningMapBySubject[subjKey];
    if (['completed', 'COMPLETED'].includes(node.status)) {
      cat.completed.push(node);
    } else if (['in_progress', 'CURRENT', 'IN_PROGRESS'].includes(node.status)) {
      cat.current.push(node);
    } else {
      cat.upcoming.push(node);
    }
  });

  const completedCount = nodes.filter(n => ['completed', 'COMPLETED'].includes(n.status)).length;
  const overallProgressPercent = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;

  return {
    ...roadmap,
    nodes,
    learningMapBySubject,
    overallProgressPercent,
    currentLearningItem: adaptiveSummary?.currentLearningItem || nodes.find(n => ['in_progress', 'CURRENT'].includes(n.status)) || nodes[0] || null,
    todayRecommendedTasks: nodes.filter(n => ['in_progress', 'CURRENT'].includes(n.status)).slice(0, 3),
    strongAreas: latestAnalysis ? (latestAnalysis.strongTopics || []) : [],
    weakAreas: latestAnalysis ? (latestAnalysis.weakTopics || []) : [],
    priorityTopics: latestAnalysis ? (latestAnalysis.priorityTopics || []) : [],
    knowledgeGaps: latestAnalysis ? (latestAnalysis.knowledgeGaps || []) : [],
    aiInsights: latestAnalysis ? latestAnalysis.aiAnalysis : null,
    studentContext: {
      targetRole: profile?.targetRoles && profile.targetRoles.length > 0 ? profile.targetRoles[0] : 'Software Developer',
      graduationYear: profile?.graduationYear || null,
      targetDate: profile?.targetDate || null,
      dailyPreparationTime: profile?.dailyPreparationTime || '1-2 hours'
    },
    adaptiveSummary
  };
};

export const recalculateRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const profile = await LearnerProfile.findOne({ userId }).lean().catch(() => null);
    const latestAnalysis = await AssessmentAnalysis.findOne({ studentId: userId }).sort({ generatedAt: -1 }).lean().catch(() => null);

    const { roadmap, adaptiveSummary } = await adaptStudentRoadmap(userId, { forceRecalculate: true });

    res.json({
      success: true,
      message: 'Roadmap recalculated successfully',
      data: formatRoadmapResponse(roadmap, adaptiveSummary, latestAnalysis, profile)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/v1/student/roadmap/nodes/:nodeId/status
 * Allows student to update node status ('in_progress' | 'completed' | 'SKIPPED' | 'locked').
 * Strictly ignores any parameters attempting to tamper with assessment scores/accuracy.
 */
export const updateRoadmapNodeStatus = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { nodeId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['locked', 'in_progress', 'completed', 'NOT_STARTED', 'CURRENT', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    const roadmap = await Roadmap.findOne({ userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found for student' });
    }

    const targetNode = roadmap.nodes.find(n => n.nodeId === nodeId || (n.topicId && n.topicId.toString() === nodeId));
    if (!targetNode) {
      return res.status(404).json({ success: false, message: 'Roadmap node not found' });
    }

    // Update node status
    let normalizedStatus = status;
    if (status === 'CURRENT' || status === 'IN_PROGRESS') normalizedStatus = 'in_progress';
    if (status === 'COMPLETED') normalizedStatus = 'completed';
    if (status === 'NOT_STARTED') normalizedStatus = 'locked';

    targetNode.status = normalizedStatus;
    targetNode.updatedAt = new Date();

    // If marked completed, unlock the next locked node in sequence
    if (normalizedStatus === 'completed') {
      const nextLocked = roadmap.nodes.find(n => n.status === 'locked' && n.nodeId !== targetNode.nodeId);
      if (nextLocked) {
        nextLocked.status = 'in_progress';
      }
    }

    await roadmap.save();

    const profile = await LearnerProfile.findOne({ userId }).lean().catch(() => null);
    const latestAnalysis = await AssessmentAnalysis.findOne({ studentId: userId }).sort({ generatedAt: -1 }).lean().catch(() => null);

    const { roadmap: populated, adaptiveSummary } = await adaptStudentRoadmap(userId, { forceRecalculate: false });

    res.json({
      success: true,
      message: `Roadmap node updated to ${status}`,
      data: formatRoadmapResponse(populated, adaptiveSummary, latestAnalysis, profile)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProgressMetrics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    const attempts = await AttemptTrack.find({ userId }).sort({ createdAt: -1 });

    const createCategoryMetrics = () => ({
      totalAttempts: 0,
      passedAttempts: 0,
      failedAttempts: 0,
      accuracy: 0,
      totalTimeSpentSeconds: 0,
      hintsUsed: 0
    });

    const progress = {
      overall: createCategoryMetrics(),
      dsa: createCategoryMetrics(),
      aptitude: createCategoryMetrics(),
      csCore: createCategoryMetrics()
    };

    attempts.forEach(attempt => {
      const isPassed = attempt.status === 'Accepted';
      
      progress.overall.totalAttempts++;
      if (isPassed) progress.overall.passedAttempts++;
      else progress.overall.failedAttempts++;
      progress.overall.totalTimeSpentSeconds += (attempt.timeSpentSeconds || 0);
      progress.overall.hintsUsed += (attempt.hintsUsedCount || 0);

      let catKey = null;
      if (attempt.category === 'dsa') catKey = 'dsa';
      else if (attempt.category === 'aptitude') catKey = 'aptitude';
      else if (attempt.category === 'cs_core') catKey = 'csCore';

      if (catKey) {
        progress[catKey].totalAttempts++;
        if (isPassed) progress[catKey].passedAttempts++;
        else progress[catKey].failedAttempts++;
        progress[catKey].totalTimeSpentSeconds += (attempt.timeSpentSeconds || 0);
        progress[catKey].hintsUsed += (attempt.hintsUsedCount || 0);
      }
    });

    const calculateAccuracy = (metrics) => {
      if (metrics.totalAttempts === 0) return 0;
      return Math.round((metrics.passedAttempts / metrics.totalAttempts) * 100);
    };

    progress.overall.accuracy = calculateAccuracy(progress.overall);
    progress.dsa.accuracy = calculateAccuracy(progress.dsa);
    progress.aptitude.accuracy = calculateAccuracy(progress.aptitude);
    progress.csCore.accuracy = calculateAccuracy(progress.csCore);

    const recentActivity = attempts.slice(0, 5).map(a => ({
      questionId: a.questionId,
      category: a.category,
      status: a.status,
      timeSpentSeconds: a.timeSpentSeconds,
      createdAt: a.createdAt
    }));

    res.json({
      success: true,
      data: {
        ...progress,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWeakAreas = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    const attempts = await AttemptTrack.find({ userId }).populate({
      path: 'questionId',
      populate: { path: 'topicId' }
    });

    const topicStats = {};

    attempts.forEach(attempt => {
      let topicName = 'Unknown Topic';
      if (attempt.questionId) {
        if (attempt.questionId.topicId && attempt.questionId.topicId.title) {
          topicName = attempt.questionId.topicId.title;
        } else if (attempt.questionId.title) {
          topicName = attempt.questionId.title;
        }
      }

      const category = attempt.category || 'unknown';
      const key = `${category}::${topicName}`;

      if (!topicStats[key]) {
        topicStats[key] = {
          topic: topicName,
          category,
          totalAttempts: 0,
          passedAttempts: 0,
          failedAttempts: 0
        };
      }

      topicStats[key].totalAttempts += 1;
      if (attempt.status === 'Accepted') {
        topicStats[key].passedAttempts += 1;
      } else {
        topicStats[key].failedAttempts += 1;
      }
    });

    const weakAreas = Object.values(topicStats)
      .map(stat => {
        stat.accuracy = Math.round((stat.passedAttempts / stat.totalAttempts) * 100);
        return stat;
      })
      .filter(stat => stat.accuracy < 60)
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) {
          return a.accuracy - b.accuracy;
        }
        return b.totalAttempts - a.totalAttempts;
      });

    res.json({ success: true, data: { weakAreas } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAchievements = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    const attempts = await AttemptTrack.find({ userId }).sort({ createdAt: 1 });

    const definitions = [
      { id: 'ach-first-practice', title: 'First Steps', description: 'Started your first practice attempt', type: 'milestone', icon: 'play' },
      { id: 'ach-10-attempts', title: 'Code Pioneer', description: 'Completed 10 practice attempts', type: 'milestone', icon: 'code' },
      { id: 'ach-first-success', title: 'First Success', description: 'Successfully passed your first problem', type: 'milestone', icon: 'check-circle' },
      { id: 'ach-dsa-beginner', title: 'DSA Beginner', description: 'Attempted your first DSA problem', type: 'milestone', icon: 'database' },
      { id: 'ach-aptitude-beginner', title: 'Aptitude Beginner', description: 'Attempted your first Aptitude problem', type: 'milestone', icon: 'brain' }
    ];

    let metrics = {
      totalAttempts: 0,
      passedAttempts: 0,
      dsaAttempts: 0,
      aptitudeAttempts: 0
    };

    let unlockDates = {};

    attempts.forEach(att => {
      metrics.totalAttempts++;
      if (att.status === 'Accepted') metrics.passedAttempts++;
      if (att.category === 'dsa') metrics.dsaAttempts++;
      if (att.category === 'aptitude') metrics.aptitudeAttempts++;
      
      if (metrics.totalAttempts === 1 && !unlockDates['ach-first-practice']) unlockDates['ach-first-practice'] = att.createdAt;
      if (metrics.totalAttempts === 10 && !unlockDates['ach-10-attempts']) unlockDates['ach-10-attempts'] = att.createdAt;
      if (metrics.passedAttempts === 1 && !unlockDates['ach-first-success']) unlockDates['ach-first-success'] = att.createdAt;
      if (metrics.dsaAttempts === 1 && !unlockDates['ach-dsa-beginner']) unlockDates['ach-dsa-beginner'] = att.createdAt;
      if (metrics.aptitudeAttempts === 1 && !unlockDates['ach-aptitude-beginner']) unlockDates['ach-aptitude-beginner'] = att.createdAt;
    });

    const achievements = definitions.map(def => {
      const date = unlockDates[def.id];
      return {
        ...def,
        unlocked: !!date,
        unlockedAt: date ? date.toISOString().split('T')[0] : null
      };
    });

    const uniqueDates = [...new Set(attempts.map(a => a.createdAt.toISOString().split('T')[0]))].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueDates.length > 0) {
      let current = 1;
      let max = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffTime = currDate - prevDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          current++;
          max = Math.max(max, current);
        } else {
          current = 1;
        }
      }
      longestStreak = max;

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
      
      const lastDateStr = uniqueDates[uniqueDates.length - 1];
      if (lastDateStr === todayStr || lastDateStr === yesterdayStr) {
        currentStreak = current;
      }
    }

    res.json({
      success: true,
      data: {
        achievements,
        streak: {
          current: currentStreak,
          longest: longestStreak
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    const user = await User.findById(userId).select('-passwordHash -__v');
    const profileData = profile.toObject();
    if (user) {
      profileData.user = user;
    }

    res.json({ success: true, data: profileData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const {
      name,
      college,
      graduationYear,
      dailyPreparationTime,
      currentSkillLevel,
      targetRoles,
      targetCompanies,
      preferredStudyTime,
      preparationDetails,
      targetDate,
      onboardingCompleted
    } = req.body;

    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    if (currentSkillLevel !== undefined) {
      if (['Beginner', 'Intermediate', 'Advanced'].includes(currentSkillLevel)) {
        profile.currentSkillLevel = currentSkillLevel;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid currentSkillLevel' });
      }
    }

    if (targetRoles !== undefined) {
      if (Array.isArray(targetRoles)) {
        profile.targetRoles = targetRoles;
      } else {
        return res.status(400).json({ success: false, message: 'targetRoles must be an array' });
      }
    }

    if (targetDate !== undefined) {
      const parsedDate = new Date(targetDate);
      if (!isNaN(parsedDate.getTime())) {
        profile.targetDate = parsedDate;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid targetDate' });
      }
    }

    if (college !== undefined) {
      profile.college = String(college).trim();
    }

    if (graduationYear !== undefined) {
      const year = Number(graduationYear);
      if (!isNaN(year)) {
        profile.graduationYear = year;
      }
    }

    if (dailyPreparationTime !== undefined) {
      profile.dailyPreparationTime = String(dailyPreparationTime).trim();
    }

    if (preferredStudyTime !== undefined) {
      profile.preferredStudyTime = String(preferredStudyTime).trim();
    }

    if (preparationDetails !== undefined) {
      profile.preparationDetails = String(preparationDetails).trim();
    }

    if (targetCompanies !== undefined) {
      if (Array.isArray(targetCompanies)) {
        profile.targetCompanies = targetCompanies;
      } else if (typeof targetCompanies === 'string') {
        profile.targetCompanies = targetCompanies.split(',').map(c => c.trim()).filter(Boolean);
      }
    }

    if (onboardingCompleted !== undefined) {
      profile.onboardingCompleted = Boolean(onboardingCompleted);
    }

    await profile.save();

    if (name || targetCompanies) {
      const userUpdates = {};
      if (name) userUpdates.name = String(name).trim();
      if (targetCompanies && Array.isArray(profile.targetCompanies)) {
        userUpdates.targetCompanies = profile.targetCompanies;
      }
      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(userId, userUpdates);
      }
    }

    const user = await User.findById(userId).select('-passwordHash -__v');
    const profileData = profile.toObject();
    if (user) {
      profileData.user = user;
    }

    res.json({ success: true, data: profileData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const recommendations = await generateRecommendations(userId);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
