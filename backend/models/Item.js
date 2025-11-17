const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
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
    images: [String],

    attributes: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attribute',
        },
        price: Number,
        _id: false,
      },
    ],

    // Food Type Variations (e.g., Regular, Jain, Swaminarayan)
    foodTypes: [
      {
        type: String,
        enum: ['Regular', 'Jain', 'Swaminarayan'],
      },
    ],

    // Customizations (e.g., Breads, Sweets)
    customizations: [
      {
        name: { type: String, required: true },
        MaxSelection: {
          type: Number,
          default: 1,
          validate: {
            validator: function (v) {
              return v === -1 || v > 0;
            },
            message: 'MaxSelection must be -1 or a number greater than 0.',
          },
        },

        options: [
          {
            label: { type: String, required: true },
            quantity: { type: Number, default: 0 },
            unit: {
              type: String,
              enum: ['GM', 'ML', 'unit'],
              default: 'unit',
            },
            price: { type: Number, default: 0 },
            _id: false,
          },
        ],

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

module.exports = mongoose.model('Item', itemSchema);