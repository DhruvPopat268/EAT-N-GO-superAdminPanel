const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subcategory', subcategorySchema);