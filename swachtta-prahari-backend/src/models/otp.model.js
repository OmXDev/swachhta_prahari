// models/otp.model.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, required: true },
}, { timestamps: true });

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("Otp", otpSchema);
