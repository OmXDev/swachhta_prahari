const Incident = require("../models/Incident");
const Camera = require("../models/Camera");
const logger = require("../config/winston");
const { v4: uuidv4 } = require("uuid");

// Validate AI detection payload
const validateAIPayload = (payload) => {
  const errors = [];
  if (!payload.cameraId) errors.push("Camera ID is required");
  if (!payload.detection) errors.push("Detection data is required");
  if (!payload.detection.type) errors.push("Detection type is required");
  if (typeof payload.detection.confidence !== "number") errors.push("Confidence score is required");
  if (!payload.timestamp) errors.push("Timestamp is required");
  const validTypes = ["illegal_dumping", "overflow", "drain_clogging", "cleanliness_violation"];
  if (payload.detection.type && !validTypes.includes(payload.detection.type)) {
    errors.push("Invalid detection type");
  }
  if (payload.detection.confidence < 0 || payload.detection.confidence > 1) {
    errors.push("Confidence must be between 0 and 1");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
// Process AI detection
const processDetection = async (detectionData) => {
  try {
    const { cameraId, detection, timestamp, evidence, location } = detectionData;
    // Find camera
    const camera = await Camera.findOne({ cameraId });
    if (!camera) {
      throw new Error(`Camera not found: ${cameraId}`);
    }

    // Check confidence threshold
    const threshold = camera.aiConfig.confidenceThreshold || 0.85;
    if (detection.confidence < threshold) {
      logger.info(`Detection below threshold: ${detection.confidence} < ${threshold} for camera
${cameraId}`);
      return { incidentCreated: false };
    }
    // Determine severity based on type and confidence
    const severity = determineSeverity(detection.type, detection.confidence);
    // Create incident
    const incident = new Incident({
      type: detection.type,
      severity,
      camera: camera._id,
      location: {
        zone: location?.zone || camera.location.zone,
        specific: location?.specific || `${camera.name} vicinity`,

        coordinates: location?.coordinates || detection.boundingBox,
      },
      description: generateDescription(detection.type, camera.name),
      aiDetection: {
        confidence: detection.confidence,
        modelVersion: detection.modelVersion || "1.2.3",
        boundingBox: detection.boundingBox,
        processedAt: new Date(timestamp),
      },
      evidence: evidence || { images: [], videos: [] },
    });
    await incident.save();
    // Update camera statistics
    await Camera.findByIdAndUpdate(camera._id, {
      $inc: { "statistics.totalDetections": 1 },
      "statistics.lastDetection": new Date(),
    });
    logger.info(`AI Detection processed: ${incident.incidentId} from camera: ${cameraId}`);
    return {
      incidentCreated: true,
      incident: await incident.populate("camera", "cameraId name location"),
    };
  } catch (error) {
    logger.error("Process detection error:", error);
    throw error;
  }
};

// Determine severity based on detection type and confidence
const determineSeverity = (type, confidence) => {
  const baseTypeWeights = {
    illegal_dumping: 3,
    overflow: 2,
    drain_clogging: 2,
    cleanliness_violation: 1,
  };
  const weight = baseTypeWeights[type] || 1;
  const score = weight * confidence;
  if (score >= 2.5) return "critical";
  if (score >= 2.0) return "high";
  if (score >= 1.5) return "medium";
  return "low";
};

// Generate human-readable description
const generateDescription = (type, cameraName) => {
  const descriptions = {
    illegal_dumping: `Illegal waste dumping activity detected at ${cameraName}`,
    overflow: `Waste container overflow detected at ${cameraName}`,
    drain_clogging: `Drain blockage or overflow detected at ${cameraName}`,
    cleanliness_violation: `Cleanliness violation detected at ${cameraName}`,
  };
  return descriptions[type] || `Environmental issue detected at ${cameraName}`;
};
// Simulate AI model training data preparation
const prepareTrainingData = async (incidentIds, feedback) => {
  try {
    const incidents = await Incident.find({
      _id: { $in: incidentIds },
    }).populate("camera", "cameraId name");
    const trainingData = incidents.map((incident) => ({
      incidentId: incident.incidentId,
      cameraId: incident.camera.cameraId,
      type: incident.type,
      originalConfidence: incident.aiDetection.confidence,
      humanFeedback: feedback[incident._id] || "correct",
      evidenceFiles: [
        ...incident.evidence.images.map((img) => img.path),
        ...incident.evidence.videos.map((vid) => vid.path),
      ],
    }));
    return trainingData;
  } catch (error) {
    logger.error("Prepare training data error:", error);
    throw error;
  }
};
module.exports = {
  validateAIPayload,
  processDetection,
  determineSeverity,
  generateDescription,
  prepareTrainingData,
};
