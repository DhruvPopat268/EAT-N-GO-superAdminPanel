# Order Cancellation Settlement Implementation Summary

## Overview
Implemented comprehensive cancellation settlement logic that splits cancellation charges between admin and restaurant based on the `nonRefundSplit` configuration.

## Files Modified/Created

### 1. **NEW FILE**: `/backend/utils/orderCancellationSettlement.js`
Contains two main functions:
- `handleRestaurantCancellationOnline()` - Handles restaurant cancellation for online payment orders
- `handleUserCancellationOnline()` - Handles user cancellation for online payment orders

### 2. **UPDATED**: `/backend/utils/depositTestingHandler.js`
- `handleOrderCompletion()` - Now splits `appliedPendingCancellationCharges` between admin and restaurant
- `handlePayAtRestaurantCompletion()` - Now splits `appliedPendingCancellationCharges` between admin and restaurant

### 3. **UPDATED**: `/backend/restaurantRoutes/orderRoutes.js`
- `PATCH /cancel` - Integrated `handleRestaurantCancellationOnline()` for settlement

### 4. **UPDATED**: `/backend/usersRoutes/orderRoutes.js`
- `POST /cancel` - Integrated `handleUserCancellationOnline()` for settlement

## Implementation Details

### Restaurant Cancellation (Online Payment)
When restaurant cancels an order with online payment:

1. **Refund Calculation**:
   - `refundAmount = totalAmount - appliedPendingCancellationCharges`
   - If `appliedPendingCharges > totalAmount`, refund = 0 and remaining goes to user's pending balance

2. **Settlement Flow**:
   - Debit `refundAmount` from AdminWallet → User (refund transaction)
   - Split `appliedPendingCancellationCharges` using `nonRefundSplit`:
     - Admin gets `adminSplit%` (tracked with `affectsBalance: false`)
     - Restaurant gets `restaurantSplit%` (debit from AdminWallet, credit to RestaurantWallet)

3. **Wallet Transactions Created**:
   - Admin refund debit (if refundAmount > 0)
   - Admin commission credit (affectsBalance: false)
   - Admin debit for restaurant share
   - Restaurant credit for their share

### Restaurant Cancellation (Pay at Restaurant)
- No settlement needed (no online payment was made)
- `appliedPendingCharges` returned to user's pending balance

### User Cancellation (Online Payment)
When user cancels an order with online payment:

1. **Cancellation Charges Calculation**:
   - `currentOrderCancellationCharges` = based on refund policy percentage
   - `totalCancellationCharges` = `currentOrderCancellationCharges + appliedPendingCancellationCharges`

2. **Refund Calculation**:
   - `refundAmount = totalAmount - totalCancellationCharges`
   - If `totalCancellationCharges > totalAmount`, refund = 0 and remaining goes to pending

3. **Settlement Flow**:
   - Debit `refundAmount` from AdminWallet → User (refund transaction)
   - Split `totalCancellationCharges` using `nonRefundSplit`:
     - Admin gets `adminSplit%` (tracked with `affectsBalance: false`)
     - Restaurant gets `restaurantSplit%` (debit from AdminWallet, credit to RestaurantWallet)

4. **Wallet Transactions Created**:
   - Admin refund debit (if refundAmount > 0)
   - Admin commission credit (affectsBalance: false)
   - Admin debit for restaurant share
   - Restaurant credit for their share

### User Cancellation (Pay at Restaurant)
- No settlement needed (no online payment was made)
- All cancellation charges added to user's pending balance

### Order Completion with Applied Pending Charges
When order is completed and has `appliedPendingCancellationCharges`:

#### Online Payment:
- `restaurantShare = receivedAmount - commission - pendingChargesRestaurantShare`
- Admin gets: `commission + pendingChargesAdminShare` (tracked with `affectsBalance: false`)
- Restaurant gets: `receivedAmount - commission - pendingChargesRestaurantShare`

#### Pay at Restaurant:
- `totalAdminEarnings = commission + pendingChargesAdminShare`
- Debit `totalAdminEarnings` from RestaurantWallet
- Credit `totalAdminEarnings` to AdminWallet

## Configuration

The split percentage is configured in Restaurant model:
```javascript
tableReservationBookingConfig: {
  nonRefundSplit: {
    restaurant: 50,  // Restaurant gets 50% of cancellation charges
    admin: 50        // Admin gets 50% of cancellation charges
  }
}
```

## Key Features

1. **Currency Conversion**: All amounts converted to INR for AdminWallet using real-time exchange rates
2. **Transaction Tracking**: All wallet movements tracked in WalletTransaction model
3. **Balance Integrity**: Admin commission tracked separately with `affectsBalance: false`
4. **Error Handling**: Settlement failures rollback entire transaction
5. **Idempotency**: Prevents duplicate settlements

## Transaction Flow Summary

### Restaurant Cancels (Online):
```
AdminWallet → User (refund)
AdminWallet → RestaurantWallet (restaurant's share of cancellation charges)
AdminWallet (commission tracking only, affectsBalance: false)
```

### User Cancels (Online):
```
AdminWallet → User (refund)
AdminWallet → RestaurantWallet (restaurant's share of cancellation charges)
AdminWallet (commission tracking only, affectsBalance: false)
```

### Order Completes (with pending charges):
```
Online Payment:
  AdminWallet → RestaurantWallet (restaurant share minus their portion of pending charges)
  AdminWallet (commission + admin's share of pending charges, affectsBalance: false)

Pay at Restaurant:
  RestaurantWallet → AdminWallet (commission + admin's share of pending charges)
```

## Next Steps

1. **Table Booking Settlement** - Implement similar logic for table bookings
2. **Refund Processing** - Integrate with actual payment gateways for refunds
3. **Admin Dashboard** - Create APIs to view wallet balances and transactions
4. **Restaurant Dashboard** - Create APIs for restaurants to view their wallet
5. **Withdrawal System** - Allow restaurants to withdraw their earnings
6. **Reports** - Generate commission and settlement reports
