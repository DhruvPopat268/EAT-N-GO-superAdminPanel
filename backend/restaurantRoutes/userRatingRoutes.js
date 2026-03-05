const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const UserRating = require('../usersModels/userRating');

// Get user ratings for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { phone, fullName, startDate, endDate, rating, orderNo, page = 1, limit = 10 } = req.query;

    // Build query for UserRating collection
    let query = { restaurantId };

    // Filter by rating
    if (rating) {
      query.restaurantRating = parseInt(rating);
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let ratings = await UserRating.find(query)
      .populate('userId', 'fullName phone')
      .populate('orderId', 'orderNo orderType createdAt')
      .sort({ createdAt: -1 });

    // Filter by phone (after population)
    if (phone) {
      ratings = ratings.filter(r => r.userId?.phone?.includes(phone));
    }

    // Filter by fullName (after population)
    if (fullName) {
      ratings = ratings.filter(r => r.userId?.fullName?.toLowerCase().includes(fullName.toLowerCase()));
    }

    // Filter by orderNo (after population)
    if (orderNo) {
      ratings = ratings.filter(r => r.orderId?.orderNo === parseInt(orderNo));
    }

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