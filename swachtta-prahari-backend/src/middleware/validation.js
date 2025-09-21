const { body, param, query } = require("express-validator");
// Auth validation
const validateLogin = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
// Camera validation
const validateCameraUpdate = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Camera name must be 1-100 characters"),
  body("location.zone")
    .optional()
    .isIn(["A", "B", "C", "D"])
    .withMessage("Zone must be A, B, C, or D"),
  body("aiConfig.sensitivity")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Sensitivity must be low, medium, or high"),
  body("aiConfig.confidenceThreshold")
    .optional()
    .isFloat({ min: 0.5, max: 0.99 })
    .withMessage("Confidence threshold must be between 0.5 and 0.99"),
];
// Incident validation
const validateIncidentCreation = [
  body("type")
    .isIn(["illegal_dumping", "overflow", "drain_clogging", "cleanliness_violation"])
    .withMessage("Invalid incident type"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid severity level"),
  body("cameraId").notEmpty().withMessage("Camera ID is required"),
  body("description")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be 10-500 characters"),
  body("aiDetection.confidence")
    .isFloat({ min: 0, max: 1 })
    .withMessage("Confidence must be between 0 and 1"),
];
const validateIncidentUpdate = [
  body("status")
    .isIn(["detected", "pending", "in_progress", "resolved", "false_positive"])
    .withMessage("Invalid status"),
  body("actionTaken")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Action taken must not exceed 1000 characters"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];
// Report validation
const validateReportGeneration = [
  body("type").isIn(["daily", "weekly", "monthly", "custom"]).withMessage("Invalid report type"),
  body("format").optional().isIn(["pdf", "excel", "csv"]).withMessage("Invalid report format"),
  body("startDate")
    .if(body("type").equals("custom"))
    .isISO8601()
    .withMessage("Valid start date required for custom reports"),
  body("endDate")
    .if(body("type").equals("custom"))
    .isISO8601()
    .withMessage("Valid end date required for custom reports"),
  body("emailRecipients").optional().isArray().withMessage("Email recipients must be an array"),
  body("emailRecipients.*").optional().isEmail().withMessage("Invalid email address in recipients"),
];
// AI configuration validation
const validateAIConfig = [
  body("sensitivity")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid sensitivity level"),
  body("confidenceThreshold")
    .optional()
    .isFloat({ min: 0.5, max: 0.99 })
    .withMessage("Confidence threshold must be between 0.5 and 0.99"),
  body("detectionTypes").optional().isArray().withMessage("Detection types must be an array"),
  body("detectionTypes.*")
    .optional()
    .isIn(["illegal_dumping", "overflow", "drain_clogging", "cleanliness_violation"])
    .withMessage("Invalid detection type"),
];
// Parameter validation
const validateObjectId = [
  param("id")
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage("Invalid ID format"),
];
const validateCameraId = [
  param("id")
    .matches(/^(CAM-\d{3}|[0-9a-fA-F]{24})$/)
    .withMessage("Invalid camera ID format"),
];
// Query validation
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
const validateDateRange = [
  query("startDate").optional().isISO8601().withMessage("Invalid start date format"),
  query("endDate").optional().isISO8601().withMessage("Invalid end date format"),
];
module.exports = {
  validateLogin,
  validateCameraUpdate,
  validateIncidentCreation,
  validateIncidentUpdate,
  validateReportGeneration,
  validateAIConfig,
  validateObjectId,
  validateCameraId,
  validatePagination,
  validateDateRange,
};
