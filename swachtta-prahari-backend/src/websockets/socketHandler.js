const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/winston");
// WebSocket authentication
const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new Error("User not found or inactive"));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};
// Socket event handlers
const handleConnection = (io) => {
  return (socket) => {
    logger.info(`User connected: ${socket.userName} (${socket.userId})`);
    // Join user to appropriate rooms based on role
    socket.join("authenticated_users");
    socket.join(`role_${socket.userRole}`);
    // Send initial data
    socket.emit("connected", {
      message: "Connected to Swachhta Prahari",
      userId: socket.userId,
      role: socket.userRole,
    });
    // Handle custom events
    socket.on("subscribe_to_camera", (cameraId) => {
      socket.join(`camera_${cameraId}`);
      logger.info(`User ${socket.userId} subscribed to camera ${cameraId}`);
    });

    socket.on("unsubscribe_from_camera", (cameraId) => {
      socket.leave(`camera_${cameraId}`);
      logger.info(`User ${socket.userId} unsubscribed from camera ${cameraId}`);
    });
    socket.on("request_live_data", () => {
      // Send current system status
      socket.emit("live_data", {
        timestamp: new Date(),
        systemStatus: "operational",
        activeCameras: 14,
        totalCameras: 16,
        pendingIncidents: 3,
      });
    });
    // Handle disconnect
    socket.on("disconnect", (reason) => {
      logger.info(`User disconnected: ${socket.userName} (${socket.userId}) - Reason:
${reason}`);
    });
    // Handle errors
    socket.on("error", (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  };
};
// Main socket handler
const socketHandler = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);
  // Connection handler
  io.on("connection", handleConnection(io));
  // Store io instance globally for use in other services
  global.io = io;
  logger.info("WebSocket server initialized");
};
module.exports = socketHandler;
