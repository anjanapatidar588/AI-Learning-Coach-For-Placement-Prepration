const { verifyToken } = require('../config/jwt');
const ApiError = require('../utils/ApiError');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized: Access token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    next(new ApiError(401, error.message || 'Unauthorized access'));
  }
};

module.exports = authMiddleware;
