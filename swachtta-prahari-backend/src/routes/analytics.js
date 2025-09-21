const express = require("express");
const {
  getAnalytics,
  getCameraPerformance,
  getDashboardData,
} = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/auth");
const { validateDateRange } = require("../middleware/validation");
const router = express.Router();
// All analytics routes require authentication
router.use(authenticate);
router.get("/", validateDateRange, getAnalytics);
router.get("/camera-performance", getCameraPerformance);
router.get("/dashboard", getDashboardData);
module.exports = router;
