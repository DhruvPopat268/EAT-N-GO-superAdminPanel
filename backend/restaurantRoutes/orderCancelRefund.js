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

// Create order cancel refund settings
router.post('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const settings = new OrderCancelRefund({
      restaurantId,
      ...req.body
    });
    await settings.save();
    
    res.status(201).json({
      success: true,
      message: 'Settings created successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating settings',
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

// Delete order cancel refund settings
router.delete('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    await OrderCancelRefund.findOneAndDelete({ restaurantId });
    
    res.status(200).json({
      success: true,
      message: 'Settings deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting settings',
      error: error.message
    });
  }
});

module.exports = router;