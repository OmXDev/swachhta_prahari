const cloudinary = require("../config/cloudinary");
const fs = require("fs/promises");
const Camera = require("../models/Camera");
const Incident = require("../models/Incident");
const logger = require("../config/winston");
const { validationResult } = require("express-validator");
const { uploadLargeVideo } = require("../utils/cloudinary");

// Helper to clean temp file safely
async function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

const uploadCameraVideo = async (req, res) => {
  const { cameraId } = req.params;

  // Validate camera existence first
  const camera = await Camera.findOne({ cameraId: cameraId?.toUpperCase() });
  if (!camera) {
    await safeUnlink(req.file?.path);
    return res.status(404).json({ success: false, message: "Camera not found" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No video file uploaded" });
  }

  try {
    // Cloudinary large (chunked) upload
    // chunk_size: can be tuned; 10MB is a good default
    const result = await uploadLargeVideo(req.file.path, {
      folder: `upsida/cameras/${camera.cameraId}`,
    });

    // Optional thumbnail (derived)
    const thumbnailUrl = cloudinary.url(result.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [{ width: 640, height: 360, crop: "fill" }],
      secure: true,
    });

    console.log("Cloudinary upload result:", result);

    // Save in DB
    camera.uploadedVideos.push({
      url: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      thumbnailUrl,
    });

    await camera.save();

    // Cleanup temp file
    await safeUnlink(req.file.path);

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        cameraId: camera.cameraId,
        video: camera.uploadedVideos[camera.uploadedVideos.length - 1],
      },
    });
  } catch (err) {
    await safeUnlink(req.file?.path);
    console.error("Cloudinary upload error:", err);
    return res.status(502).json({
      success: false,
      message: "Failed to upload video",
      error: err?.message || "unknown_error",
    });
  }
};

// ======================== ADD CAMERA ========================
const addCamera = async (req, res) => {
  try {
    const { cameraId, name, location, rtspUrl, aiConfig } = req.body;

    if (!cameraId || !name || !location?.zone || !rtspUrl) {
      return res.status(400).json({
        success: false,
        message: "cameraId, name, location.zone, and rtspUrl are required",
      });
    }

    // Check if camera already exists
    const existingCamera = await Camera.findOne({ cameraId });
    if (existingCamera) {
      return res.status(400).json({
        success: false,
        message: "Camera with this ID already exists",
      });
    }

    // Create camera
    const camera = new Camera({
      cameraId,
      name,
      location,
      rtspUrl,
      aiConfig: {
        ...aiConfig,
        enabled: aiConfig?.enabled ?? true,
      },
    });

    await camera.save();

    res.status(201).json({
      success: true,
      message: "Camera added successfully",
      data: camera,
    });
  } catch (error) {
    console.error("Add Camera error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all cameras
// controllers/cameraController.js
const getCameras = async (req, res) => {
  try {
    const { zone, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (zone) filter["location.zone"] = zone;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [cameras, total] = await Promise.all([
      Camera.find(filter).sort({ cameraId: 1 }).skip(skip).limit(parseInt(limit)).lean(), // ✅ plain objects, includes uploadedVideos
      Camera.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        cameras, // ✅ includes uploadedVideos automatically
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / limit),
          count: cameras.length,
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    logger.error("Get cameras error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cameras",
    });
  }
};

// Get single camera
const getCameraById = async (req, res) => {
  try {
    const { id } = req.params;
    const camera = await Camera.findOne({
      $or: [{ _id: id }, { cameraId: id }],
    });
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }
    // Get recent incidents for this camera
    const recentIncidents = await Incident.find({ camera: camera._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("response.assignedTo", "name username")
      .populate("response.resolvedBy", "name username");
    res.json({
      success: true,
      data: {
        camera,
        recentIncidents,
      },
    });
  } catch (error) {
    logger.error("Get camera by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch camera",
    });
  }
};

// Update camera configuration
const updateCamera = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { id } = req.params;
    const updateData = req.body;
    const camera = await Camera.findOneAndUpdate(
      { $or: [{ _id: id }, { cameraId: id }] },
      updateData,
      { new: true, runValidators: true },
    );
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }
    logger.info(`Camera updated: ${camera.cameraId} by user: ${req.user.userId}`);
    res.json({
      success: true,
      message: "Camera updated successfully",
      data: { camera },
    });
  } catch (error) {
    logger.error("Update camera error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update camera",
    });
  }
};

// Camera health check
const getCameraHealth = async (req, res) => {
  try {
    const { id } = req.params;
    const camera = await Camera.findOne({
      $or: [{ _id: id }, { cameraId: id }],
    });
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }
    // Simulate health check (in production, this would ping the actual camera)
    const healthStatus = {
      cameraId: camera.cameraId,
      status: camera.status,
      lastPing: new Date(),
      responseTime: Math.floor(Math.random() * 100) + 50, // ms
      streamQuality: camera.status === "online" ? "good" : "unavailable",
      diskSpace: Math.floor(Math.random() * 40) + 60, // percentage
      cpuUsage: Math.floor(Math.random() * 30) + 10, // percentage
      memoryUsage: Math.floor(Math.random() * 50) + 20, // percentage
      networkLatency: Math.floor(Math.random() * 20) + 5, // ms
    };
    res.json({
      success: true,
      data: { healthStatus },
    });
  } catch (error) {
    logger.error("Camera health check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check camera health",
    });
  }
};

// Restart camera
const restartCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const camera = await Camera.findOneAndUpdate(
      { $or: [{ _id: id }, { cameraId: id }] },
      {
        status: "online",
        "maintenance.lastMaintenance": new Date(),
      },
      { new: true },
    );
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }
    logger.info(`Camera restarted: ${camera.cameraId} by user: ${req.user.userId}`);
    res.json({
      success: true,
      message: "Camera restarted successfully",
      data: { camera },
    });
  } catch (error) {
    logger.error("Restart camera error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restart camera",
    });
  }
};

module.exports = {
  uploadCameraVideo,
  addCamera,
  getCameras,
  getCameraById,
  updateCamera,
  getCameraHealth,
  restartCamera,
};
