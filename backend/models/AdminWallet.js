const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Admin wallet is ALWAYS in INR
  currency: {
    code: { 
      type: String, 
      default: 'INR',
      immutable: true  // Cannot be changed
    },
    name: { 
      type: String, 
      default: 'Indian Rupee',
      immutable: true
    },
    symbol: { 
      type: String, 
      default: '₹',
      immutable: true
    }
  },
  
  // Track total commissions received by currency
  totalCommissionsReceived: [{
    currency: String,
    amount: Number,
    convertedAmount: Number,  // In INR
    _id: false
  }],
  
  // Lock for concurrent transactions
  isLocked: {
    type: Boolean,
    default: false
  },
  
  lastTransactionAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminWallet', adminWalletSchema);