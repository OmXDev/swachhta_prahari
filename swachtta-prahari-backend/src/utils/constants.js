const INCIDENT_TYPES = {
  ILLEGAL_DUMPING: "illegal_dumping",
  OVERFLOW: "overflow",
  DRAIN_CLOGGING: "drain_clogging",
  CLEANLINESS_VIOLATION: "cleanliness_violation",
};

const SEVERITY_LEVELS = { LOW: "low", MEDIUM: "medium", HIGH: "high", CRITICAL: "critical" };

const INCIDENT_STATUS = {
  DETECTED: "detected",
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  FALSE_POSITIVE: "false_positive",
};

const CAMERA_STATUS = { ONLINE: "online", OFFLINE: "offline", MAINTENANCE: "maintenance" };

const USER_ROLES = { ADMIN: "admin", OPERATOR: "operator", VIEWER: "viewer" };

const ZONES = ["A", "B", "C", "D"];

const AI_SENSITIVITY = { LOW: "low", MEDIUM: "medium", HIGH: "high" };

const REPORT_TYPES = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly", CUSTOM: "custom" };

const REPORT_FORMATS = { PDF: "pdf", EXCEL: "excel", CSV: "csv" };

const EMAIL_TEMPLATES = {
  INCIDENT_ALERT: "incident_alert",
  DAILY_REPORT: "daily_report",
  SYSTEM_MAINTENANCE: "system_maintenance",
};

const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_FILES_PER_INCIDENT: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/avi", "video/mov"],
};

const CACHE_TTL = { USER_SESSION: 86400, CAMERA_STATUS: 300, ANALYTICS: 1800, SYSTEM_HEALTH: 60 };

const THRESHOLDS = {
  AI_CONFIDENCE_MIN: 0.5,
  AI_CONFIDENCE_DEFAULT: 0.85,
  RESPONSE_TIME_TARGET: 15,
  SYSTEM_UPTIME_TARGET: 99.5,
  FALSE_POSITIVE_MAX: 5,
};

module.exports = {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUS,
  CAMERA_STATUS,
  USER_ROLES,
  ZONES,
  AI_SENSITIVITY,
  REPORT_TYPES,
  REPORT_FORMATS,
  EMAIL_TEMPLATES,
  UPLOAD_LIMITS,
  CACHE_TTL,
  THRESHOLDS,
};
