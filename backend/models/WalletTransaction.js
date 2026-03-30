const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  // Which wallet this transaction belongs to
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'walletType'
  },
  
  walletType: {
    type: String,
    enum: ['AdminWallet', 'RestaurantWallet'],
    required: true
  },
  
  // Transaction details
  transactionType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Currency of this transaction
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
  
  // For admin wallet: if commission from foreign restaurant
  conversion: {
    originalAmount: {
      type: Number  // Commission in restaurant currency
    },
    originalCurrency: {
      type: String  // USD, GBP, EUR, etc.
    },
    conversionRate: {
      type: Number  // Exchange rate used
    },
    conversionSource: {
      type: String  // 'fixer.io', 'exchangerate-api'
    },
    convertedAt: {
      type: Date
    }
  },
  
  // Transaction source/reason
  source: {
    type: String,
    enum: [
      'order_payment',           // Restaurant receives payment
      'table_booking_payment',   // Restaurant receives booking payment
      'commission',              // Admin receives commission
      'settlement',              // Money movement between wallets
      'refund',                  // Refund to user
      'withdrawal',              // Restaurant withdraws money
      'adjustment',              // Manual adjustment
      'penalty',                 // Penalty deduction
      'bonus'                    // Bonus credit
    ],
    required: true
  },
  
  // References
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  tableBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TableBooking'
  },
  
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  
  // Commission details
  commissionPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  commissionAmount: {
    type: Number  // In original currency
  },
  
  // Description
  description: {
    type: String
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed'
  },
  
  // For failed transactions
  failureReason: {
    type: String
  },
  
  // Metadata
  metadata: {
    initiatedBy: String,  // 'system', 'admin', 'restaurant'
    ipAddress: String,
    notes: String
  }
  
}, {
  timestamps: true
});

// Indexes
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ walletType: 1, createdAt: -1 });
walletTransactionSchema.index({ restaurantId: 1, createdAt: -1 });
walletTransactionSchema.index({ paymentId: 1 });
walletTransactionSchema.index({ orderId: 1 });
walletTransactionSchema.index({ tableBookingId: 1 });
walletTransactionSchema.index({ source: 1, createdAt: -1 });
walletTransactionSchema.index({ status: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
