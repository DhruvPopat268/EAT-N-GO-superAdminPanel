const express = require('express');
const router = express.Router();
const Cart = require('../usersModels/Cart');
const Coupon = require('../usersModels/Coupon');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');
const { verifyToken } = require('../middleware/userAuth');

// Get eligible coupons
router.get('/eligible/:restaurantId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { restaurantId } = req.params;

    const cart = await Cart.findOne({ userId, restaurantId });
    if (!cart || !cart.items.length) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const coupons = await Coupon.find({
      restaurantId,
      status: true
    });

    const couponList = [];

    for (const coupon of coupons) {
      let isEligible = true;
      let toEligible = '';

      // Check minimum order total
      if (cart.baseCartTotal < coupon.minOrderTotal) {
        isEligible = false;
        const amountNeeded = coupon.minOrderTotal - cart.baseCartTotal;
        toEligible = `Add items worth ${amountNeeded.toFixed(2)} more to use this coupon`;
      }

      // Check total usage limit
      if (isEligible && coupon.totalUsageLimit !== -1 && coupon.usageCount >= coupon.totalUsageLimit) {
        isEligible = false;
        toEligible = 'Coupon usage limit exceeded';
      }

      // Check user usage limit
      if (isEligible && coupon.userUsageLimit !== -1) {
        const userUsageCount = await Order.countDocuments({
          userId,
          restaurantId,
          'appliedCoupon.couponId': coupon._id
        });
        if (userUsageCount >= coupon.userUsageLimit) {
          isEligible = false;
          toEligible = 'You have already used this coupon maximum times';
        }
      }

      // Check first order only
      if (isEligible && coupon.firstOrderOnly) {
        const orderCount = await Order.countDocuments({ userId, restaurantId });
        if (orderCount > 0) {
          isEligible = false;
          toEligible = 'This coupon is only valid for first order';
        }
      }

      // Calculate potential savings
      let savedAmount = 0;
      if (isEligible) {
        if (coupon.discountType === 'percentage') {
          savedAmount = (cart.baseCartTotal * coupon.amount) / 100;
          if (coupon.maxDiscount && savedAmount > coupon.maxDiscount) {
            savedAmount = coupon.maxDiscount;
          }
        } else {
          savedAmount = coupon.amount;
        }
        savedAmount = Math.min(savedAmount, cart.baseCartTotal);
      }

      const couponData = {
        ...coupon.toObject(),
        isEligible,
        isApplied: cart.appliedCoupon?.couponId?.toString() === coupon._id.toString()
      };

      // Remove internal fields
      delete couponData.usageCount;
      delete couponData.totalUsageLimit;
      delete couponData.userUsageLimit;

      if (isEligible) {
        couponData.savedAmount = savedAmount;
      }

      if (!isEligible) {
        couponData.toEligible = toEligible;
      }

      couponList.push(couponData);
    }

    res.json({
      success: true,
      message: 'Coupons retrieved successfully',
      data: couponList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Apply coupon to cart
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon ID is required'
      });
    }

    // Check if user has active order request
    const activeOrderRequest = await OrderRequest.findOne({
      userId,
      status: { $in: ['pending', 'confirmed', 'waiting'] }
    });

    if (activeOrderRequest) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply coupon while you have an active order request'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check if coupon is already applied
    if (cart.appliedCoupon?.couponId?.toString() === couponId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is already applied'
      });
    }

    const coupon = await Coupon.findOne({
      _id: couponId,
      status: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon'
      });
    }

    // Check if coupon belongs to same restaurant as cart
    if (coupon.restaurantId.toString() !== cart.restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon does not belong to the restaurant in your cart'
      });
    }

    // Check minimum order total
    if (cart.baseCartTotal < coupon.minOrderTotal) {
      return res.status(400).json({
        success: false,
        message: `Minimum order total of ${coupon.minOrderTotal} required`
      });
    }

    // Check total usage limit
    if (coupon.totalUsageLimit !== -1 && coupon.usageCount >= coupon.totalUsageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    // Check user usage limit
    if (coupon.userUsageLimit !== -1) {
      const userUsageCount = await Order.countDocuments({
        userId,
        restaurantId: cart.restaurantId,
        'appliedCoupon.couponId': coupon._id
      });

      if (userUsageCount >= coupon.userUsageLimit) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this coupon maximum times'
        });
      }
    }

    // Check first order only
    if (coupon.firstOrderOnly) {
      const orderCount = await Order.countDocuments({ userId, restaurantId: cart.restaurantId });
      if (orderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only valid for first order'
        });
      }
    }

    // Calculate discount
    let savedAmount = 0;
    if (coupon.discountType === 'percentage') {
      savedAmount = (cart.baseCartTotal * coupon.amount) / 100;
      if (coupon.maxDiscount && savedAmount > coupon.maxDiscount) {
        savedAmount = coupon.maxDiscount;
      }
    } else {
      savedAmount = coupon.amount;
    }

    savedAmount = Math.min(savedAmount, cart.baseCartTotal);

    // Update cart with coupon and recalculate cartTotal
    cart.appliedCoupon = {
      couponId: coupon._id,
      savedAmount
    };
    cart.cartTotal = cart.baseCartTotal - savedAmount;
    await cart.save();

    const populatedCart = await Cart.findOne({ userId, restaurantId: cart.restaurantId })
      .populate('appliedCoupon.couponId', 'name couponCode discountType amount');

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart: populatedCart
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

// Remove coupon from cart
router.post('/remove', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user has active order request
    const activeOrderRequest = await OrderRequest.findOne({
      userId,
      status: { $in: ['pending', 'confirmed', 'waiting'] }
    });

    if (activeOrderRequest) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove coupon while you have an active order request'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove appliedCoupon and reset cartTotal
    cart.set('appliedCoupon', undefined, { strict: false });
    cart.cartTotal = cart.baseCartTotal;
    await cart.save();

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: { cart }
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