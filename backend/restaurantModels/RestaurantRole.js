const mongoose = require('mongoose');

const restaurantRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantPermission'
  }],
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique role names per restaurant
restaurantRoleSchema.index({ name: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('RestaurantRole', restaurantRoleSchema);