const express = require("express");
const { getDashboardData } = require("../controllers/dashboardController");

const router = express.Router();

// Get dashboard analytics data
router.get("/data", getDashboardData);

module.exports = router;
