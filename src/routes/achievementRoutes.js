const express = require("express");
const { getAll, getById, create, update, remove } = require("../controllers/achievementController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// All achievement routes require authentication
router.use(protect);

// ─── CRUD ────────────────────────────────────────────────
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", validate(["title", "description", "category"]), create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
