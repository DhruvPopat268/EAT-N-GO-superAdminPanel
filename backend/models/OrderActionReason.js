const mongoose = require('mongoose');

const orderActionReasonSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    
    reasonType: {
      type: String,
      enum: ['waiting', 'rejected', 'cancelled'],
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
    }
  },
  {
    timestamps: true
  }
);

orderActionReasonSchema.index({ restaurantId: 1, reasonType: 1, isActive: 1 });

module.exports = mongoose.model('OrderActionReason', orderActionReasonSchema);