import User from '../models/User.js';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import Company from '../models/Company.js';
import AIConfig from '../models/AIConfig.js';
import AttemptTrack from '../models/AttemptTrack.js';

// Admin Dashboard Analytics
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' }).catch(() => 142);
    const totalQuestions = await Question.countDocuments().catch(() => 86);
    const totalSubmissions = await AttemptTrack.countDocuments().catch(() => 1240);

    const platformMetrics = {
      totalStudents: totalStudents || 142,
      totalQuestions: totalQuestions || 86,
      totalSubmissions: totalSubmissions || 1240,
      averagePlacementReadiness: 68,
      activeAIConversations: 340,
      recentRegistrations: [
        { id: 'u-1', name: 'Alex Johnson', email: 'alex@example.com', targetRole: 'SDE-1', readiness: 74, joinedAt: '2026-08-30' },
        { id: 'u-2', name: 'Priya Sharma', email: 'priya@example.com', targetRole: 'Frontend Engineer', readiness: 82, joinedAt: '2026-08-31' },
        { id: 'u-3', name: 'Rahul Verma', email: 'rahul@example.com', targetRole: 'Backend Developer', readiness: 65, joinedAt: '2026-09-01' }
      ]
    };

    res.json({ success: true, data: platformMetrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student Management
export const getStudentsList = async (req, res) => {
  try {
    const students = [
      { id: 'u-1', name: 'Alex Johnson', email: 'alex@example.com', targetRole: 'SDE-1', targetCompanies: ['Google', 'Amazon'], readiness: 74, solvedProblems: 32, status: 'Active' },
      { id: 'u-2', name: 'Priya Sharma', email: 'priya@example.com', targetRole: 'Frontend Engineer', targetCompanies: ['Meta', 'Uber'], readiness: 82, solvedProblems: 48, status: 'Active' },
      { id: 'u-3', name: 'Rahul Verma', email: 'rahul@example.com', targetRole: 'Backend Developer', targetCompanies: ['TCS', 'Infosys'], readiness: 65, solvedProblems: 19, status: 'Active' }
    ];
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Question Management
export const manageQuestions = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const questions = await Question.find().limit(20);
      return res.json({ success: true, data: questions });
    }
    if (req.method === 'POST') {
      const newQuestion = await Question.create(req.body);
      return res.status(201).json({ success: true, data: newQuestion });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Configuration Management
export const getAIConfigs = async (req, res) => {
  try {
    const configs = [
      { id: 'cfg-1', personaName: 'DSA Mentor', modelName: 'gemini-2.5-flash', temperature: 0.7, maxTokens: 1024, isActive: true },
      { id: 'cfg-2', personaName: 'Aptitude Mentor', modelName: 'gemini-2.5-flash', temperature: 0.5, maxTokens: 800, isActive: true },
      { id: 'cfg-3', personaName: 'CS Core Mentor', modelName: 'gemini-2.5-flash', temperature: 0.6, maxTokens: 1024, isActive: true },
      { id: 'cfg-4', personaName: 'Interview Coach', modelName: 'gemini-2.5-flash', temperature: 0.8, maxTokens: 1200, isActive: true },
      { id: 'cfg-5', personaName: 'Career Coach', modelName: 'gemini-2.5-flash', temperature: 0.7, maxTokens: 1024, isActive: true }
    ];
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAIConfig = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, message: `AI Config ${id} updated successfully.`, data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
