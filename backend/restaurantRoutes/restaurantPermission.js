const express = require('express');
const RestaurantPermission = require('../restaurantModels/RestaurantPermission');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const createLog = require('../utils/createLog');
const Restaurant = require('../models/Restaurant');
const router = express.Router();

// Get all permissions for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const permissions = await RestaurantPermission.find({ restaurantId, isActive: true })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
});

// Create permission
router.post('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const permission = new RestaurantPermission({ ...req.body, restaurantId });
    await permission.save();
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'Permission',
      'create',
      `Created permission "${permission.name}"`,
      restaurant?.basicInfo?.restaurantName,
      permission.name
    );
    
    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    });
  }
});

// Update permission
router.put('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const permission = await RestaurantPermission.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      req.body,
      { new: true }
    );
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'Permission',
      'update',
      `Updated permission "${permission.name}"`,
      restaurant?.basicInfo?.restaurantName,
      permission.name
    );
    
    res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    });
  }
});

// Delete permission
router.delete('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const permission = await RestaurantPermission.findOne({ _id: req.params.id, restaurantId });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'Permission',
      'delete',
      `Deleted permission "${permission.name}"`,
      restaurant?.basicInfo?.restaurantName,
      permission.name
    );
    
    await RestaurantPermission.findOneAndDelete({ _id: req.params.id, restaurantId });
    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message
    });
  }
});

module.exports = router;