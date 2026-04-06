const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const WalletTransaction = require('../models/WalletTransaction');
const RestaurantWallet = require('../restaurantModels/RestaurantWallet');

// Get restaurant wallet transactions with pagination
router.get('/transactions', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Get restaurant wallet details
    const restaurantWallet = await RestaurantWallet.findOne({ restaurantId });
    if (!restaurantWallet) {
      return res.status(404).json({ success: false, message: 'Restaurant wallet not found' });
    }

    const filter = { 
      walletType: 'RestaurantWallet',
      restaurantId: restaurantId
    };

    const totalCount = await WalletTransaction.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const transactions = await WalletTransaction.find(filter)
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.city contactDetails.state contactDetails.country')
      .populate('orderId', 'orderNo')
      .populate('tableBookingId','tableBookingNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      message: 'Restaurant wallet transactions retrieved successfully',
      wallet: {
        balance: restaurantWallet.balance,
        totalEarnings: restaurantWallet.totalEarnings,
        totalDebits: restaurantWallet.totalDebits,
        totalWithdrawals: restaurantWallet.totalWithdrawals,
        pendingSettlement: restaurantWallet.pendingSettlement,
        currency: restaurantWallet.currency
      },
      data: transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
