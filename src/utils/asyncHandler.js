/**
 * Wraps an async route handler so thrown errors are forwarded to Express error middleware.
 * Eliminates the need for try-catch in every controller.
 *
 * @param {Function} fn - Async Express route handler (req, res, next)
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
