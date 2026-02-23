const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const Restaurant = require('../models/Restaurant');
const User = require('../usersModels/usersModel');
const Order = require('../usersModels/Order');

// Get user ratings for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { phone, fullName, startDate, endDate, rating, orderNo, page = 1, limit = 10 } = req.query;

    const restaurant = await Restaurant.findById(restaurantId)
      .populate('userRatings.userId', 'fullName phone')
      .populate('userRatings.orderId', 'orderNo orderType createdAt');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    let ratings = restaurant.userRatings;

    // Filter by rating
    if (rating) {
      ratings = ratings.filter(r => r.rating === parseInt(rating));
    }

    // Filter by date range
    if (startDate || endDate) {
      ratings = ratings.filter(r => {
        const ratingDate = r.orderId?.createdAt;
        if (!ratingDate) return false;
        if (startDate && ratingDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (ratingDate > end) return false;
        }
        return true;
      });
    }

    // Filter by phone
    if (phone) {
      ratings = ratings.filter(r => r.userId?.phone?.includes(phone));
    }

    // Filter by fullName
    if (fullName) {
      ratings = ratings.filter(r => r.userId?.fullName?.toLowerCase().includes(fullName.toLowerCase()));
    }

    // Filter by orderNo
    if (orderNo) {
      ratings = ratings.filter(r => r.orderId?.orderNo === parseInt(orderNo));
    }

    // Sort by ratedAt (newest first), handle missing ratedAt
    ratings.sort((a, b) => {
      const dateA = a.ratedAt || new Date(0);
      const dateB = b.ratedAt || new Date(0);
      return dateB - dateA;
    });

    const total = ratings.length;
    const startIndex = (page - 1) * limit;
    const paginatedRatings = ratings.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      message: 'Ratings retrieved successfully',
      data: {
        ratings: paginatedRatings,
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