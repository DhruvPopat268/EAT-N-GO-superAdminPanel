# Payment Settlement Implementation Summary

## Overview
The system now handles two payment methods for orders:
1. **Online Payment** - Customer pays online, money flows through admin wallet
2. **Pay at Restaurant** - Customer pays at restaurant, only commission is settled

---

## Implementation Details

### 1. Online Payment Flow

#### At Order Placement:
- **Function**: `handleOrderPlacement(order, restaurant)`
- **Actions**:
  - Create Payment record with status 'success'
  - Credit full amount to AdminWallet (in INR)
  - Create wallet transaction for admin
  - Set order settlement status to 'pending'

#### At Order Completion:
- **Function**: `handleOrderCompletion(order)`
- **Actions**:
  - Calculate commission and restaurant share
  - Debit restaurant share from AdminWallet
  - Credit restaurant share to RestaurantWallet
  - Create commission tracking transaction (doesn't affect balance)
  - Update order settlement status to 'settled'

**Money Flow**: Customer → AdminWallet → RestaurantWallet (minus commission)

---

### 2. Pay at Restaurant Flow

#### At Order Placement:
- **Actions**: NOTHING
- No payment record created
- No wallet transactions
- Customer will pay physically at restaurant

#### At Order Completion:
- **Function**: `handlePayAtRestaurantCompletion(order)`
- **Actions**:
  - Calculate commission amount
  - Debit commission from RestaurantWallet
  - Credit commission to AdminWallet (in INR)
  - Create wallet transactions for both
  - Update order settlement status to 'settled'

**Money Flow**: Customer → Restaurant (physical payment), Restaurant → Admin (commission only)

---

## Route Integration

### File: `backend/restaurantRoutes/orderRoutes.js`

**Endpoint**: `PATCH /completed/:orderId`

```javascript
// Handle settlement based on payment method
if (order.paymentMethod === 'online' && order.paymentId) {
  await handleOrderCompletion(order);
} else if (order.paymentMethod === 'pay_at_restaurant') {
  await handlePayAtRestaurantCompletion(order);
}
```

---

## Key Differences

| Aspect | Online Payment | Pay at Restaurant |
|--------|---------------|-------------------|
| Payment Record | Created at placement | Not created |
| AdminWallet at Placement | Credited full amount | No change |
| RestaurantWallet at Placement | No change | No change |
| AdminWallet at Completion | Debited (restaurant share) | Credited (commission only) |
| RestaurantWallet at Completion | Credited (restaurant share) | Debited (commission only) |
| Settlement Amount | Full order amount | Commission only |

---

## Currency Handling

Both functions handle multi-currency:
- RestaurantWallet: In restaurant's currency
- AdminWallet: Always in INR
- Automatic conversion using exchange rates
- Conversion details stored in transactions

---

## Error Handling

**Transaction Boundaries**: handleOrderCompletion and handlePayAtRestaurantCompletion do NOT manage transactions internally. Neither function accepts a session parameter nor calls .session() on wallet operations. The route-level transaction (in orderRoutes.js) covers only the order status update, not the wallet/ledger operations.

**Atomicity**: Partial - order updates are transactional, but wallet operations (adminWallet.save(), restaurantWallet.save(), WalletTransaction saves) occur outside the route transaction. If wallet operations fail after starting, the order transaction rolls back, but if they partially succeed then fail, inconsistencies may occur.

**Risks**: Wallet balance updates and transaction records could fail independently, potentially leaving wallets in inconsistent states if errors occur mid-execution.

**Remediation Options**: Pass a session parameter into handleOrderCompletion and handlePayAtRestaurantCompletion, then use .session(session) on all wallet operations to achieve full atomicity within the route transaction.

---

## Files Modified

1. **backend/utils/depositTestingHandler.js**
   - Added `handlePayAtRestaurantCompletion()` function
   - Exported all three functions

2. **backend/restaurantRoutes/orderRoutes.js**
   - Updated import to include `handlePayAtRestaurantCompletion`
   - Modified `/completed/:orderId` route to handle both payment methods

---

## Testing Checklist

### Online Payment Orders:
- [ ] Order placement creates payment record
- [ ] AdminWallet credited at placement
- [ ] Order completion splits money correctly
- [ ] RestaurantWallet receives correct share
- [ ] Commission tracked properly
- [ ] Settlement status updated

### Pay at Restaurant Orders:
- [ ] Order placement doesn't create payment
- [ ] No wallet changes at placement
- [ ] Order completion deducts commission from restaurant
- [ ] AdminWallet receives commission
- [ ] Settlement status updated
- [ ] Restaurant wallet can go negative (debt) if insufficient balance

### Multi-Currency:
- [ ] Currency conversion works correctly
- [ ] Exchange rates locked properly
- [ ] Conversion details stored in transactions

---

## Notes

1. **Restaurant Balance and Debt**: For pay_at_restaurant orders, commission is always deducted from the restaurant wallet regardless of current balance. If the restaurant has insufficient balance, the wallet will go negative, representing debt owed to the admin. The RestaurantWallet.balance has no minimum constraint, allowing negative values. Restaurants can clear debt through future online payment settlements which credit their wallet.

2. **Transaction Safety**: handleOrderPlacement uses MongoDB sessions and transactions. However, handleOrderCompletion and handlePayAtRestaurantCompletion do NOT manage transactions internally - wallet operations occur outside the route-level transaction (see Error Handling section).

3. **Commission Tracking**: For online payments, commission is tracked separately (affectsBalance: false) since it's already part of the original credit.

4. **Settlement Status**: Both methods update the order's settlement status to 'settled' and store breakdown details.
