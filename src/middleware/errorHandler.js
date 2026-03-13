const ApiError = require("../utils/ApiError");

/**
 * Global error-handling middleware.
 * Must have 4 arguments so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // ─── Mongoose validation error ──────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(". ");
  }

  // ─── Mongoose duplicate key error ──────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for "${field}" — this ${field} is already in use`;
  }

  // ─── Mongoose bad ObjectId ─────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid resource ID format";
  }

  // ─── Log server errors in development ──────────────────
  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
