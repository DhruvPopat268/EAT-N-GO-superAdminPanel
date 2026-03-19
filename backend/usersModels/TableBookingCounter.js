const mongoose = require('mongoose');

const tableBookingCounterSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      unique: true
    },
    
    tableBookingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TableBookingCounter', tableBookingCounterSchema);