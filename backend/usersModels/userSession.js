const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    mobileNo: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: { 
      currentTime: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000) // IST
    } 
  }
);

module.exports = mongoose.model("UserSession", userSessionSchema);