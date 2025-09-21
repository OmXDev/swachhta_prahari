const mongoose = require("mongoose");
const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    systemMetrics: {
      totalCameras: Number,
      activeCameras: Number,
      systemUptime: Number, // percentage
      averageProcessingTime: Number, // milliseconds
      aiModelAccuracy: Number, // percentage
      falsePositiveRate: Number, // percentage
    },
    incidentMetrics: {
      totalIncidents: Number,
      newIncidents: Number,
      resolvedIncidents: Number,
      averageResponseTime: Number, // minutes
      incidentsByType: {
        illegal_dumping: Number,
        overflow: Number,
        drain_clogging: Number,
        cleanliness_violation: Number,
      },
      incidentsBySeverity: {
        low: Number,
        medium: Number,
        high: Number,
        critical: Number,
      },
      incidentsByZone: {
        A: Number,
        B: Number,
        C: Number,
        D: Number,
      },
    },
    cleanlinessMetrics: {
      overallIndex: Number,
      zoneIndexes: {
        A: Number,
        B: Number,
        C: Number,
        D: Number,
      },
      improvement: Number, // percentage change from previous day
      trends: {
        weekly: Number,
        monthly: Number,
      },
    },
    cameraPerformance: [
      {
        cameraId: String,
        uptime: Number,
        detections: Number,
        accuracy: Number,
        errors: Number,
      },
    ],
    alerts: {
      systemAlerts: Number,
      criticalIncidents: Number,
      maintenanceAlerts: Number,
    },
  },
  {
    timestamps: true,
  },
);
// Indexes
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ "systemMetrics.systemUptime": 1 });
module.exports = mongoose.model("Analytics", analyticsSchema);
