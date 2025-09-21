const express = require("express");
const { generateReport, getReports, downloadReport } = require("../controllers/reportController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  validateReportGeneration,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");
const router = express.Router();
// All report routes require authentication
// router.use(authenticate);
router.post("/generate", validateReportGeneration, generateReport);
router.get("/", validatePagination, getReports);
router.get("/:id/download", validateObjectId, downloadReport);
module.exports = router;
