const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const WalletTransaction = require('../models/WalletTransaction');
const AdminWallet = require('../models/AdminWallet');

// Get all admin wallet transactions with pagination
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { walletType: 'AdminWallet' };

    // Get admin wallet details
    const adminWallet = await AdminWallet.findOne();
    if (!adminWallet) {
      return res.status(404).json({ success: false, message: 'Admin wallet not found' });
    }

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
      message: 'Admin wallet transactions retrieved successfully',
      wallet: {
        balance: adminWallet.balance,
        totalCredits: adminWallet.totalCredits,
        totalDebits: adminWallet.totalDebits,
        currency: adminWallet.currency
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
