// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { getRedisClient } = require("../config/redis");
// const logger = require("../config/winston");
// // Authentication middleware
// const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.header("Authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. No token provided.",
//       });
//     }
//     const token = authHeader.replace("Bearer ", "");
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       // Check if user session exists in Redis
//       // const redis = getRedisClient();
//       // const session = await redis.get(`user_session:${decoded.userId}`);
//       // if (!session) {
//       //     return res.status(401).json({
//       //         success: false,
//       //         message: 'Session expired. Please login again.'
//       //     });
//       // }
//       // Get user from database
//       const user = await User.findById(decoded.userId);
//       if (!user || !user.isActive) {
//         return res.status(401).json({
//           success: false,
//           message: "User not found or inactive",
//         });
//       }
//       req.user = {
//         userId: user._id,
//         username: user.username,
//         role: user.role,
//         name: user.name,
//       };
//       next();
//     } catch (jwtError) {
//       logger.warn("JWT verification failed:", jwtError.message);
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }
//   } catch (error) {
//     logger.error("Authentication error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
// // Authorization middleware
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: "Insufficient permissions",
//       });
//     }
//     next();
//   };
// };
// // Optional authentication (for public endpoints that enhance with auth)
// const optionalAuth = async (req, res, next) => {
//   const authHeader = req.header("Authorization");
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     try {
//       await authenticate(req, res, () => {});
//     } catch (error) {
//       // Continue without authentication if token is invalid
//       req.user = null;
//     }
//   }

//   next();
// };
// module.exports = {
//   authenticate,
//   authorize,
//   optionalAuth,
// };


const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getRedisClient } = require("../config/redis");
const logger = require("../config/winston");

// 🔐 Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.warn(`JWT verification failed: ${err.message}`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Optional Redis session check
    // const redis = getRedisClient();
    // const session = await redis.get(`user_session:${decoded.userId}`);
    // if (!session) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Session expired. Please login again.",
    //   });
    // }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.user = {
      userId: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 🔒 Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }
    next();
  };
};

// ⚡ Optional Authentication
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      await authenticate(req, res, () => {});
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
