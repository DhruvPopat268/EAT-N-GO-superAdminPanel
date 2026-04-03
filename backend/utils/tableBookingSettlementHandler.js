const Payment = require('../models/Payment');
const AdminWallet = require('../models/AdminWallet');
const RestaurantWallet = require('../restaurantModels/RestaurantWallet');
const WalletTransaction = require('../models/WalletTransaction');
const mongoose = require('mongoose');
const axios = require('axios');

/**
 * Get real-time exchange rates from API
 * Converts any currency to INR
 */
async function getExchangeRate(fromCurrency) {
  try {
    if (fromCurrency === 'INR') {
      console.log(`Exchange rate for ${fromCurrency}: Using 1:1 (same currency)`);
      return { rate: 1, source: null };
    }

    // Get rates with USD as base (with 5 second timeout)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000
    });
    
    const rates = response.data?.rates;
    
    // Validate rates data exists
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid rates data received from API');
    }
    
    // Validate fromCurrency rate exists and is valid
    if (!rates[fromCurrency] || rates[fromCurrency] <= 0) {
      throw new Error(`Exchange rate for ${fromCurrency} not found or invalid in API response`);
    }
    
    // Validate INR rate exists and is valid
    if (!rates.INR || rates.INR <= 0) {
      throw new Error('INR exchange rate not found or invalid in API response');
    }

    // Convert: fromCurrency -> USD -> INR
    const usdRate = 1 / rates[fromCurrency];
    const inrRate = usdRate * rates.INR;
    
    console.log(`Exchange rate for ${fromCurrency}: ${inrRate} INR (source: API)`);

    return {
      rate: inrRate,
      source: 'exchangerate-api.com'
    };
  } catch (error) {
    console.error(`Exchange rate API error for ${fromCurrency}:`, error.message);
    
    // Fallback to fixed rates if API fails
    const fallbackRates = {
      'USD': 83.0,
      'EUR': 90.0,
      'GBP': 105.0,
      'AED': 22.6
    };
    
    if (!fallbackRates[fromCurrency]) {
      console.error(`No fallback rate available for ${fromCurrency}`);
      throw new Error(`Unable to get exchange rate for ${fromCurrency}. API failed and no fallback rate available.`);
    }
    
    console.log(`Exchange rate for ${fromCurrency}: ${fallbackRates[fromCurrency]} INR (source: fallback)`);
    
    return {
      rate: fallbackRates[fromCurrency],
      source: 'fallback-fixed-rate'
    };
  }
}

/**
 * 1. Handle cover charge payment - Credit to AdminWallet
 * Called after cover charge payment is successful
 * Note: This function does NOT manage transactions - caller must handle session
 */
async function handleCoverChargePayment(tableBooking, payment, session) {
  try {
    // Get or create admin wallet
    let adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      adminWallet = new AdminWallet();
      await adminWallet.save({ session });
    }

    // Convert to INR if needed (for admin wallet)
    let amountInINR = tableBooking.coverCharges;
    let conversionRate = 1;
    let conversionSource = null;

    if (tableBooking.currency.code !== 'INR') {
      const exchangeData = await getExchangeRate(tableBooking.currency.code);
      conversionRate = exchangeData.rate;
      conversionSource = exchangeData.source;
      amountInINR = tableBooking.coverCharges * conversionRate;
    }

    // Update payment with locked-in exchange rate
    payment.expected.rate = conversionRate;
    payment.expected.source = conversionSource;
    await payment.save({ session });

    // Credit cover charge to AdminWallet (in INR)
    adminWallet.balance += amountInINR;
    adminWallet.totalCredits += amountInINR;
    await adminWallet.save({ session });

    // Create wallet transaction for admin wallet
    const adminTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      amount: amountInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: tableBooking.currency.code !== 'INR' ? {
        originalAmount: tableBooking.coverCharges,
        originalCurrency: tableBooking.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'table_booking_cover_charge_payment',
      paymentId: payment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      description: `Cover charge payment - Booking #${tableBooking.tableBookingNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Testing mode - Cover charge payment'
      }
    });

    await adminTransaction.save({ session });

    return {
      success: true,
      adminTransaction,
      amountInINR
    };

  } catch (error) {
    throw error;
  }
}

/**
 * 2. Handle final bill payment and settlement
 * Called after final bill is paid
 * Note: This function does NOT manage transactions - caller must handle session
 */
async function handleFinalBillPayment(tableBooking, payment, session) {
  try {
    // Get admin wallet
    const adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    // Get or create restaurant wallet
    let restaurantWallet = await RestaurantWallet.findOne({ 
      restaurantId: tableBooking.restaurantId 
    }).session(session);

    if (!restaurantWallet) {
      restaurantWallet = new RestaurantWallet({
        restaurantId: tableBooking.restaurantId,
        balance: 0,
        currency: tableBooking.currency
      });
      await restaurantWallet.save({ session });
    }

    // Get cover charge payment to use locked-in exchange rate
    const coverChargePayment = await Payment.findById(tableBooking.coverChargePaymentId).session(session);
    let conversionRate = coverChargePayment?.expected?.rate || 1;
    let conversionSource = coverChargePayment?.expected?.source || null;

    // If no cover charge payment or rate not found, get new rate
    if (!conversionRate || conversionRate === 1) {
      if (tableBooking.currency.code !== 'INR') {
        const exchangeData = await getExchangeRate(tableBooking.currency.code);
        conversionRate = exchangeData.rate;
        conversionSource = exchangeData.source;
      }
    }

    // Update final bill payment with exchange rate
    payment.expected.rate = conversionRate;
    payment.expected.source = conversionSource;
    await payment.save({ session });

    // Convert final bill payment to INR for admin wallet
    const finalBillPaymentInINR = tableBooking.currency.code !== 'INR' 
      ? payment.actual.amount * conversionRate 
      : payment.actual.amount;

    // Credit final bill payment to AdminWallet (in INR)
    adminWallet.balance += finalBillPaymentInINR;
    adminWallet.totalCredits += finalBillPaymentInINR;
    await adminWallet.save({ session });

    // Create wallet transaction for final bill payment
    const adminFinalBillTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      amount: finalBillPaymentInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: tableBooking.currency.code !== 'INR' ? {
        originalAmount: payment.actual.amount,
        originalCurrency: tableBooking.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'table_booking_final_bill_payment',
      paymentId: payment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      description: `Final bill payment - Booking #${tableBooking.tableBookingNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Testing mode - Final bill payment'
      }
    });

    await adminFinalBillTransaction.save({ session });

    // Now calculate settlement (Industry standard: Zomato/Swiggy model)
    const originalFinalBill = tableBooking.finalBillPaidBreakdown.originalFinalBill;
    const restaurantDiscount = tableBooking.finalBillPaidBreakdown.restaurantDiscount;

    // Restaurant revenue base (after their discount)
    const restaurantRevenueBase = originalFinalBill - restaurantDiscount;

    // Calculate admin commission on restaurant revenue base
    const commissionPercentage = tableBooking.adminCommission;
    const commissionAmount = (restaurantRevenueBase * commissionPercentage) / 100;

    // Calculate admin discount on restaurant revenue base (industry standard)
    const adminDiscountPercentage = tableBooking.offer?.adminOfferPercentageOnBill || 0;
    const adminDiscount = (restaurantRevenueBase * adminDiscountPercentage) / 100;

    // Restaurant's share = Revenue base - Admin commission
    // Restaurant gets their full share regardless of admin discount
    const restaurantShare = restaurantRevenueBase - commissionAmount;

    // Admin's net earnings = commission - admin discount given to user
    // Admin absorbs the cost of discount given to user
    const adminNetEarnings = commissionAmount - adminDiscount;

    // Total collected from user (cover charge + final bill payment)
    const coverChargeAmount = tableBooking.coverCharges;
    const finalBillPaymentAmount = payment.actual.amount;
    const totalCollected = coverChargeAmount + finalBillPaymentAmount;

    // Convert amounts to INR for admin wallet operations
    const restaurantShareInINR = tableBooking.currency.code !== 'INR' 
      ? restaurantShare * conversionRate 
      : restaurantShare;

    const adminNetEarningsInINR = tableBooking.currency.code !== 'INR' 
      ? adminNetEarnings * conversionRate 
      : adminNetEarnings;

    const commissionAmountInINR = tableBooking.currency.code !== 'INR' 
      ? commissionAmount * conversionRate 
      : commissionAmount;

    // Debit restaurant share from AdminWallet (in INR)
    if (adminWallet.balance < restaurantShareInINR) {
      throw new Error('Insufficient balance in admin wallet');
    }

    adminWallet.balance -= restaurantShareInINR;
    adminWallet.totalDebits += restaurantShareInINR;
    await adminWallet.save({ session });

    // Credit restaurant share to RestaurantWallet (in restaurant's currency)
    restaurantWallet.balance += restaurantShare;
    restaurantWallet.totalEarnings += restaurantShare;
    await restaurantWallet.save({ session });

    // Create debit transaction for admin wallet
    const adminDebitTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'debit',
      amount: restaurantShareInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: tableBooking.currency.code !== 'INR' ? {
        originalAmount: restaurantShare,
        originalCurrency: tableBooking.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'settlement',
      paymentId: payment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      description: `Settlement to restaurant - Booking #${tableBooking.tableBookingNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Final bill settlement'
      }
    });

    await adminDebitTransaction.save({ session });

    // Create credit transaction for restaurant wallet
    const restaurantCreditTransaction = new WalletTransaction({
      walletId: restaurantWallet._id,
      walletType: 'RestaurantWallet',
      transactionType: 'credit',
      amount: restaurantShare,
      currency: tableBooking.currency,
      source: 'settlement',
      paymentId: payment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      description: `Final bill settlement - Booking #${tableBooking.tableBookingNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Restaurant share from final bill'
      }
    });

    await restaurantCreditTransaction.save({ session });

    // Create commission transaction for admin wallet (tracking only, doesn't affect balance)
    const adminCommissionTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      affectsBalance: false,
      amount: adminNetEarningsInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: tableBooking.currency.code !== 'INR' ? {
        originalAmount: adminNetEarnings,
        originalCurrency: tableBooking.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'commission',
      paymentId: payment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      commissionPercentage: commissionPercentage,
      commissionAmount: adminNetEarnings,
      description: `Commission earned - Booking #${tableBooking.tableBookingNo} (Revenue: ₹${restaurantRevenueBase.toFixed(2)}, Commission: ₹${commissionAmount.toFixed(2)} @ ${commissionPercentage}%, Admin discount: ₹${adminDiscount.toFixed(2)}, Net: ₹${adminNetEarnings.toFixed(2)})`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Admin commission from table booking',
        breakdown: {
          restaurantRevenueBase: restaurantRevenueBase,
          commissionAmount: commissionAmount,
          adminDiscount: adminDiscount,
          netEarnings: adminNetEarnings
        }
      }
    });

    await adminCommissionTransaction.save({ session });

    // Update table booking settlement status
    tableBooking.settlement = {
      status: 'settled',
      settledAt: new Date(),
      restaurantAmount: restaurantShare,
      adminCommissionAmount: adminNetEarnings,
      adminCommissionInINR: adminNetEarningsInINR
    };

    tableBooking.paymentBreakdown = {
      receivedAmount: totalCollected,
      receivedCurrency: tableBooking.currency.code,
      commissionPercentage: commissionPercentage,
      commissionAmount: commissionAmount,
      restaurantShare: restaurantShare
    };

    // Update final bill paid breakdown with corrected admin discount
    tableBooking.finalBillPaidBreakdown.adminDiscount = adminDiscount;

    // Update cover charge status to redeemed
    tableBooking.coverChargePaymentStatus = 'redeemed';

    return {
      success: true,
      settlement: {
        restaurantShare,
        restaurantShareInINR,
        commissionAmount,
        commissionAmountInINR,
        adminDiscount,
        adminNetEarnings,
        adminNetEarningsInINR,
        totalCollected,
        breakdown: {
          originalFinalBill,
          restaurantDiscount,
          restaurantRevenueBase,
          commissionPercentage,
          adminDiscountPercentage
        }
      }
    };

  } catch (error) {
    throw error;
  }
}

/**
 * 3A. Handle restaurant cancellation - Always full refund
 * Reverse the cover charge transaction and refund to user
 * Note: This function does NOT manage transactions - caller must handle session
 */
async function handleRestaurantCancellation(tableBooking, session) {
  try {
    const coverChargePayment = await Payment.findById(tableBooking.coverChargePaymentId).session(session);
    if (!coverChargePayment) {
      throw new Error('Cover charge payment not found');
    }

    const adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    // Get the original cover charge transaction
    const originalTransaction = await WalletTransaction.findOne({
      paymentId: coverChargePayment._id,
      source: 'table_booking_cover_charge_payment',
      walletType: 'AdminWallet'
    }).session(session);

    if (!originalTransaction) {
      throw new Error('Original cover charge transaction not found');
    }

    // Get the amount in INR from original transaction
    const refundAmountInINR = originalTransaction.amount;

    // Check if admin wallet has sufficient balance
    if (adminWallet.balance < refundAmountInINR) {
      throw new Error('Insufficient balance in admin wallet for refund');
    }

    // Debit refund amount from AdminWallet
    adminWallet.balance -= refundAmountInINR;
    adminWallet.totalDebits += refundAmountInINR;
    await adminWallet.save({ session });

    // Create refund transaction
    const refundTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'debit',
      amount: refundAmountInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: originalTransaction.conversion,
      source: 'refund',
      paymentId: coverChargePayment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      description: `Cover charge refund - Booking #${tableBooking.tableBookingNo} (Restaurant cancelled)`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Restaurant cancellation - Full refund',
        reversedTransactionId: originalTransaction._id
      }
    });

    await refundTransaction.save({ session });

    // Update original transaction status to reversed
    originalTransaction.status = 'reversed';
    await originalTransaction.save({ session });

    // Update payment status to refunded
    coverChargePayment.status = 'refunded';
    coverChargePayment.refund = {
      amount: tableBooking.coverCharges,
      currency: tableBooking.currency.code,
      reason: 'Booking cancelled by restaurant',
      refundedAt: new Date(),
      gatewayRefundId: `REFUND_${Date.now()}`
    };
    await coverChargePayment.save({ session });

    return {
      success: true,
      refundAmount: tableBooking.coverCharges,
      refundAmountInINR
    };

  } catch (error) {
    throw error;
  }
}

/**
 * 3B. Handle user cancellation - Conditional refund based on buffer time
 * If refundable: Reverse the cover charge transaction
 * If not refundable: Split cover charges between admin and restaurant
 * Note: This function does NOT manage transactions - caller must handle session
 */
async function handleUserCancellation(tableBooking, coverChargesRefundable, session) {
  try {
    // If not refundable, split the cover charges between admin and restaurant
    if (!coverChargesRefundable) {
      const coverChargePayment = await Payment.findById(tableBooking.coverChargePaymentId).session(session);
      if (!coverChargePayment) {
        throw new Error('Cover charge payment not found');
      }

      const adminWallet = await AdminWallet.findOne().session(session);
      if (!adminWallet) {
        throw new Error('Admin wallet not found');
      }

      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findById(tableBooking.restaurantId).session(session);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      let restaurantWallet = await RestaurantWallet.findOne({ 
        restaurantId: tableBooking.restaurantId 
      }).session(session);

      if (!restaurantWallet) {
        restaurantWallet = new RestaurantWallet({
          restaurantId: tableBooking.restaurantId,
          balance: 0,
          currency: tableBooking.currency
        });
        await restaurantWallet.save({ session });
      }

      // Get nonRefundSplit from restaurant config
      const restaurantSplit = restaurant.tableReservationBookingConfig?.nonRefundSplit?.restaurant ?? 50;
      const adminSplit = restaurant.tableReservationBookingConfig?.nonRefundSplit?.admin ?? 50;

      // Calculate split amounts
      const coverChargeAmount = tableBooking.coverCharges;
      const restaurantShare = (coverChargeAmount * restaurantSplit) / 100;
      const adminShare = (coverChargeAmount * adminSplit) / 100;

      // Get the original cover charge transaction for conversion rate
      const originalTransaction = await WalletTransaction.findOne({
        paymentId: coverChargePayment._id,
        source: 'table_booking_cover_charge_payment',
        walletType: 'AdminWallet'
      }).session(session);

      if (!originalTransaction) {
        throw new Error('Original cover charge transaction not found');
      }

      // Use the conversion rate from original transaction
      let conversionRate = 1;
      let conversionSource = null;
      if (originalTransaction.conversion) {
        conversionRate = originalTransaction.conversion.conversionRate;
        conversionSource = originalTransaction.conversion.conversionSource;
      }

      const restaurantShareInINR = tableBooking.currency.code !== 'INR' 
        ? restaurantShare * conversionRate 
        : restaurantShare;

      const adminShareInINR = tableBooking.currency.code !== 'INR' 
        ? adminShare * conversionRate 
        : adminShare;

      // Debit restaurant share from AdminWallet
      if (adminWallet.balance < restaurantShareInINR) {
        throw new Error('Insufficient balance in admin wallet for restaurant share');
      }

      adminWallet.balance -= restaurantShareInINR;
      adminWallet.totalDebits += restaurantShareInINR;
      await adminWallet.save({ session });

      // Credit restaurant share to RestaurantWallet
      restaurantWallet.balance += restaurantShare;
      restaurantWallet.totalEarnings += restaurantShare;
      await restaurantWallet.save({ session });

      // Create debit transaction for admin wallet
      const adminDebitTransaction = new WalletTransaction({
        walletId: adminWallet._id,
        walletType: 'AdminWallet',
        transactionType: 'debit',
        amount: restaurantShareInINR,
        currency: {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹'
        },
        conversion: tableBooking.currency.code !== 'INR' ? {
          originalAmount: restaurantShare,
          originalCurrency: tableBooking.currency.code,
          conversionRate: conversionRate,
          conversionSource: conversionSource,
          convertedAt: new Date()
        } : undefined,
        source: 'settlement',
        paymentId: coverChargePayment._id,
        tableBookingId: tableBooking._id,
        restaurantId: tableBooking.restaurantId,
        description: `Non-refundable cover charge split - Booking #${tableBooking.tableBookingNo} (User cancelled)`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: `Restaurant share (${restaurantSplit}%) of non-refundable cover charges`
        }
      });

      await adminDebitTransaction.save({ session });

      // Create credit transaction for restaurant wallet
      const restaurantCreditTransaction = new WalletTransaction({
        walletId: restaurantWallet._id,
        walletType: 'RestaurantWallet',
        transactionType: 'credit',
        amount: restaurantShare,
        currency: tableBooking.currency,
        source: 'settlement',
        paymentId: coverChargePayment._id,
        tableBookingId: tableBooking._id,
        restaurantId: tableBooking.restaurantId,
        description: `Non-refundable cover charge received - Booking #${tableBooking.tableBookingNo}`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: `Restaurant share (${restaurantSplit}%) of non-refundable cover charges`
        }
      });

      await restaurantCreditTransaction.save({ session });

      // Create commission transaction for admin wallet (tracking only)
      const adminCommissionTransaction = new WalletTransaction({
        walletId: adminWallet._id,
        walletType: 'AdminWallet',
        transactionType: 'credit',
        affectsBalance: false,
        amount: adminShareInINR,
        currency: {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹'
        },
        conversion: tableBooking.currency.code !== 'INR' ? {
          originalAmount: adminShare,
          originalCurrency: tableBooking.currency.code,
          conversionRate: conversionRate,
          conversionSource: conversionSource,
          convertedAt: new Date()
        } : undefined,
        source: 'commission',
        paymentId: coverChargePayment._id,
        tableBookingId: tableBooking._id,
        restaurantId: tableBooking.restaurantId,
        commissionPercentage: adminSplit,
        commissionAmount: adminShare,
        description: `Non-refundable cover charge split - Booking #${tableBooking.tableBookingNo}`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: `Admin share (${adminSplit}%) of non-refundable cover charges`
        }
      });

      await adminCommissionTransaction.save({ session });

      return {
        success: true,
        refundAmount: 0,
        refundAmountInINR: 0,
        split: {
          restaurantShare,
          adminShare,
          restaurantSplitPercentage: restaurantSplit,
          adminSplitPercentage: adminSplit
        },
        message: 'No refund - Cover charges split between admin and restaurant'
      };
    }

    // If refundable, same logic as restaurant cancellation
    const coverChargePayment = await Payment.findById(tableBooking.coverChargePaymentId).session(session);
    if (!coverChargePayment) {
      throw new Error('Cover charge payment not found');
    }

    const adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    // Get the original cover charge transaction
    const originalTransaction = await WalletTransaction.findOne({
      paymentId: coverChargePayment._id,
      source: 'table_booking_cover_charge_payment',
      walletType: 'AdminWallet'
    }).session(session);

    if (!originalTransaction) {
      throw new Error('Original cover charge transaction not found');
    }

    // Get the amount in INR from original transaction
    const refundAmountInINR = originalTransaction.amount;

    // Check if admin wallet has sufficient balance
    if (adminWallet.balance < refundAmountInINR) {
      throw new Error('Insufficient balance in admin wallet for refund');
    }

    // Debit refund amount from AdminWallet
    adminWallet.balance -= refundAmountInINR;
    adminWallet.totalDebits += refundAmountInINR;
    await adminWallet.save({ session });

    // Create refund transaction
    const refundTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'debit',
      amount: refundAmountInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: originalTransaction.conversion,
      source: 'refund',
      paymentId: coverChargePayment._id,
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      description: `Cover charge refund - Booking #${tableBooking.tableBookingNo} (User cancelled)`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'User cancellation - Full refund (sufficient buffer time)',
        reversedTransactionId: originalTransaction._id
      }
    });

    await refundTransaction.save({ session });

    // Update original transaction status to reversed
    originalTransaction.status = 'reversed';
    await originalTransaction.save({ session });

    // Update payment status to refunded
    coverChargePayment.status = 'refunded';
    coverChargePayment.refund = {
      amount: tableBooking.coverCharges,
      currency: tableBooking.currency.code,
      reason: 'Booking cancelled by user',
      refundedAt: new Date(),
      gatewayRefundId: `REFUND_${Date.now()}`
    };
    await coverChargePayment.save({ session });

    return {
      success: true,
      refundAmount: tableBooking.coverCharges,
      refundAmountInINR
    };

  } catch (error) {
    throw error;
  }
}

/**
 * 4. Handle restaurant collected payment (pay at restaurant)
 * Deduct commission from restaurant wallet and credit to admin wallet
 * Split cover charges between restaurant and admin (no refund)
 * Note: This function does NOT manage transactions - caller must handle session
 */
async function handleRestaurantCollectedPayment(tableBooking, finalBillAmount, session) {
  try {
    // Get admin wallet
    const adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    // Get restaurant for nonRefundSplit config
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(tableBooking.restaurantId).session(session);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Get or create restaurant wallet
    let restaurantWallet = await RestaurantWallet.findOne({ 
      restaurantId: tableBooking.restaurantId 
    }).session(session);

    if (!restaurantWallet) {
      restaurantWallet = new RestaurantWallet({
        restaurantId: tableBooking.restaurantId,
        balance: 0,
        currency: tableBooking.currency
      });
      await restaurantWallet.save({ session });
    }

    // No offer discounts - offers only apply for app payments
    const originalFinalBill = finalBillAmount;

    // Calculate admin commission on full final bill amount
    const commissionPercentage = tableBooking.adminCommission;
    const adminCommissionFromBill = (originalFinalBill * commissionPercentage) / 100;

    // Handle cover charge split if it was paid
    let coverChargeSplit = { restaurantShare: 0, adminShare: 0 };
    let conversionRate = 1;
    let conversionSource = null;

    if (tableBooking.coverChargePaymentStatus === 'paid') {
      // Get cover charge payment
      const coverChargePayment = await Payment.findById(tableBooking.coverChargePaymentId).session(session);
      if (coverChargePayment) {
        // Get the original cover charge transaction for conversion rate
        const originalCoverChargeTransaction = await WalletTransaction.findOne({
          paymentId: coverChargePayment._id,
          source: 'table_booking_cover_charge_payment',
          walletType: 'AdminWallet'
        }).session(session);

        if (originalCoverChargeTransaction) {
          // Get conversion rate from original transaction
          if (originalCoverChargeTransaction.conversion) {
            conversionRate = originalCoverChargeTransaction.conversion.conversionRate;
            conversionSource = originalCoverChargeTransaction.conversion.conversionSource;
          }

          // Get split percentages from restaurant config
          const restaurantSplitPercentage = restaurant.tableReservationBookingConfig?.nonRefundSplit?.restaurant ?? 50;
          const adminSplitPercentage = restaurant.tableReservationBookingConfig?.nonRefundSplit?.admin ?? 50;

          // Calculate split amounts
          const coverChargeAmount = tableBooking.coverCharges;
          coverChargeSplit.restaurantShare = (coverChargeAmount * restaurantSplitPercentage) / 100;
          coverChargeSplit.adminShare = (coverChargeAmount * adminSplitPercentage) / 100;

          const restaurantShareInINR = tableBooking.currency.code !== 'INR' 
            ? coverChargeSplit.restaurantShare * conversionRate 
            : coverChargeSplit.restaurantShare;

          const adminShareInINR = tableBooking.currency.code !== 'INR' 
            ? coverChargeSplit.adminShare * conversionRate 
            : coverChargeSplit.adminShare;

          // Debit restaurant share from AdminWallet
          if (adminWallet.balance < restaurantShareInINR) {
            throw new Error('Insufficient balance in admin wallet for restaurant share of cover charge');
          }

          adminWallet.balance -= restaurantShareInINR;
          adminWallet.totalDebits += restaurantShareInINR;
          await adminWallet.save({ session });

          // Credit restaurant share to RestaurantWallet
          restaurantWallet.balance += coverChargeSplit.restaurantShare;
          restaurantWallet.totalEarnings += coverChargeSplit.restaurantShare;
          await restaurantWallet.save({ session });

          // Create debit transaction for admin wallet (restaurant's share)
          const adminDebitTransaction = new WalletTransaction({
            walletId: adminWallet._id,
            walletType: 'AdminWallet',
            transactionType: 'debit',
            amount: restaurantShareInINR,
            currency: {
              code: 'INR',
              name: 'Indian Rupee',
              symbol: '₹'
            },
            conversion: tableBooking.currency.code !== 'INR' ? {
              originalAmount: coverChargeSplit.restaurantShare,
              originalCurrency: tableBooking.currency.code,
              conversionRate: conversionRate,
              conversionSource: conversionSource,
              convertedAt: new Date()
            } : undefined,
            source: 'settlement',
            paymentId: coverChargePayment._id,
            tableBookingId: tableBooking._id,
            restaurantId: tableBooking.restaurantId,
            description: `Cover charge split to restaurant - Booking #${tableBooking.tableBookingNo} (Paid at restaurant)`,
            status: 'completed',
            metadata: {
              initiatedBy: 'system',
              notes: `Restaurant share (${restaurantSplitPercentage}%) of cover charge - payment collected at restaurant`
            }
          });

          await adminDebitTransaction.save({ session });

          // Create credit transaction for restaurant wallet
          const restaurantCreditTransaction = new WalletTransaction({
            walletId: restaurantWallet._id,
            walletType: 'RestaurantWallet',
            transactionType: 'credit',
            amount: coverChargeSplit.restaurantShare,
            currency: tableBooking.currency,
            source: 'settlement',
            paymentId: coverChargePayment._id,
            tableBookingId: tableBooking._id,
            restaurantId: tableBooking.restaurantId,
            description: `Cover charge split received - Booking #${tableBooking.tableBookingNo}`,
            status: 'completed',
            metadata: {
              initiatedBy: 'system',
              notes: `Restaurant share (${restaurantSplitPercentage}%) of cover charge - payment collected at restaurant`
            }
          });

          await restaurantCreditTransaction.save({ session });

          // Create commission transaction for admin wallet (tracking only)
          const adminCommissionFromCoverCharge = new WalletTransaction({
            walletId: adminWallet._id,
            walletType: 'AdminWallet',
            transactionType: 'credit',
            affectsBalance: false,
            amount: adminShareInINR,
            currency: {
              code: 'INR',
              name: 'Indian Rupee',
              symbol: '₹'
            },
            conversion: tableBooking.currency.code !== 'INR' ? {
              originalAmount: coverChargeSplit.adminShare,
              originalCurrency: tableBooking.currency.code,
              conversionRate: conversionRate,
              conversionSource: conversionSource,
              convertedAt: new Date()
            } : undefined,
            source: 'commission',
            paymentId: coverChargePayment._id,
            tableBookingId: tableBooking._id,
            restaurantId: tableBooking.restaurantId,
            commissionPercentage: adminSplitPercentage,
            commissionAmount: coverChargeSplit.adminShare,
            description: `Cover charge split - Booking #${tableBooking.tableBookingNo}`,
            status: 'completed',
            metadata: {
              initiatedBy: 'system',
              notes: `Admin share (${adminSplitPercentage}%) of cover charge - payment collected at restaurant`
            }
          });

          await adminCommissionFromCoverCharge.save({ session });

          // Update table booking cover charge status
          tableBooking.coverChargePaymentStatus = 'redeemed';
        }
      }
    }

    // Get exchange rate if not already set from cover charge
    if (conversionRate === 1 && tableBooking.currency.code !== 'INR') {
      const exchangeData = await getExchangeRate(tableBooking.currency.code);
      conversionRate = exchangeData.rate;
      conversionSource = exchangeData.source;
    }

    // Convert commission to INR for admin wallet
    const adminCommissionFromBillInINR = tableBooking.currency.code !== 'INR' 
      ? adminCommissionFromBill * conversionRate 
      : adminCommissionFromBill;

    // Deduct admin commission from RestaurantWallet (can go negative - represents debt)
    restaurantWallet.balance -= adminCommissionFromBill;
    await restaurantWallet.save({ session });

    // Credit admin commission to AdminWallet (in INR)
    adminWallet.balance += adminCommissionFromBillInINR;
    adminWallet.totalCredits += adminCommissionFromBillInINR;
    await adminWallet.save({ session });

    // Create debit transaction for restaurant wallet
    const restaurantDebitTransaction = new WalletTransaction({
      walletId: restaurantWallet._id,
      walletType: 'RestaurantWallet',
      transactionType: 'debit',
      amount: adminCommissionFromBill,
      currency: tableBooking.currency,
      source: 'commission',
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      commissionPercentage: commissionPercentage,
      commissionAmount: adminCommissionFromBill,
      description: `Commission deducted - Booking #${tableBooking.tableBookingNo} (Collected at restaurant)`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: `Admin commission on final bill collected at restaurant`
      }
    });

    await restaurantDebitTransaction.save({ session });

    // Create credit transaction for admin wallet
    const adminCreditTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      amount: adminCommissionFromBillInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: tableBooking.currency.code !== 'INR' ? {
        originalAmount: adminCommissionFromBill,
        originalCurrency: tableBooking.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'commission',
      tableBookingId: tableBooking._id,
      restaurantId: tableBooking.restaurantId,
      commissionPercentage: commissionPercentage,
      commissionAmount: adminCommissionFromBill,
      description: `Commission received - Booking #${tableBooking.tableBookingNo} (Collected at restaurant)`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: `Admin commission on final bill collected at restaurant`
      }
    });

    await adminCreditTransaction.save({ session });

    // Calculate total admin earnings (commission from bill + admin share of cover charge)
    const totalAdminEarnings = adminCommissionFromBill + coverChargeSplit.adminShare;
    const totalAdminEarningsInINR = adminCommissionFromBillInINR + (tableBooking.currency.code !== 'INR' 
      ? coverChargeSplit.adminShare * conversionRate 
      : coverChargeSplit.adminShare);

    // Calculate restaurant share (final bill - commission + restaurant share of cover charge)
    const restaurantShare = originalFinalBill - adminCommissionFromBill + coverChargeSplit.restaurantShare;

    // Update table booking settlement status
    tableBooking.settlement = {
      status: 'settled',
      settledAt: new Date(),
      restaurantAmount: restaurantShare,
      adminCommissionAmount: totalAdminEarnings,
      adminCommissionInINR: totalAdminEarningsInINR
    };

    tableBooking.paymentBreakdown = {
      receivedAmount: originalFinalBill,
      receivedCurrency: tableBooking.currency.code,
      commissionPercentage: commissionPercentage,
      commissionAmount: totalAdminEarnings,
      restaurantShare: restaurantShare,
      coverChargeSplit: coverChargeSplit
    };

    tableBooking.restaurantCollectedFinalBill = originalFinalBill;

    return {
      success: true,
      settlement: {
        restaurantShare,
        adminCommissionFromBill,
        coverChargeSplit,
        totalAdminEarnings,
        totalAdminEarningsInINR
      }
    };

  } catch (error) {
    throw error;
  }
}

module.exports = {
  handleCoverChargePayment,
  handleFinalBillPayment,
  handleRestaurantCancellation,
  handleUserCancellation,
  handleRestaurantCollectedPayment
};
