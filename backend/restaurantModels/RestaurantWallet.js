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
    default: 0
  },
  
  // Restaurant wallet currency (based on restaurant location)
  currency: {
    code: { 
      type: String,
      required: true  // USD, INR, GBP, EUR, etc.
    },
    name: { 
      type: String,
      required: true
    },
    symbol: { 
      type: String,
      required: true
    }
  },
  
  // Pending settlements
  pendingSettlement: {
    type: Number,
    default: 0
  },
  
  // Total earnings (credits)
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // Total debits (refunds, chargebacks, etc.)
  totalDebits: {
    type: Number,
    default: 0
  },
  
  // Total withdrawals
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  
  // Lock for concurrent transactions
  isLocked: {
    type: Boolean,
    default: false
  },
  
  // Bank details for withdrawal
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,  // For India
    swiftCode: String,  // For international
    routingNumber: String,  // For US
    iban: String  // For Europe
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('RestaurantWallet', restaurantWalletSchema);