const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const UserRating = require('../usersModels/userRating');
const User = require('../usersModels/usersModel');

// Get user ratings for admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, phone, fullName, restaurantName, startDate, endDate, rating, orderNo, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

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

    // If phone, fullName, restaurantName, or orderNo provided, find matching users/orders/restaurants first
    if (phone || fullName || restaurantName || orderNo) {
      const Order = require('../usersModels/Order');
      const Restaurant = require('../models/Restaurant');
      
      const matchedUserIds = [];
      const matchedRestaurantIds = [];
      const matchedOrderIds = [];
      
      // Find restaurants by name if provided
      if (restaurantName) {
        const restaurants = await Restaurant.find({
          'basicInfo.restaurantName': { $regex: restaurantName, $options: 'i' }
        }).select('_id');
        
        matchedRestaurantIds.push(...restaurants.map(r => r._id));
      }
      
      // Find orders by orderNo if provided
      if (orderNo) {
        const orderQuery = { orderNo: parseInt(orderNo) };
        if (restaurantId) orderQuery.restaurantId = restaurantId;
        
        const orders = await Order.find(orderQuery).select('_id');
        matchedOrderIds.push(...orders.map(o => o._id));
      }
      
      // Find users by phone or fullName if provided
      if (phone || fullName) {
        const userQuery = { $or: [] };
        if (phone) userQuery.$or.push({ phone: { $regex: phone, $options: 'i' } });
        if (fullName) userQuery.$or.push({ fullName: { $regex: fullName, $options: 'i' } });

        const users = await User.find(userQuery).select('_id');
        matchedUserIds.push(...users.map(u => u._id));
      }
      
      // Build OR query for all matched IDs
      const orConditions = [];
      if (matchedUserIds.length > 0) orConditions.push({ userId: { $in: matchedUserIds } });
      if (matchedRestaurantIds.length > 0) orConditions.push({ restaurantId: { $in: matchedRestaurantIds } });
      if (matchedOrderIds.length > 0) orConditions.push({ orderId: { $in: matchedOrderIds } });
      
      if (orConditions.length === 0) {
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
      
      query.$or = orConditions;
    }

    // Fetch ratings with pagination
    const ratings = await UserRating.find(query)
      .populate('userId', 'fullName phone')
      .populate('orderId', 'orderNo orderType createdAt')
      .populate('restaurantId', 'basicInfo.restaurantName')
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