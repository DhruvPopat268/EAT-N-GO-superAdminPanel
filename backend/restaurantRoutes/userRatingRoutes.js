const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const UserRating = require('../usersModels/userRating');
const User = require('../usersModels/usersModel');

// Get user ratings for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { phone, fullName, startDate, endDate, rating, orderNo, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { restaurantId };

    // Rating filter
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // If phone, fullName, or orderNo provided, find matching users/orders first
    if (phone || fullName || orderNo) {
      const Order = require('../usersModels/Order');
      
      // Find orders by orderNo if provided
      if (orderNo) {
        const orders = await Order.find({ 
          restaurantId, 
          orderNo: parseInt(orderNo) 
        }).select('_id');
        
        if (orders.length === 0) {
          return res.json({
            success: true,
            message: 'No ratings found',
            data: {
              ratings: [],
              totalPages: 0,
              currentPage: parseInt(page),
              total: 0
            }
          });
        }
        
        query.orderId = { $in: orders.map(o => o._id) };
      }
      
      // Find users by phone or fullName if provided
      if (phone || fullName) {
        const userQuery = {};
        if (phone) userQuery.phone = { $regex: phone, $options: 'i' };
        if (fullName) userQuery.fullName = { $regex: fullName, $options: 'i' };

        const users = await User.find(userQuery).select('_id');
        const userIds = users.map(u => u._id);

        if (userIds.length === 0) {
          return res.json({
            success: true,
            message: 'No ratings found',
            data: {
              ratings: [],
              totalPages: 0,
              currentPage: parseInt(page),
              total: 0
            }
          });
        }

        query.userId = { $in: userIds };
      }
    }

    // Fetch ratings with pagination
    const ratings = await UserRating.find(query)
      .populate('userId', 'fullName phone')
      .populate('orderId', 'orderNo orderType createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserRating.countDocuments(query);

    res.json({
      success: true,
      message: 'Ratings retrieved successfully',
      data: {
        ratings,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;