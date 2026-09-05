/**
 * Role-Based Access Control (RBAC) authorization middleware.
 * Expects req.user context to be populated by authentication middleware (protect).
 * 
 * @param  {...string} roles Allowed roles for the endpoint (e.g. 'student', 'admin')
 * @returns {Function} Express middleware handler
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Verify user context exists (must pass through protect middleware first)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authenticated user identity found.'
      });
    }

    // 2. Check if user's authenticated role is permitted
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}`
      });
    }

    return next();
  };
};

// Reusable alias
export const authorizeRoles = authorize;
