const express = require("express");
const {
  receiveDetection,
  getModelStatus,
  updateAIConfig,
  getDetectionStats,
} = require("../controllers/aiController");
const { authenticate, authorize } = require("../middleware/auth");
const { validateAIConfig } = require("../middleware/validation");
const { aiWebhookLimiter } = require("../middleware/rateLimit");
const router = express.Router();
// Webhook for AI detections (no auth required, but rate limited)
router.post("/detection", aiWebhookLimiter, receiveDetection);
// Protected routes
router.use(authenticate);
router.get("/model/status", getModelStatus);
router.get("/detection/stats", getDetectionStats);
router.put("/config", authorize("admin"), validateAIConfig, updateAIConfig);
module.exports = router;
