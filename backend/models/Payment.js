const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
  // Reference to order or table booking
  referenceType: {
    type: String,
    enum: ['order', 'table_booking'],
    required: true
  },
  
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'referenceType'
  },
  
  // What user initiated payment for
  original: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    }
  },
  
  // What we expected to receive (before gateway processing)
  expected: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    rate: {
      type: Number,
      default: 1
    },
    source: {
      type: String  // 'fixer', 'exchangerate-api', null for same currency
    },
    calculatedAt: {
      type: Date
    }
  },
  
  // What we actually received from gateway (THIS IS WHAT WE USE FOR COMMISSION)
  actual: {
    amount: {
      type: Number  // Commission calculated on THIS amount
    },
    currency: {
      type: String
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'phonepe', 'paypal', 'testing']
    },
    fees: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    gatewayTransactionId: {
      type: String
    },
    gatewayOrderId: {
      type: String
    },
    processedAt: {
      type: Date
    }
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'partial_refunded'],
    default: 'pending'
  },
  
  // Refund details
  refund: {
    amount: {
      type: Number
    },
    currency: {
      type: String
    },
    reason: {
      type: String
    },
    refundedAt: {
      type: Date
    },
    gatewayRefundId: {
      type: String
    }
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  }
  
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ restaurantId: 1, createdAt: -1 });
paymentSchema.index({ referenceType: 1, referenceId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'actual.gatewayTransactionId': 1 });

module.exports = mongoose.model('Payment', paymentSchema);
