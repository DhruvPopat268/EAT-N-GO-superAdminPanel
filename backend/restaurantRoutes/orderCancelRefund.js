const express = require('express');
const OrderCancelRefund = require('../restaurantModels/OrderCancelRefund');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const router = express.Router();

// Get order cancel refund settings
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const settings = await OrderCancelRefund.findOne({ restaurantId });
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
});

// Update order cancel refund settings
router.put('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const settings = await OrderCancelRefund.findOneAndUpdate(
      { restaurantId },
      req.body,
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

module.exports = router;