// controllers/payoutController.js
const Payout = require("../models/Payout");

// Get all payouts
const getPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find().sort({ date: -1 });

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payouts",
      error: error.message,
    });
  }
};

// Update payout (approve/reject)
const updatePayout = async (req, res) => {
  try {
    const { id } = req.params; // frontend mockId
    const { date, workerCount, dailyWage, status } = req.body;

    if (status === "approved") {
      let payout = await Payout.findOne({ mockId: id });

      if (payout) {
        payout.dailyWage = dailyWage ?? payout.dailyWage;
        payout.workerCount = workerCount ?? payout.workerCount;
        payout.date = date ?? payout.date;
        payout.status = "approved";
        await payout.save();
      } else {
        payout = new Payout({
          mockId: id,
          date,
          workerCount,
          dailyWage,
          status: "approved",
        });
        await payout.save();
      }

      return res.json({
        success: true,
        message: "Payout approved/updated successfully",
        data: payout,
      });
    }

    // If rejected/pending → remove if exists
    const existing = await Payout.findOne({ mockId: id });
    if (existing) {
      await existing.deleteOne();
    }

    return res.json({
      success: true,
      message: "Payout not approved, not stored in DB",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payout",
      error: error.message,
    });
  }
};

// Delete payout
const deletePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const payout = await Payout.findOne({ mockId: id });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found",
      });
    }

    await payout.deleteOne();

    res.json({
      success: true,
      message: "Payout deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting payout",
      error: error.message,
    });
  }
};

module.exports = { getPayouts, updatePayout, deletePayout };
