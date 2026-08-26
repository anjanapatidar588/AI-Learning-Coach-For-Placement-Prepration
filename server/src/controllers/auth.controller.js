const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LearnerProfile = require('../models/LearnerProfile');
const { generateToken } = require('../config/jwt');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: ['student', 'admin'].includes(role) ? role : 'student'
    });

    if (user.role === 'student') {
      await LearnerProfile.create({
        userId: user._id,
        skillRatings: { dsa: 10, aptitude: 10, csCore: 10 },
        overallReadinessScore: 10
      });
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    return res.status(201).json(
      new ApiResponse(201, {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }, 'User registered successfully')
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    return res.status(200).json(
      new ApiResponse(200, {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return res.status(200).json(new ApiResponse(200, { user }, 'User details retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
