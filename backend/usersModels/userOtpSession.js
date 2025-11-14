const mongoose = require("mongoose");

const userOtpSessionSchema = new mongoose.Schema(
  {
    mobileNo: {
      type: String,
      required: true,
    },
    otp: {
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

// TTL index for 5 minutes expiry
userOtpSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("UserOtpSession", userOtpSessionSchema);