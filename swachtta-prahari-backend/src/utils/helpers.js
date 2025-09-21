const moment = require("moment");
const { SEVERITY_LEVELS, INCIDENT_TYPES } = require("./constants");
// Format date for display
const formatDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  return moment(date).format(format);
};
// Calculate relative time
const getRelativeTime = (date) => {
  return moment(date).fromNow();
};
// Generate unique filename
const generateUniqueFilename = (originalName, prefix = "") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  return `${prefix}${timestamp}-${random}.${extension}`;
};
// Calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};
// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
// Generate incident description
const generateIncidentDescription = (type, cameraName, additionalInfo = "") => {
  const descriptions = {
    [INCIDENT_TYPES.ILLEGAL_DUMPING]: `Illegal waste dumping detected at
${cameraName}`,
    [INCIDENT_TYPES.OVERFLOW]: `Waste container overflow at ${cameraName}`,
    [INCIDENT_TYPES.DRAIN_CLOGGING]: `Drain blockage detected at ${cameraName}`,
    [INCIDENT_TYPES.CLEANLINESS_VIOLATION]: `Cleanliness violation at
${cameraName}`,
  };
  let description = descriptions[type] || `Environmental issue detected at ${cameraName}`;
  if (additionalInfo) {
    description += `. ${additionalInfo}`;
  }
  return description;
};

// Convert severity to priority score
const severityToPriority = (severity) => {
  const priorities = {
    [SEVERITY_LEVELS.LOW]: 1,
    [SEVERITY_LEVELS.MEDIUM]: 2,
    [SEVERITY_LEVELS.HIGH]: 3,
    [SEVERITY_LEVELS.CRITICAL]: 4,
  };
  return priorities[severity] || 1;
};
// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
// Generate random coordinates within a bounding box
const generateRandomCoordinates = (centerLat, centerLng, radiusKm = 1) => {
  const radiusInDegrees = radiusKm / 111.32; // Approximate km to degrees conversion
  const lat = centerLat + (Math.random() - 0.5) * 2 * radiusInDegrees;
  const lng = centerLng + (Math.random() - 0.5) * 2 * radiusInDegrees;
  return { latitude: lat, longitude: lng };
};

// Sanitize filename for safe storage
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
};
// Parse and validate date range
const parseDateRange = (startDate, endDate, defaultRange = "7d") => {
  let start, end;
  if (startDate && endDate) {
    start = moment(startDate);
    end = moment(endDate);
    if (!start.isValid() || !end.isValid()) {
      throw new Error("Invalid date format");
    }

    if (start.isAfter(end)) {
      throw new Error("Start date cannot be after end date");
    }
  } else {
    // Use default range
    end = moment();
    switch (defaultRange) {
      case "24h":
        start = moment().subtract(1, "day");
        break;
      case "7d":
        start = moment().subtract(7, "days");
        break;
      case "30d":
        start = moment().subtract(30, "days");
        break;
      default:
        start = moment().subtract(7, "days");
    }
  }
  return {
    startDate: start.toDate(),
    endDate: end.toDate(),
  };
};
// Create pagination object
const createPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / pageSize);
  return {
    current: currentPage,
    pageSize,
    total: totalPages,
    totalRecords: total,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};
// Generate API response format
const createResponse = (success, data = null, message = null, meta = {}) => {
  const response = { success };
  if (message) response.message = message;
  if (data !== null) response.data = data;
  if (Object.keys(meta).length > 0) response.meta = meta;
  return response;
};
module.exports = {
  formatDate,
  getRelativeTime,
  generateUniqueFilename,
  calculatePercentageChange,
  isValidEmail,
  generateIncidentDescription,
  severityToPriority,
  formatFileSize,
  generateRandomCoordinates,
  sanitizeFilename,
  parseDateRange,
  createPagination,
  createResponse,
};
