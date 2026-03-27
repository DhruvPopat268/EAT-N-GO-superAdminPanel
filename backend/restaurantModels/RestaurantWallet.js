const mongoose = require('mongoose');

const restaurantWalletSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    unique: true
  },
  
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currency: {
    code: { type: String },
    name: { type: String },
    symbol: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RestaurantWallet', restaurantWalletSchema);
