const mongoose = require('mongoose');

const restaurantPermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String, 
    trim: true
  },
  module: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique permission names per restaurant
restaurantPermissionSchema.index({ name: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('RestaurantPermission', restaurantPermissionSchema);