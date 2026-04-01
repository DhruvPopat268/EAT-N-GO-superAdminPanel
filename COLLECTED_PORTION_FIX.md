# User Cancellation Settlement - Collected Portion Fix

## Issue Identified

The user cancellation settlement was settling the entire `clampedTotalCancellationCharges`, which includes both:
1. **Current order cancellation charges** (actually collected from this payment)
2. **Applied pending cancellation charges** (carried over from previous orders, never collected)

This caused over-settlement because we were trying to split charges that were never actually collected in the first place.

## The Problem

### Example Scenario:
- User has $20 pending charges from a previous cancelled order
- User places new order for $100 (total collected: $100)
- Applied pending charges: $20 (deducted from payment, but never actually collected)
- User cancels, current cancellation charges: $30
- Total cancellation charges: $50 ($30 current + $20 pending)

**Before Fix:**
- Settlement tried to split $50 between admin and restaurant
- But only $30 was actually collected from this payment
- The $20 pending charges were never collected, so shouldn't be settled

**After Fix:**
- Settlement only splits $30 (the actually collected portion)
- The $20 pending charges remain as pending (not settled)

## Solution Implemented

### Calculation Logic:

```javascript
// Calculate collected portion of cancellation charges
// collectedPortion = totalCancellationCharges - pendingCharges
// Capped to never exceed (collectedAmount - refundAmount)
const collectedPortion = Math.min(
  clampedTotalCancellationCharges - (order.appliedPendingCancellationCharges || 0),
  Math.max(0, collectedAmount - refundAmount)
);

// Only settle if there's a collected portion
if (collectedPortion > 0) {
  await handleUserCancellationOnline(order, refundAmount, collectedPortion);
}
```

### Key Changes:

1. **Compute Collected Portion**:
   - `collectedPortion = clampedTotalCancellationCharges - appliedPendingCancellationCharges`
   - This excludes pending charges that were never collected

2. **Cap to Available Amount**:
   - `collectedPortion` capped to `Math.max(0, collectedAmount - refundAmount)`
   - Ensures we never settle more than what's available after refund

3. **Conditional Settlement**:
   - Only call `handleUserCancellationOnline()` when `collectedPortion > 0`
   - Prevents unnecessary settlement calls when there's nothing to settle

## Benefits

### 1. Accurate Settlement
- Only settles charges that were actually collected
- Prevents over-settlement of non-existent funds

### 2. Correct Wallet Balances
- Admin wallet doesn't get credited for uncollected charges
- Restaurant wallet doesn't get credited for uncollected charges

### 3. Proper Pending Charge Handling
- Pending charges remain pending (not settled)
- Will be collected and settled in future orders

### 4. Prevents Settlement Errors
- Avoids trying to split $0 or negative amounts
- Prevents wallet transaction errors

## Example Scenarios

### Scenario 1: Order with Pending Charges
- Order total: $100
- Applied pending charges: $20
- Collected amount: $100
- Current cancellation charges: $30
- Total cancellation charges: $50

**Calculation:**
- `clampedTotalCancellationCharges = min(50, 100) = 50`
- `refundAmount = 100 - 50 = 50`
- `collectedPortion = min(50 - 20, 100 - 50) = min(30, 50) = 30`
- **Settlement: $30** (only the current order's charges)

### Scenario 2: Full Refund (No Charges)
- Order total: $100
- Applied pending charges: $0
- Current cancellation charges: $0
- Total cancellation charges: $0

**Calculation:**
- `clampedTotalCancellationCharges = 0`
- `refundAmount = 100`
- `collectedPortion = min(0 - 0, 100 - 100) = 0`
- **Settlement: Skipped** (collectedPortion = 0)

### Scenario 3: Charges Exceed Order Total
- Order total: $100
- Applied pending charges: $80
- Current cancellation charges: $40
- Total cancellation charges: $120

**Calculation:**
- `clampedTotalCancellationCharges = min(120, 100) = 100`
- `refundAmount = 0`
- `collectedPortion = min(100 - 80, 100 - 0) = min(20, 100) = 20`
- **Settlement: $20** (only what was actually collected beyond pending)

### Scenario 4: Pending Charges Equal Order Total
- Order total: $100
- Applied pending charges: $100
- Current cancellation charges: $0
- Total cancellation charges: $100

**Calculation:**
- `clampedTotalCancellationCharges = 100`
- `refundAmount = 0`
- `collectedPortion = min(100 - 100, 100 - 0) = 0`
- **Settlement: Skipped** (collectedPortion = 0, nothing new collected)

## Code Location

**File**: `/backend/usersRoutes/orderRoutes.js`
**Route**: `POST /cancel`
**Lines**: ~1144-1157 (in the online payment handling section)

## Testing Recommendations

1. Test cancellation with zero pending charges
2. Test cancellation with pending charges less than order total
3. Test cancellation with pending charges equal to order total
4. Test cancellation with pending charges exceeding order total
5. Test full refund scenarios (no cancellation charges)
6. Verify wallet balances after each scenario
7. Verify only collected portions are settled
8. Verify pending charges remain pending
