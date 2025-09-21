const Analytics = require("../models/Analytics");
const Incident = require("../models/Incident");
const Camera = require("../models/Camera");
const logger = require("../config/winston");
const moment = require("moment");
// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { range = "week", startDate, endDate } = req.query;
    let dateFilter;
    const now = moment();
    switch (range) {
      case "today":
        dateFilter = {
          $gte: now.startOf("day").toDate(),
          $lt: now.endOf("day").toDate(),
        };
        break;
      case "week":
        dateFilter = {
          $gte: now.subtract(7, "days").startOf("day").toDate(),
          $lt: moment().endOf("day").toDate(),
        };
        break;
      case "month":
        dateFilter = {
          $gte: now.subtract(30, "days").startOf("day").toDate(),
          $lt: moment().endOf("day").toDate(),
        };
        break;
      case "custom":
        if (startDate && endDate) {
          dateFilter = {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          };
        }
        break;
      default:
        dateFilter = {
          $gte: moment().subtract(7, "days").startOf("day").toDate(),
          $lt: moment().endOf("day").toDate(),
        };
    }
    // Get analytics data
    const analytics = await Analytics.find({
      date: dateFilter,
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
};

// Get real-time dashboard data
const getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Today's incident summary
    const todayIncidents = await Incident.aggregate([
      {
        $match: { createdAt: { $gte: today } },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    // Camera status summary
    const cameraStatus = await Camera.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    // Recent critical incidents
    const criticalIncidents = await Incident.find({
      severity: { $in: ["high", "critical"] },
      status: { $in: ["detected", "pending"] },
    })
      .populate("camera", "cameraId name location")
      .sort({ createdAt: -1 })
      .limit(5);
    // System health metrics
    const systemHealth = {
      aiProcessingEngine: "online",
      databaseConnection: "online",
      cameraNetwork: `${cameraStatus.find((s) => s._id === "online")?.count || 0}/16`,
      lastUpdate: new Date(),
    };
    res.json({
      success: true,
      data: {
        incidentSummary: todayIncidents.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        cameraStatus: cameraStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        criticalIncidents,
        systemHealth,
      },
    });
  } catch (error) {
    logger.error("Get dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getAnalytics,
  getDashboardData,
};
