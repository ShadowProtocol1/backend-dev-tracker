const express = require("express");
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// ─── Public routes ───────────────────────────────────────
router.post("/register", validate(["name", "email", "password"]), register);
router.post("/login", validate(["email", "password"]), login);

// ─── Protected routes ────────────────────────────────────
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
