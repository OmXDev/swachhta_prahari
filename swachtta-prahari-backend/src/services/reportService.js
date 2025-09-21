const fs = require("fs").promises;
const path = require("path");
const moment = require("moment"); // Required for date calculations
const logger = require("../config/winston");

// Note: Assuming these models are imported from elsewhere
// const Camera = require('../models/Camera');
// const Incident = require('../models/Incident');

// --- Helper Functions for Report Generation ---

/**
 * Generates a mock PDF report. In production, a library like puppeteer or jsPDF would be used.
 * @param {object} report - The report details.
 * @param {Array<object>} incidents - The list of incidents to include in the report.
 * @param {boolean} includeEvidence - Whether to include evidence details.
 * @returns {Promise<object>} - The file path and size of the generated report.
 */
const generatePDFReport = async (report, incidents, includeEvidence = true) => {
  try {
    const reportDir = path.join(__dirname, "../../uploads/reports");
    await fs.mkdir(reportDir, { recursive: true });
    const filename = `${report.reportId}.pdf`;
    const filepath = path.join(reportDir, filename);

    // In a real-world scenario, this would use a PDF generation library.
    // This is a placeholder that saves a JSON file for demonstration.
    const reportContent = {
      reportId: report.reportId,
      type: report.type,
      period: report.period,
      summary: report.summary,
      incidents: incidents.map((i) => ({
        id: i.incidentId,
        type: i.type,
        severity: i.severity,
        location: i.location,
        timestamp: i.createdAt,
        status: i.status,
        evidence: includeEvidence ? i.evidence : null,
      })),
      generatedAt: new Date(),
      generatedBy: report.generatedBy,
    };

    await fs.writeFile(filepath, JSON.stringify(reportContent, null, 2));
    const stats = await fs.stat(filepath);
    logger.info(`PDF report generated: ${filename}`);

    return {
      filePath: filepath,
      fileSize: stats.size,
    };
  } catch (error) {
    logger.error("Generate PDF report error:", error);
    throw error;
  }
};

/**
 * Generates a mock Excel report. In production, a library like xlsx or exceljs would be used.
 * @param {object} report - The report details.
 * @param {Array<object>} incidents - The list of incidents to include in the report.
 * @returns {Promise<object>} - The file path and size of the generated report.
 */
const generateExcelReport = async (report, incidents) => {
  try {
    const reportDir = path.join(__dirname, "../../uploads/reports");
    await fs.mkdir(reportDir, { recursive: true });
    const filename = `${report.reportId}.xlsx`;
    const filepath = path.join(reportDir, filename);

    // In a real-world scenario, this would use an Excel generation library.
    // This is a placeholder that saves a JSON file.
    const excelData = {
      reportInfo: {
        reportId: report.reportId,
        type: report.type,
        period: report.period,
        generatedAt: new Date(),
      },
      summary: report.summary,
      incidents: incidents.map((i) => ({
        incidentId: i.incidentId,
        type: i.type,
        severity: i.severity,
        status: i.status,
        camera: i.camera.cameraId,
        location: `${i.location.zone} - ${i.location.specific}`,
        description: i.description,
        confidence: Math.round(i.aiDetection.confidence * 100),
        createdAt: i.createdAt,
        resolvedAt: i.response.resolvedAt,
        assignedTo: i.response.assignedTo?.name,
        resolvedBy: i.response.resolvedBy?.name,
      })),
    };

    await fs.writeFile(filepath, JSON.stringify(excelData, null, 2));
    const stats = await fs.stat(filepath);
    logger.info(`Excel report generated: ${filename}`);

    return {
      filePath: filepath,
      fileSize: stats.size,
    };
  } catch (error) {
    logger.error("Generate Excel report error:", error);
    throw error;
  }
};

// --- API Route Handlers for Analytics ---

/**
 * Fetches and aggregates system analytics, including camera metrics, incident trends,
 * and performance data.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const getAnalytics = async (req, res) => {
  try {
    // Assume req.query has a 'range' parameter, e.g., '7d', '30d'.
    const { range = "7d" } = req.query;
    let dateFilter = {};
    let startDate;

    switch (range) {
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

    dateFilter = { createdAt: { $gte: startDate } };

    const totalCameras = await Camera.countDocuments();
    const activeCameras = await Camera.countDocuments({ status: "online" });

    const incidentTrends = await Incident.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          incidents: {
            $push: {
              type: "$_id.type",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const performanceMetrics = await Incident.aggregate([
      {
        $match: {
          createdAt: dateFilter.createdAt,
          status: "resolved",
        },
      },
      {
        $group: {
          _id: null,
          averageResponseTime: {
            $avg: {
              $divide: [
                { $subtract: ["$response.resolvedAt", "$createdAt"] },
                1000 * 60, // Convert to minutes
              ],
            },
          },
          totalResolved: { $sum: 1 },
        },
      },
    ]);

    const zoneMetrics = await Incident.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$location.zone",
          incidentCount: { $sum: 1 },
          averageSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$severity", "low"] }, then: 1 },
                  { case: { $eq: ["$severity", "medium"] }, then: 2 },
                  { case: { $eq: ["$severity", "high"] }, then: 3 },
                  { case: { $eq: ["$severity", "critical"] }, then: 4 },
                ],
                default: 1,
              },
            },
          },
        },
      },
    ]);

    const cleanlinessIndex = {};
    ["A", "B", "C", "D"].forEach((zone) => {
      const zoneData = zoneMetrics.find((z) => z._id === zone);
      if (zoneData) {
        const impact = (zoneData.incidentCount * zoneData.averageSeverity) / 10;
        cleanlinessIndex[zone] = Math.max(60, 100 - impact);
      } else {
        cleanlinessIndex[zone] = 95; // No incidents = high cleanliness
      }
    });

    res.json({
      success: true,
      data: {
        systemOverview: {
          totalCameras,
          activeCameras,
          systemUptime: 99.7, // Hardcoded, should be dynamic
          detectionAccuracy: 94.2, // Hardcoded, should be dynamic
        },
        incidentTrends,
        performanceMetrics: performanceMetrics[0] || {
          averageResponseTime: 0,
          totalResolved: 0,
        },
        cleanlinessIndex: {
          overall:
            Object.values(cleanlinessIndex).reduce((a, b) => a + b, 0) /
            Object.values(cleanlinessIndex).length,
          byZone: cleanlinessIndex,
        },
        dateRange: { range, startDate: dateFilter.createdAt.$gte, endDate: moment().toDate() },
      },
    });
  } catch (error) {
    logger.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

/**
 * Fetches performance analytics for all cameras.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const getCameraPerformance = async (req, res) => {
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

    const cameraPerformance = await Camera.aggregate([
      {
        $lookup: {
          from: "incidents",
          localField: "_id",
          foreignField: "camera",
          as: "incidents",
        },
      },
      {
        $addFields: {
          recentIncidents: {
            $filter: {
              input: "$incidents",
              cond: { $gte: ["$$this.createdAt", startDate] },
            },
          },
        },
      },
      {
        $project: {
          cameraId: 1,
          name: 1,
          location: 1,
          status: 1,
          "statistics.uptime": 1,
          detectionCount: { $size: "$recentIncidents" },
          accuracy: {
            $cond: [
              { $gt: [{ $size: "$recentIncidents" }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: "$recentIncidents",
                            cond: { $ne: ["$$this.status", "false_positive"] },
                          },
                        },
                      },
                      { $size: "$recentIncidents" },
                    ],
                  },
                  100,
                ],
              },
              100,
            ],
          },
          lastActivity: { $max: "$recentIncidents.createdAt" },
        },
      },
      { $sort: { cameraId: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        timeRange,
        cameras: cameraPerformance,
        summary: {
          totalCameras: cameraPerformance.length,
          averageAccuracy:
            cameraPerformance.length > 0
              ? cameraPerformance.reduce((sum, cam) => sum + cam.accuracy, 0) /
                cameraPerformance.length
              : 0,
          totalDetections: cameraPerformance.reduce((sum, cam) => sum + cam.detectionCount, 0),
        },
      },
    });
  } catch (error) {
    logger.error("Get camera performance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch camera performance",
    });
  }
};

module.exports = {
  generatePDFReport,
  generateExcelReport,
  getAnalytics,
  getCameraPerformance,
};
