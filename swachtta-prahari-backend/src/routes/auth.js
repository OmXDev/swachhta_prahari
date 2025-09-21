const express = require("express");
const {
  login,
  getOtp,
  verifyOtp,
  updatePassword,
  logout,
  getCurrentUser,
  refreshToken,
  signup,
} = require("../controllers/authController");
// const { authenticate } = require("../middleware/auth");
// const { validateLogin } = require("../middleware/validation");
// const { authLimiter } = require("../middleware/rateLimit");
// console.log("middlewares:", { authenticate, validateLogin, authLimiter });

const router = express.Router();

router.post("/signup", signup);
// Public routes
router.post("/login", login);
// router.post("/refresh", refreshToken);
router.post("/get-otp", getOtp);
router.post("/verify-otp", verifyOtp);
router.post("/updatepassword", updatePassword);

// Protected routes (require JWT authentication)
// router.post("/logout", authenticate, logout);
// router.get("/me", authenticate, getCurrentUser);

module.exports = router;
