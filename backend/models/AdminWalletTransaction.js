const mongoose = require('mongoose');

const adminWalletTransactionSchema = new mongoose.Schema({
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
  
  source: {
    type: String,
    enum: ['order_commission', 'table_booking_commission', 'refund', 'adjustment'],
    required: true
  },
  
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  tableBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TableBooking'
  },
  
  commissionPercentage: {
    type: Number
  },
  
  description: {
    type: String
  },
  
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminWalletTransaction', adminWalletTransactionSchema);
