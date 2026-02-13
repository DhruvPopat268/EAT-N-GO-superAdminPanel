const mongoose = require('mongoose');

const orderCancelRefundSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    confirmed: {
      percentage: { type: Number, default: 0 },
      status: { type: Boolean, default: false }
    },
    preparing: {
      percentage: { type: Number, default: 0 },
      status: { type: Boolean, default: false }
    },
    ready: {
      percentage: { type: Number, default: 0 },
      status: { type: Boolean, default: false }
    },
    served: {
      percentage: { type: Number, default: 0 },
      status: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrderCancelRefund', orderCancelRefundSchema);