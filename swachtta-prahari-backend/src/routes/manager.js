const express = require("express")
const { getManagers, toggleManagerStatus, deleteManager, updateManager } = require("../controllers/managerController")

const router = express.Router()

// Admin endpoints
router.get("/managers", getManagers)
router.patch("/managers/:id/toggle-status", toggleManagerStatus)
router.delete("/managers/:id", deleteManager);
router.put("/managers/:id", updateManager)

module.exports = router
