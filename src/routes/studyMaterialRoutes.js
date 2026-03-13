const express = require("express");
const multer = require("multer");
const { getAll, getById, create, update, remove, uploadFile, getStats } = require("../controllers/studyMaterialController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// ─── Multer config for file uploads ──────────────────────
const storage = multer.memoryStorage(); // memory storage for serverless
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/plain",
      "text/markdown",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

// All study-material routes require authentication
router.use(protect);

// ─── Stats (must be before /:id) ─────────────────────────
router.get("/stats", getStats);

// ─── File upload ─────────────────────────────────────────
router.post("/upload", upload.single("file"), uploadFile);

// ─── CRUD ────────────────────────────────────────────────
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", validate(["title", "description", "type", "category"]), create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
