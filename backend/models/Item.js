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
        name: { type: String, required: true }, // e.g. "Breads"
        options: [
          {
            label: { type: String, required: true }, // e.g. "Tawa Roti"
            quantity: { type: Number, default: 0 }, // e.g. 250
            unit: { type: String, enum: ['GM', 'ML', 'unit'], default: 'unit' }, // e.g. "GM"
            price: { type: Number, default: 0 }, // optional price adjustment
            _id: false,
          },
        ],
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

module.exports = mongoose.model('Item', itemSchema);