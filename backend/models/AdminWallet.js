const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Track total credits and debits (in INR)
  totalCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalDebits: {
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
  
  // Lock for concurrent transactions
  isLocked: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminWallet', adminWalletSchema);