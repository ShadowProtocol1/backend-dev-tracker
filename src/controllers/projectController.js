const Project = require("../models/Project");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// ──────────────────────────────────────────────────────────
//  GET /api/projects
// ──────────────────────────────────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const filter = { user: req.user._id };

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const projects = await Project.find(filter).sort({ updatedAt: -1 });
  res.json(projects);
});

// ──────────────────────────────────────────────────────────
//  GET /api/projects/:id
// ──────────────────────────────────────────────────────────
const getById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!project) throw ApiError.notFound("Project not found");
  res.json(project);
});

// ──────────────────────────────────────────────────────────
//  POST /api/projects
// ──────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json(project);
});

// ──────────────────────────────────────────────────────────
//  PUT /api/projects/:id
// ──────────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!project) throw ApiError.notFound("Project not found");
  res.json(project);
});

// ──────────────────────────────────────────────────────────
//  DELETE /api/projects/:id
// ──────────────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!project) throw ApiError.notFound("Project not found");
  res.json({ success: true, message: "Project deleted" });
});

// ──────────────────────────────────────────────────────────
//  PATCH /api/projects/:id/steps/:stepId
// ──────────────────────────────────────────────────────────
const updateStep = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!project) throw ApiError.notFound("Project not found");

  const step = project.steps.id(req.params.stepId);
  if (!step) throw ApiError.notFound("Step not found");

  // Update only provided fields
  Object.keys(req.body).forEach((key) => {
    step[key] = req.body[key];
  });

  await project.save();
  res.json(project);
});

// ──────────────────────────────────────────────────────────
//  GET /api/projects/stats
// ──────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [total, completed, inProgress, planned] = await Promise.all([
    Project.countDocuments({ user: userId }),
    Project.countDocuments({ user: userId, status: "completed" }),
    Project.countDocuments({ user: userId, status: "in-progress" }),
    Project.countDocuments({ user: userId, status: "planned" }),
  ]);

  res.json({ total, completed, inProgress, planned });
});

module.exports = { getAll, getById, create, update, remove, updateStep, getStats };
