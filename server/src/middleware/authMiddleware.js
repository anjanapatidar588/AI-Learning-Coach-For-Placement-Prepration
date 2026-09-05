import { verifyToken } from '../utils/jwtUtil.js';

/**
 * Authentication middleware that verifies JWT Bearer token and attaches user context to req.user
 */
export const protect = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    // Development fallback if x-mock-role header is explicitly passed in dev mode
    if (process.env.NODE_ENV === 'development' && req.headers['x-mock-role']) {
      const mockRole = req.headers['x-mock-role'];
      req.user = {
        userId: mockRole === 'admin' ? '650000000000000000000001' : '650000000000000000000002',
        role: mockRole
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Missing or invalid Authorization header.'
    });
  }

  try {
    const decoded = verifyToken(token);

    // Attach clean request context
    req.user = {
      userId: decoded.id || decoded.userId,
      role: decoded.role || 'student'
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.'
    });
  }
};
