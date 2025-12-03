const express = require('express');
const bcrypt = require('bcryptjs');
const RestaurantUser = require('../restaurantModels/RestaurantUser');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const createLog = require('../utils/createLog');
const Restaurant = require('../models/Restaurant');
const router = express.Router();

// Get all users for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const users = await RestaurantUser.find({ restaurantId, isActive: true })
      .populate('role')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Create user
router.post('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new RestaurantUser({
      ...userData,
      password: hashedPassword,
      restaurantId
    });
    await user.save();
    await user.populate('role');
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'User',
      'create',
      `Created user "${user.name}"`,
      restaurant?.basicInfo?.restaurantName,
      user.name
    );
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Update user
router.put('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { password, ...updateData } = req.body;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await RestaurantUser.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      updateData,
      { new: true }
    ).populate('role').select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'User',
      'update',
      `Updated user "${user.name}"`,
      restaurant?.basicInfo?.restaurantName,
      user.name
    );
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const user = await RestaurantUser.findOne({ _id: req.params.id, restaurantId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.restaurant,
      'User Management',
      'User',
      'delete',
      `Deleted user "${user.name}"`,
      restaurant?.basicInfo?.restaurantName,
      user.name
    );
    
    await RestaurantUser.findOneAndDelete({ _id: req.params.id, restaurantId });
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;