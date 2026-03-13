const Achievement = require("../models/Achievement");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// ──────────────────────────────────────────────────────────
//  GET /api/achievements
// ──────────────────────────────────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = { user: req.user._id };

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const achievements = await Achievement.find(filter).sort({ date: -1 });
  res.json(achievements);
});

// ──────────────────────────────────────────────────────────
//  GET /api/achievements/:id
// ──────────────────────────────────────────────────────────
const getById = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!achievement) throw ApiError.notFound("Achievement not found");
  res.json(achievement);
});

// ──────────────────────────────────────────────────────────
//  POST /api/achievements
// ──────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const achievement = await Achievement.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json(achievement);
});

// ──────────────────────────────────────────────────────────
//  PUT /api/achievements/:id
// ──────────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!achievement) throw ApiError.notFound("Achievement not found");
  res.json(achievement);
});

// ──────────────────────────────────────────────────────────
//  DELETE /api/achievements/:id
// ──────────────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!achievement) throw ApiError.notFound("Achievement not found");
  res.json({ success: true, message: "Achievement deleted" });
});

module.exports = { getAll, getById, create, update, remove };
