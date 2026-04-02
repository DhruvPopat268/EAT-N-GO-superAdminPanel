const mongoose = require('mongoose');
const TableBookingCounter = require('./TableBookingCounter');

const tableBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    checkAvailabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableBookingCheckAvailability',
      required: true
    },

    tableBookingNo: {
      type: Number
    },

    numberOfGuests: { type: Number },
    
    allocatedTables: {
      tableNumbers: [{ type: String }],
      allocatedAt: { type: Date, default: Date.now }
    },
    
    bookingTimings: {
      date: { type: Date },
      slotTime: { type: String },
      slotId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    },
    specialInstructions: { type: String },

    offer: {
      offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TableBookingOffers'
      },
      offerName: { type: String },
      offerDescription: { type: String },
      restaurantOfferPercentageOnBill: { type: Number },
      adminOfferPercentageOnBill: { type: Number }
    },

    coverCharges: {
      type: Number,
      required: true
    },

    coverChargePaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'redeemed'],
      default: 'pending'
    },

    currency: {
      code: { type: String },
      name: { type: String },
      symbol: { type: String }
    },

    // Table booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'notArrived', 'expired'],
      default: 'pending',
    },

    // Track who updated the status last
    lastStatusUpdatedBy: {
      type: String,
      enum: ['User', 'Restaurant', 'System']
    },

    // Admin commission
    adminCommission: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    // Payment references
    coverChargePaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },

    finalBillPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },

    // Track final bill amount collected at restaurant
    restaurantCollectedFinalBill: {
      type: Number
    },

    // Final bill payment breakdown
    finalBillPaidBreakdown: {
      originalFinalBill: { type: Number },
      restaurantDiscount: { type: Number },
      adminDiscount: { type: Number },
      coverChargesDeducted: { type: Number },
      discountedFinalBill: { type: Number }
    },

    // Settlement tracking
    settlement: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'settled', 'failed'],
        default: 'pending'
      },
      settledAt: {
        type: Date
      },
      restaurantAmount: {
        type: Number
      },
      adminCommissionAmount: {
        type: Number
      },
      adminCommissionInINR: {
        type: Number
      }
    },

    // Payment breakdown
    paymentBreakdown: {
      receivedAmount: {
        type: Number
      },
      receivedCurrency: {
        type: String
      },
      commissionPercentage: {
        type: Number
      },
      commissionAmount: {
        type: Number
      },
      restaurantShare: {
        type: Number
      }
    },

    // Cancellation info
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ['Restaurant', 'User']
      },
      reasonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderActionReason'
      },
      reason: { type: String }
    },
    
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate tableBookingNo
tableBookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await TableBookingCounter.findOneAndUpdate(
      { restaurantId: this.restaurantId },
      { $inc: { tableBookingCount: 1 } },
      { new: true, upsert: true }
    );
    
    this.tableBookingNo = counter.tableBookingCount;
  }
  next();
});

// Compound unique index for per-restaurant table booking numbering
tableBookingSchema.index({ restaurantId: 1, tableBookingNo: 1 }, { unique: true });

module.exports = mongoose.model('TableBooking', tableBookingSchema);