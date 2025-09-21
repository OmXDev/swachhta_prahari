// routes/payoutRoutes.js
const express = require("express");
const {
  getPayouts,
  updatePayout,
  deletePayout,
} = require("../controllers/payoutController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ✅ All payout routes require login
router.use(authenticate);

// 🔹 Payroll Manager + Admin can view payouts
router.get("/", authorize("payroll", "admin"), getPayouts);

// 🔹 Payroll Manager + Admin can approve/update payouts
router.put("/:id", authorize("payroll", "admin"), updatePayout);

// 🔹 Only Admin can delete payouts
router.delete("/:id", authorize("admin"), deletePayout);

module.exports = router;
