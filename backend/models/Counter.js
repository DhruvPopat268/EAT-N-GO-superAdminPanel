const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  orderRequestCount: {
    type: Number,
    default: 0
  }
});

counterSchema.index({ restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);