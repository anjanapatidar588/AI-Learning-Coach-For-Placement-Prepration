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
    const { name, email, password, targetCompanies, targetRole, role } = req.body;

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

    // 4. Role Normalization & Validation (Only student and admin are permitted)
    const normalizedRole = role ? String(role).trim().toLowerCase() : 'student';
    if (!['student', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles are student and admin.'
      });
    }
    const assignedRole = normalizedRole;

    // 5. Password Hashing via existing utility
    const passwordHash = await hashPassword(password);

    // 6. User Creation
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      targetCompanies: Array.isArray(targetCompanies) ? targetCompanies : ['Google', 'Amazon', 'TCS'],
      targetRole: targetRole || (assignedRole === 'admin' ? 'System Administrator' : 'Software Development Engineer (SDE-1)'),
    });

    // 7. Initialize learner assets for students only
    let studentProfile = null;
    if (assignedRole === 'student') {
      studentProfile = await LearnerProfile.create({ userId: user._id }).catch(() => null);
    }

    // 8. Generate JWT token for immediate authenticated session
    const token = generateToken({ id: user._id, role: user.role });

    // 9. Safe Response (Never exposing password or passwordHash)
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetCompanies: user.targetCompanies,
        targetRole: user.targetRole,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
      profile: studentProfile
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

    const profile = user.role === 'student'
      ? await LearnerProfile.findOne({ userId: user._id }).select('-__v').lean()
      : null;

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
        avatar: user.avatar || '',
      },
      profile
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = user.role === 'student'
      ? await LearnerProfile.findOne({ userId: user._id }).select('-__v').lean()
      : null;

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetCompanies: user.targetCompanies,
        targetRole: user.targetRole,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
