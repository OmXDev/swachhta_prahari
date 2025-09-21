const Camera = require("../models/Camera");
const Incident = require("../models/Incident");
const logger = require("../config/winston");
const { processDetection, validateAIPayload } = require("../services/aiService");
const { broadcastIncident } = require("../websockets/events");
// Receive AI detection webhook
const receiveDetection = async (req, res) => {
  try {
    const detectionData = req.body;
    // Validate AI payload
    const validation = validateAIPayload(detectionData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid detection payload",
        errors: validation.errors,
      });
    }
    // Process the detection
    const result = await processDetection(detectionData);
    if (result.incidentCreated) {
      logger.info(`AI Detection processed: ${result.incident.incidentId}`);
      // Broadcast to connected clients
      broadcastIncident("ai_detection", result.incident);
    }
    res.json({
      success: true,
      message: "Detection processed successfully",
      data: {
        processed: true,
        incidentCreated: result.incidentCreated,
        incidentId: result.incident?.incidentId,
      },
    });
  } catch (error) {
    logger.error("AI detection processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process detection",
    });
  }
};
// Get AI model status
const getModelStatus = async (req, res) => {
  try {
    // In production, this would query the actual AI service
    const modelStatus = {
      status: "active",
      version: "1.2.3",
      lastUpdate: new Date("2025-08-25"),
      accuracy: {
        overall: 94.2,
        byType: {
          illegal_dumping: 96.1,
          overflow: 93.8,
          drain_clogging: 91.5,
          cleanliness_violation: 94.7,
        },
      },
      performance: {
        averageProcessingTime: 245, // ms
        throughput: 16, // cameras processed simultaneously
        cpuUsage: 67, // percentage
        memoryUsage: 74, // percentage
        gpuUsage: 82, // percentage
      },
      detectionCounts: {
        today: await Incident.countDocuments({
          createdAt: {
            $gte: moment().startOf("day").toDate(),
            $lt: moment().endOf("day").toDate(),
          },
        }),
        thisWeek: await Incident.countDocuments({
          createdAt: {
            $gte: moment().startOf("week").toDate(),
            $lt: moment().endOf("week").toDate(),
          },
        }),
        thisMonth: await Incident.countDocuments({
          createdAt: {
            $gte: moment().startOf("month").toDate(),
            $lt: moment().endOf("month").toDate(),
          },
        }),
      },
    };
    res.json({
      success: true,
      data: { modelStatus },
    });
  } catch (error) {
    logger.error("Get model status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch model status",
    });
  }
};
// Update AI configuration
const updateAIConfig = async (req, res) => {
  try {
    const { cameraId, detectionTypes, sensitivity, confidenceThreshold } = req.body;
    let updateQuery = {};
    let updateData = {};
    if (cameraId) {
      // Update specific camera
      updateQuery = { cameraId };
      updateData = {
        "aiConfig.detectionTypes": detectionTypes,
        "aiConfig.sensitivity": sensitivity,
        "aiConfig.confidenceThreshold": confidenceThreshold,
      };
    } else {
      // Update all cameras
      updateQuery = {};
      updateData = {
        "aiConfig.sensitivity": sensitivity,
        "aiConfig.confidenceThreshold": confidenceThreshold,
      };
      if (detectionTypes) {
        updateData["aiConfig.detectionTypes"] = detectionTypes;
      }
    }
    const result = await Camera.updateMany(updateQuery, updateData);
    logger.info(`AI configuration updated for ${result.modifiedCount} cameras by user:
${req.user.userId}`);
    res.json({
      success: true,
      message: `AI configuration updated for ${result.modifiedCount} cameras`,
      data: {
        modifiedCount: result.modifiedCount,
        configuration: {
          detectionTypes,
          sensitivity,
          confidenceThreshold,
        },
      },
    });
  } catch (error) {
    logger.error("Update AI config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI configuration",
    });
  }
};
// Get detection statistics
const getDetectionStats = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    let startDate;
    switch (timeRange) {
      case "24h":
        startDate = moment().subtract(1, "day").toDate();
        break;
      case "7d":
        startDate = moment().subtract(7, "days").toDate();
        break;
      case "30d":
        startDate = moment().subtract(30, "days").toDate();
        break;
      default:
        startDate = moment().subtract(7, "days").toDate();
    }
    const stats = await Incident.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: "$aiDetection.confidence" },
          falsePositives: {
            $sum: { $cond: [{ $eq: ["$status", "false_positive"] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          detections: {
            $push: {
              type: "$_id.type",
              count: "$count",
              avgConfidence: "$avgConfidence",
              falsePositives: "$falsePositives",
            },
          },
          totalDetections: { $sum: "$count" },
          totalFalsePositives: { $sum: "$falsePositives" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.json({
      success: true,
      data: {
        timeRange,
        detectionStats: stats,
        summary: {
          totalDetections: stats.reduce((sum, day) => sum + day.totalDetections, 0),
          totalFalsePositives: stats.reduce((sum, day) => sum + day.totalFalsePositives, 0),
          accuracy:
            stats.length > 0
              ? ((stats.reduce((sum, day) => sum + day.totalDetections, 0) -
                  stats.reduce((sum, day) => sum + day.totalFalsePositives, 0)) /
                  stats.reduce((sum, day) => sum + day.totalDetections, 0)) *
                100
              : 100,
        },
      },
    });
  } catch (error) {
    logger.error("Get detection stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch detection statistics",
    });
  }
};
module.exports = {
  receiveDetection,
  getModelStatus,
  updateAIConfig,
  getDetectionStats,
};
