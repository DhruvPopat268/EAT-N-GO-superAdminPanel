const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    restaurantRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    itemRatings: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      }
    }],

    feedback: {
      type: String,
      trim: true,
      default: "",
    }
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate review for same order
ratingSchema.index({ userId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model("userRating", ratingSchema);