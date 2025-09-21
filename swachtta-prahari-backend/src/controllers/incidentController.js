const Incident = require("../models/Incident");
const Camera = require("../models/Camera");
const User = require("../models/User");
const logger = require("../config/winston");
const { validationResult } = require("express-validator");
const { broadcastIncident } = require("../websockets/events");
// Get incidents with filtering and pagination
const getIncidents = async (req, res) => {
  try {
    const {
      type,
      severity,
      status,
      cameraId,
      zone,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (zone) filter["location.zone"] = zone;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    // Handle camera filter
    if (cameraId) {
      const camera = await Camera.findOne({ cameraId });
      if (camera) filter.camera = camera._id;
    }
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    const incidents = await Incident.find(filter)
      .populate("camera", "cameraId name location")
      .populate("response.assignedTo", "name username")
      .populate("response.resolvedBy", "name username")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Incident.countDocuments(filter);
    res.json({
      success: true,
      data: {
        incidents,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: incidents.length,
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    logger.error("Get incidents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
    });
  }
};
// Get single incident
const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne({
      $or: [{ _id: id }, { incidentId: id }],
    })
      .populate("camera", "cameraId name location")
      .populate("response.assignedTo", "name username email")
      .populate("response.resolvedBy", "name username email");
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }
    res.json({
      success: true,
      data: { incident },
    });
  } catch (error) {
    logger.error("Get incident by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incident",
    });
  }
};
// Create new incident (typically called by AI service)
const createIncident = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { type, severity, cameraId, location, description, aiDetection, evidence } = req.body;
    // Find camera
    const camera = await Camera.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }
    // Create incident
    const incident = new Incident({
      type,
      severity,
      camera: camera._id,
      location: {
        zone: location.zone,
        specific: location.specific || camera.location.position,
        coordinates: location.coordinates,
      },
      description,
      aiDetection,
      evidence: evidence || { images: [], videos: [] },
    });
    await incident.save();
    // Update camera statistics
    await Camera.findByIdAndUpdate(camera._id, {
      $inc: { "statistics.totalDetections": 1 },
      "statistics.lastDetection": new Date(),
    });
    // Populate incident for response
    await incident.populate("camera", "cameraId name location");
    // Broadcast to connected clients
    broadcastIncident("new_incident", incident);
    logger.info(`New incident created: ${incident.incidentId} from camera: ${cameraId}`);
    res.status(201).json({
      success: true,
      message: "Incident created successfully",
      data: { incident },
    });
  } catch (error) {
    logger.error("Create incident error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create incident",
    });
  }
};
// Update incident status
const updateIncidentStatus = async (req, res) => {
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
    const { status, actionTaken, notes } = req.body;
    const userId = req.user.userId;
    const updateData = {
      status,
    };
    // Handle assignment and resolution
    if (status === "in_progress" && !updateData["response.assignedTo"]) {
      updateData["response.assignedTo"] = userId;
      updateData["response.assignedAt"] = new Date();
    }
    if (status === "resolved") {
      updateData["response.resolvedBy"] = userId;
      updateData["response.resolvedAt"] = new Date();
      if (actionTaken) updateData["response.actionTaken"] = actionTaken;
    }
    if (notes) updateData["response.notes"] = notes;
    const incident = await Incident.findOneAndUpdate(
      { $or: [{ _id: id }, { incidentId: id }] },
      updateData,
      { new: true },
    )
      .populate("camera", "cameraId name location")
      .populate("response.assignedTo", "name username")
      .populate("response.resolvedBy", "name username");
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }
    // Broadcast update
    broadcastIncident("incident_updated", incident);
    logger.info(`Incident updated: ${incident.incidentId} to status: ${status} by user:
${userId}`);
    res.json({
      success: true,
      message: "Incident updated successfully",
      data: { incident },
    });
  } catch (error) {
    logger.error("Update incident error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update incident",
    });
  }
};
// Get incident statistics
const getIncidentStats = async (req, res) => {
  try {
    const { period = "today" } = req.query;
    let startDate, endDate;
    const now = new Date();
    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }
    const stats = await Incident.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalIncidents: { $sum: 1 },
          byType: {
            $push: "$type",
          },
          bySeverity: {
            $push: "$severity",
          },
          byStatus: {
            $push: "$status",
          },
          averageResponseTime: {
            $avg: {
              $cond: [
                { $ne: ["$response.resolvedAt", null] },
                {
                  $divide: [
                    { $subtract: ["$response.resolvedAt", "$createdAt"] },
                    1000 * 60, // Convert to minutes
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    ]);
    // Process aggregation results
    const result = stats[0] || {
      totalIncidents: 0,
      byType: [],
      bySeverity: [],
      byStatus: [],
      averageResponseTime: 0,
    };
    // Count by categories
    const typeCount = result.byType.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const severityCount = result.bySeverity.reduce((acc, severity) => {
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
    const statusCount = result.byStatus.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    res.json({
      success: true,
      data: {
        period,
        totalIncidents: result.totalIncidents,
        byType: typeCount,
        bySeverity: severityCount,
        byStatus: statusCount,
        averageResponseTime: Math.round(result.averageResponseTime || 0),
        dateRange: { startDate, endDate },
      },
    });
  } catch (error) {
    logger.error("Get incident stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incident statistics",
    });
  }
};
// Assign incident to user
const assignIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    const assignerId = req.user.userId;
    // Verify assignee exists
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: "Assignee not found",
      });
    }
    const incident = await Incident.findOneAndUpdate(
      { $or: [{ _id: id }, { incidentId: id }] },
      {
        status: "in_progress",
        "response.assignedTo": assigneeId,
        "response.assignedAt": new Date(),
      },
      { new: true },
    )
      .populate("camera", "cameraId name location")
      .populate("response.assignedTo", "name username");
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }
    // Broadcast update
    broadcastIncident("incident_assigned", incident);
    logger.info(`Incident assigned: ${incident.incidentId} to ${assignee.username} by
${assignerId}`);
    res.json({
      success: true,
      message: "Incident assigned successfully",
      data: { incident },
    });
  } catch (error) {
    logger.error("Assign incident error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign incident",
    });
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getIncidentStats,
  assignIncident,
};
