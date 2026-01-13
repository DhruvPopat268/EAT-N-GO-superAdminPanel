const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Subcategory = require('../models/Subcategory');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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
    })
      .populate({
        path: 'attributes.attribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'addons',
        model: 'AddonItem'
      })
      .sort({ createdAt: -1 })

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

// Get items by subcategory
router.get('/by-subcategory', verifyToken, async (req, res) => {
  try {
    const { subcategoryId, category, restaurantId } = req.query;

    if (!subcategoryId || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory ID and Restaurant ID are required'
      });
    }

    // If category is provided, validate it matches the subcategory
    if (category) {
      const allowedCategories = ['Veg', 'Non-Veg', 'Mixed'];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      const subcategory = await Subcategory.findById(subcategoryId);
      if (!subcategory || subcategory.category !== category) {
        return res.json({
          success: true,
          message: 'Items retrieved successfully',
          data: []
        });
      }
    }

    const items = await Item.find({
      subcategory: subcategoryId,
      restaurantId: restaurantId
    })
      .populate({
        path: 'attributes.attribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'addons',
        model: 'AddonItem'
      })

    res.json({
      success: true,
      message: 'Items retrieved successfully',
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Search items
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { query, restaurantId } = req.query;

    if (!query || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Search query and Restaurant ID are required'
      });
    }

    const escapedQuery = escapeRegex(query);
    const items = await Item.find({
      restaurantId,
      name: { $regex: escapedQuery, $options: 'i' }
    });

    res.json({
      success: true,
      message: 'Items searched successfully',
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get available subcategories
router.post('/subcategories', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const subcategories = await Subcategory.find({
      restaurantId: restaurantId,
      isAvailable: true
    });

    res.json({
      success: true,
      message: 'Available subcategories retrieved successfully',
      data: subcategories
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