const User = require("../models/User")
const bcrypt = require('bcryptjs')

const updateManager = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, username, password, role, department } = req.body

    const updateData = { name, email, username, role, department }
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const manager = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password")

    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" })
    }

    res.json({ success: true, data: manager })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: { $in: ["payroll", "camera", "reporting", "ai", "analyst"] },
    })
      .select("-password") // don’t expose password
      .sort({ createdAt: -1 })

    return res.json({ success: true, data: managers })
  } catch (err) {
    console.error("Error fetching managers:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

const toggleManagerStatus = async (req, res) => {
  try {
    const { id } = req.params
    const manager = await User.findById(id)
    if (!manager) return res.status(404).json({ success: false, message: "Manager not found" })

    manager.status = manager.status === "active" ? "inactive" : "active"
    await manager.save()

    return res.json({ success: true, data: { status: manager.status } })
  } catch (err) {
    console.error("Error toggling manager status:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

const deleteManager = async (req, res) => {
  try {
    const { id } = req.params
    const manager = await User.findByIdAndDelete(id)
    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" })
    }
    return res.json({ success: true, message: "Manager deleted" })
  } catch (err) {
    console.error("Error deleting manager:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

module.exports = {
    updateManager,
  getManagers,
  toggleManagerStatus,
  deleteManager,
}
