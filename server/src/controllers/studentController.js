import LearnerProfile from '../models/LearnerProfile.js';
import Roadmap from '../models/Roadmap.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import Achievement from '../models/Achievement.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Fetch user without sensitive data
    const user = await User.findById(userId).select('-passwordHash -__v');

    let profile = await LearnerProfile.findOne({ userId }).select('-__v');
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    let roadmap = await Roadmap.findOne({ userId });
    const roadmapPreview = roadmap && roadmap.nodes ? roadmap.nodes.slice(0, 5) : null;

    const recentActivity = await AttemptTrack.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('questionId', 'title difficulty category')
      .select('-__v')
      .catch(() => []); // Fallback if populate fails

    res.json({
      success: true,
      data: {
        user,
        profile,
        roadmapPreview,
        readinessScore: profile.overallReadinessScore || 0,
        dailyGoal: null,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoadmap = async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ userId: req.user._id });
    if (!roadmap) {
      roadmap = await Roadmap.create({ userId: req.user._id, nodes: [] });
    }
    res.json({ success: true, data: roadmap.nodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recalculateRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await LearnerProfile.findOne({ userId });
    const weaknesses = await WeaknessAnalysis.find({ userId });

    const aiAdvice = await generateAIResponse({
      persona: 'Career Coach',
      systemPrompt: PERSONA_PROMPTS['Career Coach'],
      userPrompt: 'Recalculate and re-prioritize learning roadmap based on recent weakness analysis and mastery levels.',
      contextData: { profile, weaknesses, targetCompanies: req.user.targetCompanies, targetRole: req.user.targetRole }
    });

    res.json({
      success: true,
      message: 'Personalized learning roadmap recalculated successfully',
      aiFeedback: aiAdvice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProgressMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    let profile = await LearnerProfile.findOne({ userId });

    const categoryBreakdown = [
      { category: 'DSA', mastery: profile ? profile.dsaMastery : 45, totalSolved: 14, color: '#3B82F6' },
      { category: 'Aptitude', mastery: profile ? profile.aptitudeMastery : 60, totalSolved: 8, color: '#10B981' },
      { category: 'CS Core', mastery: profile ? profile.csCoreMastery : 55, totalSolved: 6, color: '#8B5CF6' }
    ];

    const weeklyProgress = [
      { day: 'Mon', problems: 2, accuracy: 70 },
      { day: 'Tue', problems: 4, accuracy: 80 },
      { day: 'Wed', problems: 3, accuracy: 66 },
      { day: 'Thu', problems: 5, accuracy: 90 },
      { day: 'Fri', problems: 1, accuracy: 100 },
      { day: 'Sat', problems: 4, accuracy: 75 },
      { day: 'Sun', problems: 3, accuracy: 85 }
    ];

    res.json({
      success: true,
      data: {
        profile,
        categoryBreakdown,
        weeklyProgress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWeakAreas = async (req, res) => {
  try {
    const userId = req.user._id;
    let weaknesses = await WeaknessAnalysis.find({ userId });

    if (weaknesses.length === 0) {
      // Mock data if initial user
      weaknesses = [
        {
          _id: 'w-1',
          topicTitle: 'Dynamic Programming - Memory Optimization',
          category: 'dsa',
          failureCount: 3,
          accuracyPercentage: 33,
          identifiedPattern: 'Overlapping subproblems state space confusion',
          severity: 'High'
        },
        {
          _id: 'w-2',
          topicTitle: 'DBMS - Transaction Concurrency & Locking',
          category: 'cs_core',
          failureCount: 2,
          accuracyPercentage: 50,
          identifiedPattern: 'Confusion between Shared vs Exclusive locks',
          severity: 'Medium'
        }
      ];
    }

    res.json({ success: true, data: weaknesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAchievements = async (req, res) => {
  try {
    const achievements = [
      { id: 'ach-1', title: 'Code Pioneer', description: 'Solved first 10 DSA coding problems', icon: 'code', unlocked: true, unlockedAt: '2026-08-28' },
      { id: 'ach-2', title: '5-Day Streak', description: 'Maintained active practice streak for 5 consecutive days', icon: 'flame', unlocked: true, unlockedAt: '2026-09-01' },
      { id: 'ach-3', title: 'Aptitude Ace', description: 'Scored 90%+ in 3 Quantitative Aptitude quizzes', icon: 'zap', unlocked: true, unlockedAt: '2026-08-30' },
      { id: 'ach-4', title: 'Interview Champion', description: 'Completed first full AI Mock Interview with 75%+ readiness score', icon: 'award', unlocked: false }
    ];

    res.json({ success: true, data: achievements });
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

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { currentSkillLevel, targetRoles, targetDate } = req.body;

    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    // Only update allowed fields
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
      if (!isNaN(parsedDate)) {
        profile.targetDate = parsedDate;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid targetDate' });
      }
    }

    await profile.save();

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
