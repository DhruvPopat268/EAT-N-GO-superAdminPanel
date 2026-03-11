const mongoose = require('mongoose');

const tableBookingRequestSchema = new mongoose.Schema(
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

    tableBookingRequestNo: Number,

    numberOfGuests: Number,
    bookingTimings: { 
      date: String,
      startTime: String, 
      endTime: String 
    },
    specialInstructions: String,

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'waiting', 'completed', 'cancelled'],
      default: 'pending'
    },

    cancelledBy: {
      type: String,
      enum: ['User', 'Restaurant', 'System']
    },

    waitingTime: {
      date: String,
      startTime: String,
      endTime: String
    },

    tableBookingReqReasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderActionReason'
    },

    paymentMethod: {
      type: String,
      enum: ['online', 'pay_at_restaurant']
    },

    finalTableBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableBooking'
    },

    currency: {
      code: { type: String },
      name: { type: String },
      symbol: { type: String }
    },

    expireAt: { type: Date }
  },

  { timestamps: true }
);

tableBookingRequestSchema.pre('save', async function (next) {
  if (this.isNew) {
    const TableBookingReqCounter = require('../models/TableBookingReqCounter');

    const counter = await TableBookingReqCounter.findOneAndUpdate(
      { restaurantId: this.restaurantId },
      { $inc: { tableBookingRequestCount: 1 } },
      { new: true, upsert: true }
    );

    this.tableBookingRequestNo = counter.tableBookingRequestCount;

    if (this.status === 'pending') {
      this.expireAt = new Date(Date.now() + 5 * 60 * 1000);
    }
  }

  next();
});

tableBookingRequestSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const newStatus = update.$set?.status;

  if (newStatus && newStatus !== 'pending') {
    this.setUpdate({
      ...update,
      $unset: { expireAt: "" }
    });
  }

  next();
});

tableBookingRequestSchema.index({ restaurantId: 1, tableBookingRequestNo: 1 }, { unique: true });
tableBookingRequestSchema.index({ expireAt: 1, status: 1 });

module.exports = mongoose.model('TableBookingRequest', tableBookingRequestSchema);