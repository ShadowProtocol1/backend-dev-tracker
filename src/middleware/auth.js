const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Middleware that verifies the JWT from the Authorization header
 * and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // Extract token from "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ApiError.unauthorized("Not authenticated — no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user (without password) to the request
    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized("User belonging to this token no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw ApiError.unauthorized("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token has expired — please log in again");
    }
    throw error;
  }
});

module.exports = { protect };
