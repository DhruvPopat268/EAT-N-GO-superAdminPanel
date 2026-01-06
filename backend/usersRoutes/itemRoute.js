const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { verifyToken } = require('../middleware/userAuth');

// Get popular items for a restaurant
router.post('/popular-items', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Restaurant ID is required' 
      });
    }

    const popularItems = await Item.find({ 
      restaurantId, 
      isPopular: true 
    });

    res.json({
      success: true,
      message: 'Popular items retrieved successfully',
      data: popularItems
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;