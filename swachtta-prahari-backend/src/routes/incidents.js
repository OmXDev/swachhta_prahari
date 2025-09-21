const express = require("express");
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getIncidentStats,
  assignIncident,
} = require("../controllers/incidentController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  validateIncidentCreation,
  validateIncidentUpdate,
  validateObjectId,
  validatePagination,
  validateDateRange,
} = require("../middleware/validation");
const router = express.Router();
// Public routes (for AI service)
router.post("/", validateIncidentCreation, createIncident);
// Protected routes
// router.use(authenticate);
router.get("/", validatePagination, validateDateRange, getIncidents);
router.get("/stats", getIncidentStats);
router.get("/:id", validateObjectId, getIncidentById);
router.put("/:id/status", validateObjectId, validateIncidentUpdate, updateIncidentStatus);
router.post("/:id/assign", authorize("admin", "operator"), validateObjectId, assignIncident);
module.exports = router;
