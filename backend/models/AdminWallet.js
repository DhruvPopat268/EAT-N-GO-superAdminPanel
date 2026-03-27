const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currency: {
    code: { type: String, default: 'INR' },
    name: { type: String, default: 'Indian Rupee' },
    symbol: { type: String, default: '₹' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminWallet', adminWalletSchema);
