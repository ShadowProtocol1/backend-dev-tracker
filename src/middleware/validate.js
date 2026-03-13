const ApiError = require("../utils/ApiError");

/**
 * Factory that returns a middleware to validate req.body fields.
 *
 * @param {string[]} requiredFields - Array of field names that must be present
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post("/", validate(["title", "description"]), controller.create);
 */
const validate = (requiredFields) => (req, _res, next) => {
  const missing = requiredFields.filter(
    (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ""
  );

  if (missing.length > 0) {
    throw ApiError.badRequest(`Missing required fields: ${missing.join(", ")}`);
  }

  next();
};

module.exports = validate;
