# Refund Implementation Note

## Current Implementation Status

### Restaurant Order Cancellation Refund Logic

**Location:** `backend/restaurantRoutes/orderRoutes.js` - `/cancel` route

### How It Currently Works:

When a restaurant cancels an order, the system handles refunds based on the payment method:

#### 1. Online Payment Orders
- **Current Behavior:** Status is directly updated to `'refunded'` in the database
- **Assumption:** User receives the money automatically
- **Reality:** No actual payment gateway API call is made

**What happens:**
```javascript
payment.status = 'refunded';
payment.refund = {
  amount: refundAmount,
  currency: order.currency?.code || payment.actual.currency,
  reason: 'Order cancelled by restaurant',
  refundedAt: new Date()
};
order.status = 'refunded';
order.refundAmount = refundAmount;
```

#### 2. Pay at Restaurant Orders
- Order is simply cancelled
- No refund needed (user hasn't paid yet)
- Status set to `'cancelled'`

---

## Important Notes

### ⚠️ No Payment Gateway Integration

Currently, there is **NO actual payment gateway refund API integration**. The system:

- ✅ Records refund intent in the database
- ✅ Updates payment and order status to 'refunded'
- ✅ Stores refund amount and timestamp
- ❌ **Does NOT call Razorpay/Stripe/PhonePe/PayPal refund API**
- ❌ **Does NOT have gatewayRefundId from the provider**

### What This Means:

1. **Database shows refund completed** - but no actual money transfer happens
2. **Manual intervention required** - Someone must manually process refunds through payment gateway dashboard
3. **No automatic reconciliation** - Cannot verify if refund actually reached customer

---

## Future Implementation Required

To make this production-ready, you need to:

### Option A: Synchronous Refund (Recommended)
```javascript
// Inside the cancel route, after validating payment
const gateway = payment.actual.gateway; // 'razorpay', 'stripe', etc.

// Call actual payment gateway refund API
let gatewayRefundId;
try {
  if (gateway === 'razorpay') {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const refundResponse = await razorpay.payments.refund(
      payment.actual.gatewayTransactionId,
      { amount: refundAmount * 100 } // Razorpay uses paise
    );
    
    gatewayRefundId = refundResponse.id;
  }
  // Add similar blocks for Stripe, PhonePe, PayPal
  
  // Only update status after successful gateway refund
  payment.status = 'refunded';
  payment.refund.gatewayRefundId = gatewayRefundId;
  
} catch (gatewayError) {
  await session.abortTransaction();
  session.endSession();
  return res.status(500).json({
    success: false,
    message: 'Refund failed at payment gateway',
    error: gatewayError.message
  });
}
```

### Option B: Asynchronous Refund
```javascript
// Set status to pending_refund
payment.status = 'pending_refund';
payment.refund.refundedAt = null; // Not refunded yet

// Create a background job/queue to process actual refund
// Update gatewayRefundId and status when job completes
```

---

## Current Validation Added

The cancel route now includes proper validation:

1. ✅ Checks if payment record exists for online orders
2. ✅ Validates payment status is 'success' before attempting refund
3. ✅ Uses database transactions for atomicity
4. ✅ Differentiates between online and pay_at_restaurant orders

---

## Action Items

- [ ] Integrate actual payment gateway refund APIs (Razorpay, Stripe, PhonePe, PayPal)
- [ ] Add gatewayRefundId tracking from provider response
- [ ] Implement webhook handlers for refund status updates
- [ ] Add refund reconciliation reports
- [ ] Create admin dashboard to manually trigger refunds if needed
- [ ] Add retry mechanism for failed refunds
- [ ] Implement refund notification to users

---

**Last Updated:** [Current Date]  
**Status:** Development - Manual Refund Processing Required
