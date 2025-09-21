const mongoose = require("mongoose");
const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      // required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["illegal_dumping", "overflow", "drain_clogging", "cleanliness_violation"],
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },
    status: {
      type: String,
      enum: ["detected", "pending", "in_progress", "resolved", "false_positive"],
      default: "detected",
    },
    camera: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camera",
      required: true,
    },
    location: {
      zone: String,
      specific: String,
      coordinates: {
        x: Number,
        y: Number,
      },
    },
    description: {
      type: String,
      required: true,
    },
    aiDetection: {
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
      },
      modelVersion: String,
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
      processedAt: {
        type: Date,
        default: Date.now,
      },
    },
    evidence: {
      images: [
        {
          filename: String,
          path: String,
          size: Number,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      videos: [
        {
          filename: String,
          path: String,
          duration: Number,
          size: Number,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    response: {
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      assignedAt: Date,
      actionTaken: String,
      resolvedAt: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
    },
    reportIncluded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
// Indexes for efficient queries
incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ type: 1, createdAt: -1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ camera: 1, createdAt: -1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ severity: 1, status: 1 });

// Auto-generate incident ID
incidentSchema.pre("save", async function (next) {
  if (!this.incidentId) {
    const count = await this.constructor.countDocuments();
    this.incidentId = `INC-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});
module.exports = mongoose.model("Incident", incidentSchema);
