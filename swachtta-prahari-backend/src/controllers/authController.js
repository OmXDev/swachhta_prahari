const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User"); // mongoose model
const logger = require("../config/winston");
const { getRedisClient } = require("../config/redis");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const otp = require('../models/otp')

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = { userId: user._id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Login Controller
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    // Find user by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true,
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Failed login attempt for username/email: ${username}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token & update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // ===== Redis/session caching commented out for now =====
    // const redis = getRedisClient();
    // await redis.setEx(
    //   `user_session:${user._id}`,
    //   86400, // 1 day
    //   JSON.stringify({
    //     userId: user._id,
    //     username: user.username,
    //     role: user.role,
    //   })
    // );

    logger.info(`User logged in: ${user.username}`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  login,
};

// in-memory OTP store
// const otpStore = {};

// configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate JWT tokens
// const generateTokens = (userId) => {
//   const payload = { userId, timestamp: Date.now() };
//   const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE || "7d",
//   });
//   const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
//   });
//   return { accessToken, refreshToken };
// };

// ======================== SIGNUP ========================
const signup = async (req, res) => {
  try {
    // validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, department, role, email, username, password, createdByAdmin } = req.body;

    if (!email || !username || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      username,
      password, // hashed in pre-save hook
      role,
      department,
      isActive: true,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send credentials via email if created by admin
    if (createdByAdmin) {
      try {
        await transporter.sendMail({
          from: `"Swachhta Prahari" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your Manager Account Credentials",
          text: `
Hello ${name},

Your account has been created successfully.

🔑 Login Credentials:
Username: ${username}
Password: ${password}

Please login and change your password immediately after first login.

Regards,
Swachhta Prahari Team
          `,
        });
        logger.info(`Credentials email sent to ${email}`);
      } catch (mailErr) {
        logger.error("Error sending credentials email:", mailErr);
      }
    }

    logger.info(`New user signed up: ${user.username}`);

    res.json({
      success: true,
      message: "Signup successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================== GET OTP ========================
const getOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) {
      return res.status(400).json({ success: false, message: "Email and purpose are required" });
    }

    const user = await User.findOne({ email });

    if ((purpose === "login" || purpose === "forgot-password") && !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    } else if (purpose === "signup" && user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in MongoDB with TTL (10 min)
    await Otp.create({ email, otp, purpose });

    await transporter.sendMail({
      from: `"Swachhta Prahari" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: purpose === "signup" ? "Signup Verification OTP" : "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
    });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// ======================== VERIFY OTP ========================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    }

    // OTP verified → delete it
    await Otp.deleteOne({ _id: record._id });

    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

module.exports = {
  getOtp,
  verifyOtp,
};



// ======================== UPDATE PASSWORD ========================
// controllers/auth.js (updatePassword)
const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ success: false, message: "Email and new password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Assign plain password and let the pre-save hook hash it
    user.password = newPassword;
    await user.save();

    // cleanup OTP store etc.
    delete otpStore[email];

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    return res.status(500).json({ success: false, message: "Failed to update password" });
  }
};

// ======================== LOGOUT ========================
const logout = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    const redis = getRedisClient();
    await redis.del(`user_session:${userId}`);

    logger.info(`User logged out: ${userId}`);
    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ======================== GET CURRENT USER ========================
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    logger.error("Get current user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ======================== REFRESH TOKEN ========================
const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken,
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

module.exports = {
  signup,
  login,
  getOtp,
  verifyOtp,
  updatePassword,
  logout,
  getCurrentUser,
  refreshToken: refreshTokenController,
};
