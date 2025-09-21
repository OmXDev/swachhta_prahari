// models/Report.js
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  incidentId: String,
  timestamp: String,
  cameraId: String,
  eventType: String,
  locationDetails: String,
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
  },
});

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "custom", "incident_summary"],
    },
    project: String,
    site: String,
    preparedFor: String,
    preparedBy: String,
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    executiveSummary: String,
    incidents: [incidentSchema],
    analytics: {
      trends: [String],
      analysis: [String],
      recommendations: [String],
    },
    conclusion: String,
    fileInfo: {
      filename: String,
      path: String,
      format: {
        type: String,
        enum: ["pdf", "excel", "csv", "json"],
      },
      size: Number,
      generatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    deliveryStatus: {
      emailSent: { type: Boolean, default: false },
      sentAt: Date,
      recipients: [String],
      deliveryErrors: [String],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //   required: true
    },
  },
  { timestamps: true },
);

// Auto-generate report ID
reportSchema.pre("save", function (next) {
  if (!this.reportId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    this.reportId = `RPT-${dateStr}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

module.exports = mongoose.model("Report", reportSchema);
