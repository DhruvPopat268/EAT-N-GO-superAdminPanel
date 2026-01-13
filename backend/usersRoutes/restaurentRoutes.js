const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');

// Get restaurant basic info and contact details
router.post('/details', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Restaurant ID is required' 
      });
    }

    const restaurant = await Restaurant.findById(restaurantId, 'basicInfo contactDetails documents.primaryImage');

    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }

    res.json({
      success: true,
      message: 'Restaurant details retrieved successfully',
      data: {
        basicInfo: restaurant.basicInfo,
        contactDetails: restaurant.contactDetails,
        primaryImage: restaurant.documents?.primaryImage || null
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get restaurant images
router.post('/images', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Restaurant ID is required' 
      });
    }

    const restaurant = await Restaurant.findById(restaurantId, 'documents.restaurantImages documents.primaryImage');

    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }

    res.json({
      success: true,
      message: 'Restaurant images retrieved successfully',
      data: {
        restaurantImages: restaurant.documents?.restaurantImages || [],
        primaryImage: restaurant.documents?.primaryImage || null
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Search restaurants
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const restaurants = await Restaurant.find({ 
      'basicInfo.restaurantName': { $regex: query, $options: 'i' },
      status: 'approved'
    }, 'basicInfo contactDetails documents.primaryImage');

    // Add isOpen calculation to each restaurant
    const restaurantsWithStatus = restaurants.map(restaurant => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      let isOpen = false;
      
      if (restaurant.basicInfo.operatingHours?.openTime && restaurant.basicInfo.operatingHours?.closeTime) {
        const [openHour, openMin] = restaurant.basicInfo.operatingHours.openTime.split(':').map(Number);
        const [closeHour, closeMin] = restaurant.basicInfo.operatingHours.closeTime.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;
        
        if (closeTime > openTime) {
          isOpen = currentTime >= openTime && currentTime <= closeTime;
        } else {
          isOpen = currentTime >= openTime || currentTime <= closeTime;
        }
      }
      
      return {
        ...restaurant.toObject(),
        isOpen: isOpen
      };
    });

    res.json({
      success: true,
      message: 'Restaurants searched successfully',
      data: restaurantsWithStatus
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