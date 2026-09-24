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
    const userId = req.user.userId || req.user._id;
    const roadmap = await Roadmap.findOne({ userId }).select('-__v');
    
    if (!roadmap) {
      return res.json({ success: true, data: null, message: 'No roadmap found' });
    }
    
    res.json({ success: true, data: roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recalculateRoadmap = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    let roadmap = await Roadmap.findOne({ userId });
    
    if (!roadmap) {
      roadmap = new Roadmap({ userId, nodes: [] });
      roadmap.lastGeneratedAt = new Date();
    } else {
      roadmap.lastGeneratedAt = new Date();
      roadmap.version += 1;
    }
    
    await roadmap.save();

    res.json({
      success: true,
      message: 'Roadmap recalculated successfully',
      data: roadmap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProgressMetrics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Fetch all attempts for the authenticated student
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
      
      // Update overall
      progress.overall.totalAttempts++;
      if (isPassed) progress.overall.passedAttempts++;
      else progress.overall.failedAttempts++;
      progress.overall.totalTimeSpentSeconds += (attempt.timeSpentSeconds || 0);
      progress.overall.hintsUsed += (attempt.hintsUsedCount || 0);

      // Update category-specific
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

    // Calculate accuracy
    const calculateAccuracy = (metrics) => {
      if (metrics.totalAttempts === 0) return 0;
      return Math.round((metrics.passedAttempts / metrics.totalAttempts) * 100);
    };

    progress.overall.accuracy = calculateAccuracy(progress.overall);
    progress.dsa.accuracy = calculateAccuracy(progress.dsa);
    progress.aptitude.accuracy = calculateAccuracy(progress.aptitude);
    progress.csCore.accuracy = calculateAccuracy(progress.csCore);

    // Recent performance (last 5 attempts)
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
    
    // Fetch all attempts for the authenticated user and populate question/topic
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
          return a.accuracy - b.accuracy; // lower accuracy first
        }
        return b.totalAttempts - a.totalAttempts; // higher attempts first
      });

    res.json({ success: true, data: { weakAreas } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAchievements = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Fetch all attempts for chronological processing
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

    // Calculate Streak
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
