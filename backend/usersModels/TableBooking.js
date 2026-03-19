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

    tableBookingNo: {
      type: Number
    },

    numberOfGuests: { type: Number },
    bookingTimings: {
      date: { type: String },
      slotTime: { type: String }
    },
    specialInstructions: { type: String },

    offer: {
      offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TableBookingOffers'
      },
      offerName: { type: String },
      restaurantOfferPercentage: { type: Number },
      adminOfferPercentage: { type: Number }
    },

    totalAmount: {
      type: Number,
      required: true
    },

    currency: {
      code: { type: String },
      name: { type: String },
      symbol: { type: String }
    },

    // Table booking status
    status: {
      type: String,
      enum: ['confirmed', 'waiting', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'refunded'],
      default: 'confirmed',
    },

    // Cancellation/refund info
    cancelledBy: {
      type: String,
      enum: ['Restaurant', 'User']
    },
    cancellationReasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderActionReason'
    },
    cancellationReason: { type: String },
    
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