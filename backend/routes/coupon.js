const express = require('express');
const Coupon = require('../usersModels/Coupon');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all coupons (admin can see all restaurants)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, restaurantId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }
    
    if (search) {
      query.$or = [
        { couponCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const totalCount = await Coupon.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    const coupons = await Coupon.find(query)
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: error.message
    });
  }
});

// Create coupon for any restaurant
router.post('/', authMiddleware, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating coupon',
      error: error.message
    });
  }
});

// Update coupon
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('restaurantId', 'basicInfo.restaurantName');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating coupon',
      error: error.message
    });
  }
});

// Update coupon status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('restaurantId', 'basicInfo.restaurantName');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon status updated successfully',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating coupon status',
      error: error.message
    });
  }
});

// Delete coupon
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: error.message
    });
  }
});

module.exports = router;
