const Payment = require('../models/Payment');
const AdminWallet = require('../models/AdminWallet');
const RestaurantWallet = require('../restaurantModels/RestaurantWallet');
const WalletTransaction = require('../models/WalletTransaction');
const Restaurant = require('../models/Restaurant');
const axios = require('axios');

/**
 * Get exchange rate (reuse from depositTestingHandler)
 */
async function getExchangeRate(fromCurrency) {
  try {
    if (fromCurrency === 'INR') {
      return { rate: 1, source: null };
    }

    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000
    });
    
    const rates = response.data?.rates;
    
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid rates data received from API');
    }
    
    if (!rates[fromCurrency] || rates[fromCurrency] <= 0) {
      throw new Error(`Exchange rate for ${fromCurrency} not found or invalid`);
    }
    
    if (!rates.INR || rates.INR <= 0) {
      throw new Error('INR exchange rate not found or invalid');
    }

    const usdRate = 1 / rates[fromCurrency];
    const inrRate = usdRate * rates.INR;

    return {
      rate: inrRate,
      source: 'exchangerate-api.com'
    };
  } catch (error) {
    const fallbackRates = {
      'USD': 83.0,
      'EUR': 90.0,
      'GBP': 105.0,
      'AED': 22.6
    };
    
    if (!fallbackRates[fromCurrency]) {
      throw new Error(`Unable to get exchange rate for ${fromCurrency}`);
    }
    
    return {
      rate: fallbackRates[fromCurrency],
      source: 'fallback-fixed-rate'
    };
  }
}

/**
 * Handle restaurant cancellation settlement for online payment orders
 */
async function handleRestaurantCancellationOnline(order, refundAmount, appliedPendingCharges) {
  try {
    const payment = await Payment.findById(order.paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    const adminWallet = await AdminWallet.findOne();
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    let restaurantWallet = await RestaurantWallet.findOne({ restaurantId: order.restaurantId });
    if (!restaurantWallet) {
      restaurantWallet = new RestaurantWallet({
        restaurantId: order.restaurantId,
        balance: 0,
        currency: order.currency
      });
      await restaurantWallet.save();
    }

    // Get nonRefundSplit from restaurant
    const restaurantSplit = restaurant.tableReservationBookingConfig?.nonRefundSplit?.restaurant || 50;
    const adminSplit = restaurant.tableReservationBookingConfig?.nonRefundSplit?.admin || 50;

    // Calculate cancellation charges (amount kept, not refunded)
    const cancellationCharges = appliedPendingCharges;

    // Split cancellation charges
    const restaurantShare = (cancellationCharges * restaurantSplit) / 100;
    const adminShare = (cancellationCharges * adminSplit) / 100;

    // Convert amounts to INR for admin wallet
    let conversionRate = 1;
    let conversionSource = null;
    if (order.currency.code !== 'INR') {
      const exchangeData = await getExchangeRate(order.currency.code);
      conversionRate = exchangeData.rate;
      conversionSource = exchangeData.source;
    }

    const refundAmountInINR = refundAmount * conversionRate;
    const restaurantShareInINR = restaurantShare * conversionRate;

    // 1. Debit refund amount from AdminWallet
    if (refundAmount > 0) {
      if (adminWallet.balance < refundAmountInINR) {
        throw new Error('Insufficient balance in admin wallet for refund');
      }

      adminWallet.balance -= refundAmountInINR;
      adminWallet.totalDebits += refundAmountInINR;
      await adminWallet.save();

      // Create refund transaction for admin wallet
      const adminRefundTransaction = new WalletTransaction({
        walletId: adminWallet._id,
        walletType: 'AdminWallet',
        transactionType: 'debit',
        amount: refundAmountInINR,
        currency: {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹'
        },
        conversion: order.currency.code !== 'INR' ? {
          originalAmount: refundAmount,
          originalCurrency: order.currency.code,
          conversionRate,
          conversionSource,
          convertedAt: new Date()
        } : undefined,
        source: 'refund',
        paymentId: payment._id,
        orderId: order._id,
        restaurantId: order.restaurantId,
        description: `Refund to user - Order #${order.orderNo} (Restaurant cancelled)`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: 'Restaurant cancellation refund'
        }
      });
      await adminRefundTransaction.save();
    }

    // 2. Credit admin commission (affectsBalance: false)
    const adminCommissionTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      affectsBalance: false,
      amount: adminShare * conversionRate,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: order.currency.code !== 'INR' ? {
        originalAmount: adminShare,
        originalCurrency: order.currency.code,
        conversionRate,
        conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'commission',
      paymentId: payment._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      commissionPercentage: adminSplit,
      commissionAmount: adminShare,
      description: `Cancellation charges split - Order #${order.orderNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Admin share of cancellation charges (restaurant cancelled)'
      }
    });
    await adminCommissionTransaction.save();

    // 3. Debit restaurant share from AdminWallet and credit to RestaurantWallet
    if (restaurantShare > 0) {
      if (adminWallet.balance < restaurantShareInINR) {
        throw new Error('Insufficient balance in admin wallet for restaurant share');
      }

      adminWallet.balance -= restaurantShareInINR;
      adminWallet.totalDebits += restaurantShareInINR;
      await adminWallet.save();

      // Debit from admin wallet
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
          conversionRate,
          conversionSource,
          convertedAt: new Date()
        } : undefined,
        source: 'settlement',
        paymentId: payment._id,
        orderId: order._id,
        restaurantId: order.restaurantId,
        description: `Cancellation charges to restaurant - Order #${order.orderNo}`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: 'Restaurant share of cancellation charges'
        }
      });
      await adminDebitTransaction.save();

      // Credit to restaurant wallet
      restaurantWallet.balance += restaurantShare;
      restaurantWallet.totalEarnings += restaurantShare;
      await restaurantWallet.save();

      const restaurantCreditTransaction = new WalletTransaction({
        walletId: restaurantWallet._id,
        walletType: 'RestaurantWallet',
        transactionType: 'credit',
        amount: restaurantShare,
        currency: order.currency,
        source: 'settlement',
        paymentId: payment._id,
        orderId: order._id,
        restaurantId: order.restaurantId,
        description: `Cancellation charges received - Order #${order.orderNo}`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: 'Restaurant share of cancellation charges'
        }
      });
      await restaurantCreditTransaction.save();
    }

    return {
      success: true,
      refundAmount,
      cancellationCharges,
      restaurantShare,
      adminShare
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Handle user cancellation settlement for online payment orders
 */
async function handleUserCancellationOnline(order, refundAmount, cancellationCharges) {
  try {
    const payment = await Payment.findById(order.paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    const adminWallet = await AdminWallet.findOne();
    if (!adminWallet) {
      throw new Error('Admin wallet not found');
    }

    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    let restaurantWallet = await RestaurantWallet.findOne({ restaurantId: order.restaurantId });
    if (!restaurantWallet) {
      restaurantWallet = new RestaurantWallet({
        restaurantId: order.restaurantId,
        balance: 0,
        currency: order.currency
      });
      await restaurantWallet.save();
    }

    // Get nonRefundSplit from restaurant
    const restaurantSplit = restaurant.tableReservationBookingConfig?.nonRefundSplit?.restaurant || 50;
    const adminSplit = restaurant.tableReservationBookingConfig?.nonRefundSplit?.admin || 50;

    // Split cancellation charges
    const restaurantShare = (cancellationCharges * restaurantSplit) / 100;
    const adminShare = (cancellationCharges * adminSplit) / 100;

    // Convert amounts to INR for admin wallet
    let conversionRate = 1;
    let conversionSource = null;
    if (order.currency.code !== 'INR') {
      const exchangeData = await getExchangeRate(order.currency.code);
      conversionRate = exchangeData.rate;
      conversionSource = exchangeData.source;
    }

    const refundAmountInINR = refundAmount * conversionRate;
    const restaurantShareInINR = restaurantShare * conversionRate;

    // 1. Debit refund amount from AdminWallet
    if (refundAmount > 0) {
      if (adminWallet.balance < refundAmountInINR) {
        throw new Error('Insufficient balance in admin wallet for refund');
      }

      adminWallet.balance -= refundAmountInINR;
      adminWallet.totalDebits += refundAmountInINR;
      await adminWallet.save();

      const adminRefundTransaction = new WalletTransaction({
        walletId: adminWallet._id,
        walletType: 'AdminWallet',
        transactionType: 'debit',
        amount: refundAmountInINR,
        currency: {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹'
        },
        conversion: order.currency.code !== 'INR' ? {
          originalAmount: refundAmount,
          originalCurrency: order.currency.code,
          conversionRate,
          conversionSource,
          convertedAt: new Date()
        } : undefined,
        source: 'refund',
        paymentId: payment._id,
        orderId: order._id,
        restaurantId: order.restaurantId,
        description: `Refund to user - Order #${order.orderNo} (User cancelled)`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: 'User cancellation refund'
        }
      });
      await adminRefundTransaction.save();
    }

    // 2. Credit admin commission (affectsBalance: false)
    const adminCommissionTransaction = new WalletTransaction({
      walletId: adminWallet._id,
      walletType: 'AdminWallet',
      transactionType: 'credit',
      affectsBalance: false,
      amount: adminShare * conversionRate,
      currency: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      conversion: order.currency.code !== 'INR' ? {
        originalAmount: adminShare,
        originalCurrency: order.currency.code,
        conversionRate,
        conversionSource,
        convertedAt: new Date()
      } : undefined,
      source: 'commission',
      paymentId: payment._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      commissionPercentage: adminSplit,
      commissionAmount: adminShare,
      description: `Cancellation charges split - Order #${order.orderNo}`,
      status: 'completed',
      metadata: {
        initiatedBy: 'system',
        notes: 'Admin share of cancellation charges (user cancelled)'
      }
    });
    await adminCommissionTransaction.save();

    // 3. Debit restaurant share from AdminWallet and credit to RestaurantWallet
    if (restaurantShare > 0) {
      if (adminWallet.balance < restaurantShareInINR) {
        throw new Error('Insufficient balance in admin wallet for restaurant share');
      }

      adminWallet.balance -= restaurantShareInINR;
      adminWallet.totalDebits += restaurantShareInINR;
      await adminWallet.save();

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
          conversionRate,
          conversionSource,
          convertedAt: new Date()
        } : undefined,
        source: 'settlement',
        paymentId: payment._id,
        orderId: order._id,
        restaurantId: order.restaurantId,
        description: `Cancellation charges to restaurant - Order #${order.orderNo}`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: 'Restaurant share of cancellation charges'
        }
      });
      await adminDebitTransaction.save();

      restaurantWallet.balance += restaurantShare;
      restaurantWallet.totalEarnings += restaurantShare;
      await restaurantWallet.save();

      const restaurantCreditTransaction = new WalletTransaction({
        walletId: restaurantWallet._id,
        walletType: 'RestaurantWallet',
        transactionType: 'credit',
        amount: restaurantShare,
        currency: order.currency,
        source: 'settlement',
        paymentId: payment._id,
        orderId: order._id,
        restaurantId: order.restaurantId,
        description: `Cancellation charges received - Order #${order.orderNo}`,
        status: 'completed',
        metadata: {
          initiatedBy: 'system',
          notes: 'Restaurant share of cancellation charges'
        }
      });
      await restaurantCreditTransaction.save();
    }

    return {
      success: true,
      refundAmount,
      cancellationCharges,
      restaurantShare,
      adminShare
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  handleRestaurantCancellationOnline,
  handleUserCancellationOnline
};
