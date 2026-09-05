import User from '../models/User.js';
import LearnerProfile from '../models/LearnerProfile.js';
import Roadmap from '../models/Roadmap.js';
import { hashPassword, comparePassword } from '../utils/passwordUtil.js';
import { generateToken } from '../utils/jwtUtil.js';

/**
 * Helper to validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

/**
 * Controller for POST /api/v1/auth/signup (and /register)
 */
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, targetCompanies, targetRole } = req.body;

    // 1. Input Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // 2. Email Normalization
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Duplicate Check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 4. Password Hashing via existing utility
    const passwordHash = await hashPassword(password);

    // 5. User Creation (Role Security: Forced to 'student', ignoring any client role injection)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student',
      targetCompanies: Array.isArray(targetCompanies) ? targetCompanies : ['Google', 'Amazon', 'TCS'],
      targetRole: targetRole || 'Software Development Engineer (SDE-1)',
    });

    // 6. Associated LearnerProfile & Initial Roadmap Creation
    await LearnerProfile.create({ userId: user._id }).catch(() => {});
    await Roadmap.create({
      userId: user._id,
      nodes: [
        { nodeId: 'node-1', title: 'Arrays & Two Pointers', category: 'dsa', status: 'in_progress', priorityScore: 10, estimatedHours: 4, description: 'Master array traversals, sliding window, and two pointer techniques.' },
        { nodeId: 'node-2', title: 'Quantitative Aptitude (Percentages & Profit/Loss)', category: 'aptitude', status: 'in_progress', priorityScore: 9, estimatedHours: 3, description: 'Core numerical techniques for online screening tests.' },
        { nodeId: 'node-3', title: 'DBMS Fundamentals & SQL', category: 'cs_core', status: 'locked', priorityScore: 8, estimatedHours: 5, description: 'Relational algebra, SQL queries, B-Trees, and Normalization.' }
      ]
    }).catch(() => {});

    // 7. Safe Response (Never exposing password or passwordHash)
    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetCompanies: user.targetCompanies,
        targetRole: user.targetRole,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Aliased register export for backward compatibility
export const registerUser = signupUser;

/**
 * Controller for POST /api/v1/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // 2. Email Normalization
    const normalizedEmail = email.trim().toLowerCase();

    // 3. User Lookup
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 4. Password Verification via existing passwordUtil
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 5. JWT Token Generation via existing jwtUtil
    const token = generateToken({ id: user._id, role: user.role });

    // 6. Safe Response (Exposing JWT, ID, Name, Email, Role; Never exposing password/passwordHash)
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetCompanies: user.targetCompanies,
        targetRole: user.targetRole,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};
