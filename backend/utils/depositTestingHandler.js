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
    // Example: 1 EUR = (1 / rates.EUR) USD, then USD * rates.INR = INR
    const usdRate = 1 / rates[fromCurrency]; // How many USD for 1 unit of fromCurrency
    const inrRate = usdRate * rates.INR; // Convert that USD to INR
    
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
    
    // Check if we have a fallback rate for this currency
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
 * Handle payment and wallet credit when order is placed with online payment
 * Money goes to AdminWallet first, settlement happens when order is completed
 */
async function handleOrderPlacement(order, restaurant) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get or create admin wallet
    let adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      adminWallet = new AdminWallet();
      await adminWallet.save({ session });
    }

    // Create Payment record (simulating successful gateway payment)
    const payment = new Payment({
      userId: order.userId,
      restaurantId: order.restaurantId,
      referenceType: 'order',
      referenceId: order._id,
      original: {
        amount: order.totalAmount,
        currency: order.currency.code
      },
      expected: {
        amount: order.totalAmount,
        currency: order.currency.code,
        rate: 1,
        source: null,
        calculatedAt: new Date()
      },
      actual: {
        amount: order.totalAmount,
        currency: order.currency.code,
        gateway: 'testing',
        fees: 0,
        tax: 0,
        gatewayTransactionId: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayOrderId: `ORDER_${Date.now()}`,
        processedAt: new Date()
      },
      status: 'success'
    });

    await payment.save({ session });

    // Convert to INR if needed (for admin wallet)
    let amountInINR = order.totalAmount;
    let conversionRate = 1;
    let conversionSource = null;

    if (order.currency.code !== 'INR') {
      const exchangeData = await getExchangeRate(order.currency.code);
      conversionRate = exchangeData.rate;
      conversionSource = exchangeData.source;
      amountInINR = order.totalAmount * conversionRate;
    }

    // Credit full amount to AdminWallet (in INR)
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
      conversion: order.currency.code !== 'INR' ? {
        originalAmount: order.totalAmount,
        originalCurrency: order.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'order_payment',
      paymentId: payment._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      description: `Order payment received - Order #${order.orderNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Testing mode - Direct wallet credit'
      }
    });

    await adminTransaction.save({ session });

    // Update order with payment reference
    order.paymentId = payment._id;
    order.settlement = {
      status: 'pending',
      settledAt: null,
      restaurantAmount: null,
      adminCommissionAmount: null,
      adminCommissionInINR: null
    };
    order.paymentBreakdown = {
      receivedAmount: order.totalAmount,
      receivedCurrency: order.currency.code,
      commissionPercentage: order.adminCommission,
      commissionAmount: null,
      restaurantShare: null
    };

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      payment,
      adminTransaction
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

/**
 * Handle settlement when order status is updated to 'completed'
 * Split money between admin (commission) and restaurant (their share)
 */
async function handleOrderCompletion(order) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if already settled
    if (order.settlement?.status === 'settled') {
      throw new Error('Order already settled');
    }

    // Get payment details
    const payment = await Payment.findById(order.paymentId).session(session);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Get admin wallet
    const adminWallet = await AdminWallet.findOne().session(session);
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    // Get or create restaurant wallet
    let restaurantWallet = await RestaurantWallet.findOne({ 
      restaurantId: order.restaurantId 
    }).session(session);

    if (!restaurantWallet) {
      // Create restaurant wallet if doesn't exist
      restaurantWallet = new RestaurantWallet({
        restaurantId: order.restaurantId,
        balance: 0,
        currency: order.currency
      });
      await restaurantWallet.save({ session });
    }

    // Calculate amounts in restaurant's currency
    const receivedAmount = payment.actual.amount;
    const commissionPercentage = order.adminCommission;
    const commissionAmount = (receivedAmount * commissionPercentage) / 100;
    const restaurantShare = receivedAmount - commissionAmount;

    // Convert commission to INR if needed
    let commissionInINR = commissionAmount;
    let conversionRate = 1;
    let conversionSource = null;

    if (order.currency.code !== 'INR') {
      const exchangeData = await getExchangeRate(order.currency.code);
      conversionRate = exchangeData.rate;
      conversionSource = exchangeData.source;
      commissionInINR = commissionAmount * conversionRate;
    }

    // Convert restaurant share to INR for debit from admin wallet
    const restaurantShareInINR = order.currency.code !== 'INR' 
      ? restaurantShare * conversionRate 
      : restaurantShare;

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
      conversion: order.currency.code !== 'INR' ? {
        originalAmount: restaurantShare,
        originalCurrency: order.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'settlement',
      paymentId: payment._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      description: `Settlement to restaurant - Order #${order.orderNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Order completed - Restaurant share settled'
      }
    });

    await adminDebitTransaction.save({ session });

    // Create credit transaction for restaurant wallet
    const restaurantCreditTransaction = new WalletTransaction({
      walletId: restaurantWallet._id,
      walletType: 'RestaurantWallet',
      transactionType: 'credit',
      amount: restaurantShare,
      currency: order.currency,
      source: 'order_payment',
      paymentId: payment._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      commissionPercentage: commissionPercentage,
      commissionAmount: commissionAmount,
      description: `Order settlement received - Order #${order.orderNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Order completed - Settlement received'
      }
    });

    await restaurantCreditTransaction.save({ session });

    // Create commission transaction for admin wallet (DOES NOT AFFECT BALANCE)
    const commissionTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      affectsBalance: false,  // Commission is already part of the original credit
      amount: commissionInINR,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: order.currency.code !== 'INR' ? {
        originalAmount: commissionAmount,
        originalCurrency: order.currency.code,
        conversionRate: conversionRate,
        conversionSource: conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'commission',
      paymentId: payment._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      commissionPercentage: commissionPercentage,
      commissionAmount: commissionAmount,
      description: `Commission earned - Order #${order.orderNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Order completed - Commission tracked (does not affect balance)'
      }
    });

    await commissionTransaction.save({ session });

    // Update order settlement details
    order.settlement = {
      status: 'settled',
      settledAt: new Date(),
      restaurantAmount: restaurantShare,
      adminCommissionAmount: commissionAmount,
      adminCommissionInINR: commissionInINR
    };

    order.paymentBreakdown = {
      receivedAmount: receivedAmount,
      receivedCurrency: order.currency.code,
      commissionPercentage: commissionPercentage,
      commissionAmount: commissionAmount,
      restaurantShare: restaurantShare
    };

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      adminDebitTransaction,
      restaurantCreditTransaction,
      commissionTransaction,
      settlement: {
        restaurantShare,
        commissionAmount,
        commissionInINR
      }
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

module.exports = {
  handleOrderPlacement,
  handleOrderCompletion
};