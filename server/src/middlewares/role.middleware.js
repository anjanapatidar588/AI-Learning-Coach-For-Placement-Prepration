const ApiError = require('../utils/ApiError');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, 'Unauthorized: User role undefined'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Forbidden: Requires one of [${allowedRoles.join(', ')}] role`));
    }

    next();
  };
};

module.exports = roleMiddleware;
