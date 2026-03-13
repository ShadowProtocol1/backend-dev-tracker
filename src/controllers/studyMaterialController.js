const StudyMaterial = require("../models/StudyMaterial");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// ──────────────────────────────────────────────────────────
//  GET /api/study-materials
// ──────────────────────────────────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const { type, category, search } = req.query;
  const filter = { user: req.user._id };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const materials = await StudyMaterial.find(filter).sort({ updatedAt: -1 });
  res.json(materials);
});

// ──────────────────────────────────────────────────────────
//  GET /api/study-materials/:id
// ──────────────────────────────────────────────────────────
const getById = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!material) throw ApiError.notFound("Study material not found");
  res.json(material);
});

// ──────────────────────────────────────────────────────────
//  POST /api/study-materials
// ──────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json(material);
});

// ──────────────────────────────────────────────────────────
//  PUT /api/study-materials/:id
// ──────────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!material) throw ApiError.notFound("Study material not found");
  res.json(material);
});

// ──────────────────────────────────────────────────────────
//  DELETE /api/study-materials/:id
// ──────────────────────────────────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!material) throw ApiError.notFound("Study material not found");
  res.json({ success: true, message: "Study material deleted" });
});

// ──────────────────────────────────────────────────────────
//  POST /api/study-materials/upload
// ──────────────────────────────────────────────────────────
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("No file uploaded");
  }

  // In production, you would upload to cloud storage (S3, Cloudinary, etc.)
  // For now, return the file info
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
  });
});

// ──────────────────────────────────────────────────────────
//  GET /api/study-materials/stats
// ──────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [total, byType, byCategory] = await Promise.all([
    StudyMaterial.countDocuments({ user: userId }),
    StudyMaterial.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    StudyMaterial.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  // Transform aggregation results to objects
  const typeMap = byType.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const categoryMap = byCategory.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({ total, byType: typeMap, byCategory: categoryMap });
});

module.exports = { getAll, getById, create, update, remove, uploadFile, getStats };
