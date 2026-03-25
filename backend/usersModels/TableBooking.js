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
    
    allocatedTables: [{
      tableNumbers: [{ type: String }],
      allocatedAt: { type: Date, default: Date.now }
    }],
    
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
      restaurantOfferPercentageOnBill: { type: Number },
      adminOfferPercentageOnBill: { type: Number },
      usageStatus: {
        type: String,
        enum: ['pending', 'redeemed', 'expired', 'cancelled'],
        default: 'pending'
      }
    },

    coverCharges: {
      type: Number,
      required: true
    },

    coverChargePaymentId: {
      type: String
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
      enum: ['pending', 'confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'notArrived'],
      default: 'pending',
    },

    // Track who updated the status last
    lastStatusUpdatedBy: {
      type: String,
      enum: ['User', 'Restaurant', 'System']
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