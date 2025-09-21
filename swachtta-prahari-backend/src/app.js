require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { connectRedis } = require("./config/redis.js");

const { connectDB } = require("./config/database");
const logger = require("./config/winston");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");
const authRoutes = require("./routes/auth.js");
const camerasRoutes = require("./routes/cameras.js");
const incidentsRoutes = require("./routes/incidents.js");
const reportsRoutes = require("./routes/reports.js");
const payoutRoutes = require("./routes/payout.js");
const adminRoutes = require("./routes/manager.js");
const { keepServerAlive } = require("./jobs/cron.js");

const app = express();

(async () => {
  try {
    await connectRedis(); // 🔑 connect once at startup
    console.log("✅ Redis connected");

    // start express after redis is ready
    app.listen(3000, () => console.log("Server running on port 3000"));
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
    process.exit(1); // crash app if Redis is mandatory
  }
})();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
global.io = io;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));

// Parsers
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limit
app.use("/api", apiLimiter);

// Health route
app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});
// in app.js or server.js
// app.use("/static", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "beta") {
  app.get("/cron/wake", (req, res) => {
    res.send({ status: "ok", message: "Don't sleep wakkie wakkie" });
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/cameras", camerasRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/admin", adminRoutes)

// Error handler
app.use(errorHandler);

// Bootstrap
const PORT = process.env.PORT || 8000;
(async () => {
  keepServerAlive();
  await connectDB();
  server.listen(PORT, () => logger.info(`Server listening on :${PORT}`));
})();
