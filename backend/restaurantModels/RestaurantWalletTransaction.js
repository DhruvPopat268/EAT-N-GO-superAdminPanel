const mongoose = require('mongoose');

const restaurantWalletTransactionSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
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
    enum: ['order_payment', 'table_booking_payment', 'commission_deduction', 'refund', 'withdrawal', 'adjustment'],
    required: true
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
  
  commissionAmount: {
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

module.exports = mongoose.model('RestaurantWalletTransaction', restaurantWalletTransactionSchema);
