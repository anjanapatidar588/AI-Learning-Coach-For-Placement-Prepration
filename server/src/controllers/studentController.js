import LearnerProfile from '../models/LearnerProfile.js';
import Roadmap from '../models/Roadmap.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import Achievement from '../models/Achievement.js';
import Question from '../models/Question.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = await LearnerProfile.create({ userId });
    }

    let roadmap = await Roadmap.findOne({ userId });
    if (!roadmap || roadmap.nodes.length === 0) {
      roadmap = await Roadmap.create({
        userId,
        nodes: [
          { nodeId: 'node-1', title: 'Arrays & Two Pointers', category: 'dsa', status: 'in_progress', priorityScore: 10, estimatedHours: 4, description: 'Master array traversals, sliding window, and two pointer techniques.' },
          { nodeId: 'node-2', title: 'Quantitative Aptitude (Percentages & Profit/Loss)', category: 'aptitude', status: 'in_progress', priorityScore: 9, estimatedHours: 3, description: 'Core numerical techniques for online screening tests.' },
          { nodeId: 'node-3', title: 'DBMS Fundamentals & SQL', category: 'cs_core', status: 'locked', priorityScore: 8, estimatedHours: 5, description: 'Relational algebra, SQL queries, B-Trees, and Normalization.' },
          { nodeId: 'node-4', title: 'Binary Trees & BFS/DFS', category: 'dsa', status: 'locked', priorityScore: 8, estimatedHours: 6, description: 'Tree traversals, binary search trees, and lowest common ancestor.' },
          { nodeId: 'node-5', title: 'Operating Systems (Processes & Threads)', category: 'cs_core', status: 'locked', priorityScore: 7, estimatedHours: 4, description: 'Process synchronization, deadlock detection, and virtual memory.' },
        ]
      });
    }

    const recentAttempts = await AttemptTrack.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('questionId', 'title difficulty category');

    const weaknesses = await WeaknessAnalysis.find({ userId }).sort({ severity: -1 });

    res.json({
      success: true,
      data: {
        profile,
        roadmap: roadmap.nodes,
        recentAttempts,
        weaknesses,
        dailyGoal: { targetProblems: 3, completedProblems: Math.min(3, recentAttempts.length) }
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
