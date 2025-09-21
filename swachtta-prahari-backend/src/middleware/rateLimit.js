const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15", 10) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

module.exports = { apiLimiter };
