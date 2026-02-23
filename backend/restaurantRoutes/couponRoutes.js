const express = require('express');
const Coupon = require('../usersModels/Coupon');
const Restaurant = require('../models/Restaurant');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const router = express.Router();

// Get all coupons for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    
    let query = { restaurantId };
    
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

// Create coupon
router.post('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    
    const existingCoupon = await Coupon.findOne({
      couponCode: req.body.couponCode?.toUpperCase(),
      restaurantId
    });
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists for this restaurant'
      });
    }
    
    const couponData = {
      ...req.body,
      restaurantId
    };
    
    if (req.body.discountType === 'fixed') {
      const restaurant = await Restaurant.findById(restaurantId);
      if (restaurant?.businessDetails?.currency) {
        couponData.currency = restaurant.businessDetails.currency;
      }
    }
    
    const coupon = new Coupon(couponData);
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
router.put('/:id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
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
router.patch('/:id/status', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { status } = req.body;
    
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
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

module.exports = router;