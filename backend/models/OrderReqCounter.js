const mongoose = require('mongoose');

const orderReqCounterSchema = new mongoose.Schema({
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

orderReqCounterSchema.index({ restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('OrderReqCounter', orderReqCounterSchema);