import { verifyToken } from '../utils/jwtUtil.js';
import User from '../models/User.js';

/**
 * Authentication middleware that verifies JWT Bearer token and attaches authoritative user context from DB
 */
export const protect = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Missing or invalid Authorization header.'
    });
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Token missing user identity.'
      });
    }

    // Attach verified user context from cryptographically signed JWT
    req.user = {
      userId: userId.toString(),
      id: userId.toString(),
      role: decoded.role || 'student',
      name: decoded.name || '',
      email: decoded.email || ''
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.'
    });
  }
};

