const mongoose = require('mongoose');

const tableBookingCheckAvailabilitySchema = new mongoose.Schema(
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

    numberOfGuests: { type: Number },
    
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

    currency: {
      code: { type: String },
      name: { type: String },
      symbol: { type: String }
    },

    // Simplified status enum
    status: {
      type: String,
      enum: ['pending', 'expired', 'completed'],
      default: 'pending',
    },
    
    // Expiry timestamp for availability check
    expiresAt: {
      type: Date,
      required: true
    },
    
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
tableBookingCheckAvailabilitySchema.index({ restaurantId: 1 });
tableBookingCheckAvailabilitySchema.index({ userId: 1 });
tableBookingCheckAvailabilitySchema.index({ status: 1 });

module.exports = mongoose.model('TableBookingCheckAvailability', tableBookingCheckAvailabilitySchema);