const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Middleware Factory
 * Standard rate limiter for API endpoints to protect against brute-force attacks and abuse.
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // Default 15 minutes
    max: options.max || 100, // Default limit 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || 'Too many requests from this IP, please try again later.'
    },
    ...options
  });
};

const apiLimiter = createRateLimiter();

module.exports = {
  createRateLimiter,
  apiLimiter
};
