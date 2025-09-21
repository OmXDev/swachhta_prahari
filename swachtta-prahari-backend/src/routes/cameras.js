const express = require("express");
const {
  getCameras,
  getCameraById,
  updateCamera,
  getCameraHealth,
  restartCamera,
  addCamera,
  uploadCameraVideo,
} = require("../controllers/cameraController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  validateCameraUpdate,
  validateCameraId,
  validatePagination,
} = require("../middleware/validation");
const { uploadVideoSingle } = require("../middleware/upload");

const router = express.Router();

// 🔒 All camera routes require login
router.use(authenticate);

// GET routes (camera managers + admin only)
router.get("/", authorize("camera", "admin"), validatePagination, getCameras);
router.get("/:id", authorize("camera", "admin"), validateCameraId, getCameraById);
router.get("/:id/health", authorize("camera", "admin"), validateCameraId, getCameraHealth);

// POST/PUT routes (admin only)
router.post("/addCamera", authorize("admin"), addCamera);
router.put("/:id", authorize("admin"), validateCameraId, validateCameraUpdate, updateCamera);
router.post("/:id/restart", authorize("admin"), validateCameraId, restartCamera);

// Upload videos (camera managers + admin)
router.post(
  "/:cameraId/videos",
  authorize("camera", "admin"),
  uploadVideoSingle,
  uploadCameraVideo
);

module.exports = router;
