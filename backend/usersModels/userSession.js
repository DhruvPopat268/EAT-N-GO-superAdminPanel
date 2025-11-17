const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
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