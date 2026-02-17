const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    couponCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    minOrderTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUsageLimit: {
      type: Number,
      default: -1,
      validate: {
        validator: function(v) {
          return v === -1 || v >= 1;
        },
        message: 'Total usage limit must be -1 (unlimited) or >= 1'
      }
    },
    userUsageLimit: {
      type: Number,
      default: 1,
      validate: {
        validator: function(v) {
          return v === -1 || v >= 1;
        },
        message: 'User usage limit must be -1 (unlimited) or >= 1'
      }
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ couponCode: 1, restaurantId: 1 }, { unique: true });
couponSchema.index({ restaurantId: 1, status: 1 });

module.exports = mongoose.model("Coupon", couponSchema);