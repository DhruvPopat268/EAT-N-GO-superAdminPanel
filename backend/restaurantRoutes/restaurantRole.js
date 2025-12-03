const express = require('express');
const RestaurantRole = require('../restaurantModels/RestaurantRole');
const RestaurantUser = require('../restaurantModels/RestaurantUser');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const createLog = require('../utils/createLog');
const Restaurant = require('../models/Restaurant');
const router = express.Router();

// Get all roles for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const roles = await RestaurantRole.find({ restaurantId, isActive: true })
      .populate('permissions')
      .sort({ createdAt: -1 });
    
    // Add user count for each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await RestaurantUser.countDocuments({ role: role._id, isActive: true });
        return {
          ...role.toObject(),
          userCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: rolesWithUserCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
});

// Create role
router.post('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const role = new RestaurantRole({ ...req.body, restaurantId });
    await role.save();
    await role.populate('permissions');
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'Role',
      'create',
      `Created role "${role.name}"`,
      restaurant?.basicInfo?.restaurantName,
      role.name
    );
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
});

// Update role
router.put('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const role = await RestaurantRole.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      req.body,
      { new: true }
    ).populate('permissions');
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'Role',
      'update',
      `Updated role "${role.name}"`,
      restaurant?.basicInfo?.restaurantName,
      role.name
    );
    
    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
});

// Delete role
router.delete('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const role = await RestaurantRole.findOne({ _id: req.params.id, restaurantId });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete system role'
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'Role',
      'delete',
      `Deleted role "${role.name}"`,
      restaurant?.basicInfo?.restaurantName,
      role.name
    );
    
    await RestaurantRole.findOneAndDelete({ _id: req.params.id, restaurantId });
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
});

module.exports = router;