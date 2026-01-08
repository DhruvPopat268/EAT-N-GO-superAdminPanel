const mongoose = require('mongoose');

const addonItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    category: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Mixed'],
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    image: String,
    attributes: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attribute',
          required: true,
        },
        price: { type: Number, default: 0 },
        _id: false,
      },
    ],
    currency: {
      type: String,
      default: 'INR',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AddonItem', addonItemSchema);