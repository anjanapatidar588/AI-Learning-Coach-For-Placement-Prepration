const ApiError = require('../utils/ApiError');

/**
 * Request Validation Middleware Wrapper
 * Validates req.body, req.query, or req.params against a Joi schema or validation function.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();

    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, { abortEarly: false, stripUnknown: true });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new ApiError(400, `Validation Error: ${errorMessage}`));
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
