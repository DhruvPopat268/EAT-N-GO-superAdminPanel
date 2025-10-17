const mongoose = require('mongoose');

const restaurantSessionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('RestaurantSession', restaurantSessionSchema);