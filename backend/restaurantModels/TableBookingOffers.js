const mongoose = require('mongoose');

const tableBookingOffersSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: false
  },
  
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
tableBookingOffersSchema.index({ restaurantId: 1 });

module.exports = mongoose.model('TableBookingOffers', tableBookingOffersSchema);