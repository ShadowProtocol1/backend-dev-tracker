const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// ─── Helper: generate JWT ────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── Helper: format user response with token ────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userObj = user.toJSON();
  res.status(statusCode).json({ user: userObj, token });
};

// ──────────────────────────────────────────────────────────
//  POST /api/auth/register
// ──────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

// ──────────────────────────────────────────────────────────
//  POST /api/auth/login
// ──────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest("Please provide email and password");
  }

  // Include password field for comparison
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  sendTokenResponse(user, 200, res);
});

// ──────────────────────────────────────────────────────────
//  GET /api/auth/profile
// ──────────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  res.json(req.user.toJSON());
});

// ──────────────────────────────────────────────────────────
//  PUT /api/auth/profile
// ──────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "bio", "avatar"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json(user.toJSON());
});

module.exports = { register, login, getProfile, updateProfile };
