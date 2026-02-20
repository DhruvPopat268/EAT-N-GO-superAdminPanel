const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const UserRating = require('../usersModels/userRating');
const Order = require('../usersModels/Order');
const Restaurant = require('../models/Restaurant');

// Get order items for rating
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, userId })
      .select('items restaurantId status')
      .populate('items.itemId', 'name')
      .populate('items.selectedAttribute', 'name')
      .populate('items.selectedAddons.addonId', 'name')
      .populate('items.selectedAddons.selectedAttribute', 'name')
      .populate('restaurantId', 'basicInfo.restaurantName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed orders' });
    }

    const formattedItems = order.items.map(item => ({
      itemId: item.itemId._id,
      itemName: item.itemId.name,
      attributeName: item.selectedAttribute?.name || null,
      customizations: item.selectedCustomizations.map(c => c.customizationName),
      addons: item.selectedAddons.map(a => a.addonId.name)
    }));

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        restaurantId: order.restaurantId._id,
        restaurantName: order.restaurantId.basicInfo.restaurantName,
        items: formattedItems
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Submit rating
router.post('/', verifyToken, async (req, res) => {
  try {
    const { orderId, restaurantRating, itemRatings, feedback } = req.body;
    const userId = req.user.userId;

    if (!orderId || !restaurantRating || !itemRatings || !Array.isArray(itemRatings) || itemRatings.length === 0) {
      return res.status(400).json({ success: false, message: 'orderId, restaurantRating and itemRatings array are required' });
    }

    if (restaurantRating < 1 || restaurantRating > 5) {
      return res.status(400).json({ success: false, message: 'Restaurant rating must be between 1 and 5' });
    }

    // Validate each item rating
    for (const item of itemRatings) {
      if (!item.itemId || !item.rating || item.rating < 1 || item.rating > 5) {
        return res.status(400).json({ success: false, message: 'Each item must have itemId and rating (1-5)' });
      }
    }

    // Find order
    const order = await Order.findOne({ _id: orderId, userId }).select('status userRatingId restaurantId items');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed orders' });
    }

    // Check if already rated
    if (order.userRatingId) {
      return res.status(400).json({ success: false, message: 'Order already rated' });
    }

    // Validate that all rated items belong to this order
    const orderItemIds = order.items.map(item => item.itemId.toString());
    for (const itemRating of itemRatings) {
      if (!orderItemIds.includes(itemRating.itemId)) {
        return res.status(400).json({ success: false, message: `Item ${itemRating.itemId} does not belong to this order` });
      }
    }

    const restaurantId = order.restaurantId;

    // Create rating
    const userRating = new UserRating({
      userId,
      restaurantId,
      orderId,
      restaurantRating,
      itemRatings,
      feedback: feedback || ''
    });

    await userRating.save();

    // Update order with rating reference
    await Order.findByIdAndUpdate(orderId, { userRatingId: userRating._id });

    // Add restaurant rating to restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    const newRestaurantTotal = restaurant.totalRatings + 1;
    const newRestaurantAvg = ((restaurant.averageRating * restaurant.totalRatings) + restaurantRating) / newRestaurantTotal;
    
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { userRatings: { userId, rating: restaurantRating } },
      averageRating: newRestaurantAvg,
      totalRatings: newRestaurantTotal
    });

    // Add item ratings to items
    const Item = require('../models/Item');
    for (const itemRating of itemRatings) {
      const item = await Item.findById(itemRating.itemId);
      const newItemTotal = item.totalRatings + 1;
      const newItemAvg = ((item.averageRating * item.totalRatings) + itemRating.rating) / newItemTotal;
      
      await Item.findByIdAndUpdate(itemRating.itemId, {
        $push: { userRatings: { userId, rating: itemRating.rating } },
        averageRating: newItemAvg,
        totalRatings: newItemTotal
      });
    }

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: userRating
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Rating already exists for this order' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;