const mongoose = require('mongoose');

const orderStatusReasonSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    
    reasonType: {
      type: String,
      enum: ['waiting', 'rejected'],
      required: true
    },
    
    reasonText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    createdBy: {
      type: String,
      enum: ['restaurant', 'admin'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

orderStatusReasonSchema.index({ restaurantId: 1, reasonType: 1, isActive: 1 });

module.exports = mongoose.model('OrderStatusReason', orderStatusReasonSchema);