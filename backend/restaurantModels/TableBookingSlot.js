const mongoose = require('mongoose');

const tableBookingSlotSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 15, // Minimum 15 minutes
    max: 480 // Maximum 8 hours
  },
  
  timeSlotCreatedWith: {
    maxGuests: {
      type: Number, // Initial maxGuests value when slots were created
      required: true,
      min: 1
    }
  },
  
  timeSlots: [{
    time: {
      type: String, // 24-hour format: "09:00", "14:30", etc.
      required: true,
      validate: {
        validator: function(time) {
          // Validate 24-hour format HH:MM
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Time must be in 24-hour format (HH:MM)'
      }
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1
    },
    onlineGuests: {
      type: Number,
      default: 0,
      min: 0
    },
    offlineGuests: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
tableBookingSlotSchema.index({ restaurantId: 1 });

module.exports = mongoose.model('TableBookingSlot', tableBookingSlotSchema);