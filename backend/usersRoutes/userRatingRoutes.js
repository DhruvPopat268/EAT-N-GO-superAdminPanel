const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const UserRating = require('../usersModels/userRating');
const Order = require('../usersModels/Order');

// Submit rating
router.post('/', verifyToken, async (req, res) => {
  try {
    const { orderId, restaurantId, rating, feedback } = req.body;
    const userId = req.user.userId;

    if (!orderId || !restaurantId || !rating) {
      return res.status(400).json({ success: false, message: 'orderId, restaurantId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Find order
    const order = await Order.findOne({ _id: orderId, userId, restaurantId }).select('status userRatingId');

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

    // Create rating
    const userRating = new UserRating({
      userId,
      restaurantId,
      orderId,
      rating,
      feedback: feedback || ''
    });

    await userRating.save();

    // Update order with rating reference
    await Order.findByIdAndUpdate(orderId, { userRatingId: userRating._id });

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