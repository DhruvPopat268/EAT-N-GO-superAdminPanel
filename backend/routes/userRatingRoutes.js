const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');
const User = require('../usersModels/usersModel');
const Order = require('../usersModels/Order');

// Get user ratings for admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, phone, fullName, startDate, endDate, rating, orderNo, page = 1, limit = 10 } = req.query;

    let allRatings = [];

    if (restaurantId) {
      // Get ratings for specific restaurant
      const restaurant = await Restaurant.findById(restaurantId)
        .populate('userRatings.userId', 'fullName phone')
        .populate('userRatings.orderId', 'orderNo orderType createdAt');

      if (!restaurant) {
        return res.status(404).json({ success: false, message: 'Restaurant not found' });
      }

      allRatings = restaurant.userRatings.map(r => ({
        ...r.toObject(),
        restaurantId: { _id: restaurant._id, basicInfo: { restaurantName: restaurant.basicInfo.restaurantName } }
      }));
    } else {
      // Get ratings from all restaurants
      const restaurants = await Restaurant.find()
        .populate('userRatings.userId', 'fullName phone')
        .populate('userRatings.orderId', 'orderNo orderType createdAt');

      restaurants.forEach(restaurant => {
        restaurant.userRatings.forEach(r => {
          allRatings.push({
            ...r.toObject(),
            restaurantId: { _id: restaurant._id, basicInfo: { restaurantName: restaurant.basicInfo.restaurantName } }
          });
        });
      });
    }

    // Filter by rating
    if (rating) {
      allRatings = allRatings.filter(r => r.rating === parseInt(rating));
    }

    // Filter by date range
    if (startDate || endDate) {
      allRatings = allRatings.filter(r => {
        const ratingDate = r.ratedAt;
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
      allRatings = allRatings.filter(r => r.userId?.phone?.includes(phone));
    }

    // Filter by fullName
    if (fullName) {
      allRatings = allRatings.filter(r => r.userId?.fullName?.toLowerCase().includes(fullName.toLowerCase()));
    }

    // Filter by orderNo
    if (orderNo) {
      allRatings = allRatings.filter(r => r.orderId?.orderNo === parseInt(orderNo));
    }

    // Sort by ratedAt (newest first), handle missing ratedAt
    allRatings.sort((a, b) => {
      const dateA = a.ratedAt || new Date(0);
      const dateB = b.ratedAt || new Date(0);
      return dateB - dateA;
    });

    const total = allRatings.length;
    const startIndex = (page - 1) * limit;
    const paginatedRatings = allRatings.slice(startIndex, startIndex + parseInt(limit));

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