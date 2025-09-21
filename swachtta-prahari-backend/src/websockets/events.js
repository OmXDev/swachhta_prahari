const logger = require("../config/winston");
// Broadcast incident events
const broadcastIncident = (eventType, incident) => {
  try {
    if (!global.io) {
      logger.warn("WebSocket server not initialized");
      return;
    }
    const eventData = {
      type: eventType,
      timestamp: new Date(),
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        camera: incident.camera,
        location: incident.location,
        description: incident.description,
        createdAt: incident.createdAt,
      },
    };
    // Broadcast to all authenticated users
    global.io.to("authenticated_users").emit("incident_update", eventData);
    // Broadcast to specific camera subscribers
    if (incident.camera?.cameraId) {
      global.io.to(`camera_${incident.camera.cameraId}`).emit("camera_incident", eventData);
    }
    // Send critical incidents to admins only
    if (incident.severity === "critical") {
      global.io.to("role_admin").emit("critical_incident", eventData);
    }
    logger.info(`Broadcasted ${eventType} for incident ${incident.incidentId}`);
  } catch (error) {
    logger.error("Broadcast incident error:", error);
  }
};
// Broadcast system status updates
const broadcastSystemStatus = (statusUpdate) => {
  try {
    if (!global.io) return;
    global.io.to("authenticated_users").emit("system_status", {
      timestamp: new Date(),
      ...statusUpdate,
    });
    logger.info("Broadcasted system status update");
  } catch (error) {
    logger.error("Broadcast system status error:", error);
  }
};
// Broadcast camera status changes
const broadcastCameraStatus = (cameraId, status, metadata = {}) => {
  try {
    if (!global.io) return;
    const eventData = {
      cameraId,
      status,
      timestamp: new Date(),
      ...metadata,
    };
    global.io.to("authenticated_users").emit("camera_status_change", eventData);
    global.io.to(`camera_${cameraId}`).emit("camera_update", eventData);
    logger.info(`Broadcasted camera status change: ${cameraId} -> ${status}`);
  } catch (error) {
    logger.error("Broadcast camera status error:", error);
  }
};

module.exports = {
  broadcastIncident,
  broadcastSystemStatus,
  broadcastCameraStatus,
};
