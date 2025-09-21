// models/Camera.js
const mongoose = require("mongoose");

const uploadedVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // secure Cloudinary URL
    publicId: { type: String, required: true }, // for future deletions
    originalName: { type: String, required: true },
    format: { type: String },
    duration: { type: Number }, // seconds (Cloudinary returns this for videos)
    bytes: { type: Number }, // file size in bytes
    width: { type: Number },
    height: { type: Number },
    thumbnailUrl: { type: String }, // optional eager transformation or derived thumbnail
  },
  { _id: false, timestamps: true },
);

const cameraSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      zone: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
      },
      position: String, // free text like "Main Gate"
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    rtspUrl: {
      type: String,
      required: true,
    },
    uploadedVideos: {
      type: [uploadedVideoSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["online", "offline", "maintenance"],
      default: "offline",
    },
    specifications: {
      resolution: String,
      frameRate: Number,
      nightVision: Boolean,
      weatherResistant: Boolean,
    },
    aiConfig: {
      enabled: {
        type: Boolean,
        default: true,
      },
      detectionTypes: [
        {
          type: String,
          enum: [
            "illegal_dumping",
            "waste_overflow",
            "improper_disposal",
            "bin_full",
            "unauthorized_access",
            "spill_detection",
            "vehicle_tracking",
            "drain_clogging",
            "area_monitoring",
          ],
        },
      ],
      sensitivity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      confidenceThreshold: {
        type: Number,
        default: 0.85,
        min: 0.5,
        max: 0.99,
      },
    },
    statistics: {
      totalDetections: { type: Number, default: 0 },
      lastDetection: Date,
      uptime: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
    },
    maintenance: {
      lastMaintenance: Date,
      nextMaintenance: Date,
      maintenanceNotes: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
cameraSchema.index({ cameraId: 1 });
cameraSchema.index({ "location.zone": 1 });
cameraSchema.index({ status: 1 });

module.exports = mongoose.model("Camera", cameraSchema);
