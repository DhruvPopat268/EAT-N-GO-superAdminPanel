const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    image: String,

    // Items included in the combo
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attribute',
        },
        _id: false,
      },
    ],

    // ⭐ NEW: Addons field
    addons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddonItem',
      },
    ],

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Mixed'],
      required: true,
    },

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

module.exports = mongoose.model('Combo', comboSchema);