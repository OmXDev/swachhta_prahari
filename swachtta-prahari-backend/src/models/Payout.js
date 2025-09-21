// models/payout.model.js
const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    workerCount: {
      type: Number,
      required: true,
      min: 1,
    },
    dailyWage: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  },
);

// Virtual field for total wage
payoutSchema.virtual("totalWage").get(function () {
  return this.workerCount * this.dailyWage;
});

const Payout = mongoose.model("Payout", payoutSchema);

module.exports = Payout;
