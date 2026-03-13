const express = require("express");
const { getAll, getById, create, update, remove, updateStep, getStats } = require("../controllers/projectController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// All project routes require authentication
router.use(protect);

// ─── Stats (must be before /:id to avoid conflict) ──────
router.get("/stats", getStats);

// ─── CRUD ────────────────────────────────────────────────
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", validate(["title", "description", "category"]), create);
router.put("/:id", update);
router.delete("/:id", remove);

// ─── Step management ─────────────────────────────────────
router.patch("/:id/steps/:stepId", updateStep);

module.exports = router;
