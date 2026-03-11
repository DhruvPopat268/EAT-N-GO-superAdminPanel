const mongoose = require('mongoose');

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

    tableBookingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableBookingRequest',
      required: true,
    },

    tableBookingNo: {
      type: Number
    },

    numberOfGuests: { type: Number },
    bookingTimings: {
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String }
    },
    specialInstructions: { type: String },

    // Payment info
    paymentMethod: {
      type: String,
      enum: ['online', 'pay_at_restaurant'],
      required: true
    },

    baseTotalAmount: {
      type: Number,
      required: true
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

    // Waiting time
    waitingTime: {
      date: String,
      startTime: String,
      endTime: String
    },

    // Timestamps for status changes
    waitingAt: { type: Date },
    preparedAt: { type: Date },
    readyAt: { type: Date },
    servedAt: { type: Date },
    completedAt: { type: Date },

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
    refundAmount: { type: Number },

    userRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userRating'
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate tableBookingNo
tableBookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const TableBookingCounter = require('../models/TableBookingCounter');
    
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