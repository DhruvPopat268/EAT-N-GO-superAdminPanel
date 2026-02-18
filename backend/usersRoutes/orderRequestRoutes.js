const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const Cart = require('../usersModels/Cart');
const Coupon = require('../usersModels/Coupon');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');
const Restaurant = require('../models/Restaurant');
const User = require('../usersModels/usersModel');
const { isRestaurantOpen } = require('../utils/restaurantOperatingTiming');
const { emitToRestaurant } = require('../utils/socketUtils');

// Helper function to check if time is within operating hours using IST
function isTimeWithinOperatingHours(requestedTime, openTime, closeTime) {
  // Convert current IST time to minutes for comparison
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const requested = timeToMinutes(requestedTime);
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);

  if (close > open) {
    // Same day (e.g., 9:00 to 22:00)
    return requested >= open && requested <= close;
  } else {
    // Crosses midnight (e.g., 22:00 to 2:00)
    return requested >= open || requested <= close;
  }
}

// Helper function to check if order request with same configuration exists
function findExistingOrderRequest(existingOrders, newOrderData) {
  return existingOrders.find(order => {
    // Check restaurant
    if (order.restaurantId.toString() !== newOrderData.restaurantId.toString()) return false;

    // Check order type
    if (order.orderType !== newOrderData.orderType) return false;

    // Check timings based on order type
    if (newOrderData.orderType === 'dine-in') {
      if (order.eatTimings?.startTime !== newOrderData.eatTimings?.startTime ||
        order.eatTimings?.endTime !== newOrderData.eatTimings?.endTime) return false;
    } else {
      if (order.takeawayTimings?.startTime !== newOrderData.takeawayTimings?.startTime ||
        order.takeawayTimings?.endTime !== newOrderData.takeawayTimings?.endTime) return false;
    }

    // Check items configuration
    if (order.items.length !== newOrderData.items.length) return false;

    return order.items.every(orderItem => {
      return newOrderData.items.some(newItem => {
        if (orderItem.itemId.toString() !== newItem.itemId.toString()) return false;
        if (orderItem.quantity !== newItem.quantity) return false;
        if ((orderItem.selectedAttribute?.toString() || null) !== (newItem.selectedAttribute?.toString() || null)) return false;
        if ((orderItem.selectedFoodType || 'Regular') !== (newItem.selectedFoodType || 'Regular')) return false;

        // Check customizations
        if (!customizationsEqual(orderItem.selectedCustomizations, newItem.selectedCustomizations)) return false;

        // Check addons
        if (!addonsEqual(orderItem.selectedAddons, newItem.selectedAddons)) return false;

        return true;
      });
    });
  });
}

function customizationsEqual(arr1 = [], arr2 = []) {
  if (arr1.length !== arr2.length) return false;

  return arr1.every(c1 => {
    const c2 = arr2.find(c => c.customizationId === c1.customizationId);
    if (!c2) return false;

    if (c1.selectedOptions.length !== c2.selectedOptions.length) return false;

    return c1.selectedOptions.every(o1 => {
      return c2.selectedOptions.some(o2 => o2.optionId === o1.optionId && o2.quantity === o1.quantity);
    });
  });
}

function addonsEqual(arr1 = [], arr2 = []) {
  if (arr1.length !== arr2.length) return false;

  return arr1.every(a1 => {
    return arr2.some(a2 => {
      const addonId1 = a1.addonId?.toString() || a1.addonId;
      const addonId2 = a2.addonId?.toString() || a2.addonId;
      const attr1 = a1.selectedAttribute?.toString() || null;
      const attr2 = a2.selectedAttribute?.toString() || null;

      return addonId1 === addonId2 && attr1 === attr2 && a1.quantity === a2.quantity;
    });
  });
}

// Get order request by ID
router.get('/:orderReqId', verifyToken, async (req, res) => {
  try {
    const { orderReqId } = req.params;
    const userId = req.user.userId;

    const orderRequest = await OrderRequest.findOne({ _id: orderReqId, userId })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory businessDetails.currency contactDetails.latitude contactDetails.longitude')
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'attributes.attribute',
            model: 'Attribute',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes',
            populate: {
              path: 'attributes.attribute',
              model: 'Attribute',
              select: 'name'
            }
          }
        ]
      })
      .populate({
        path: 'items.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'items.selectedAddons.addonId',
        model: 'AddonItem',
        select: 'category name description images currency isAvailable'
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate('orderReqReasonId', 'reasonType reasonText');

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found' });
    }

    res.json({
      success: true,
      message: 'Order request retrieved successfully',
      data: orderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user order requests
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orderRequests = await OrderRequest.find({ userId })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory')
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select:
          'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes'
          }
        ]
      })
      .populate({
        path: 'items.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'items.selectedAddons.addonId',
        model: 'AddonItem',
        select: 'category name description images currency isAvailable attributes',
        populate: {
          path: 'attributes.attribute',
          model: 'Attribute'
        }
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Order requests retrieved successfully',
      data: processedOrderRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get in-progress order request
router.get('/in-progress/list', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orderRequest = await OrderRequest.findOne({ 
      userId, 
      status: { $in: ['pending', 'confirmed', 'waiting'] } 
    })
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage businessDetails.currency')
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes'
          }
        ]
      })
      .populate({
        path: 'items.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'items.selectedAddons.addonId',
        model: 'AddonItem',
        select: 'category name description images currency isAvailable attributes',
        populate: {
          path: 'attributes.attribute',
          model: 'Attribute'
        }
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate('orderReqReasonId', 'reasonType reasonText')
      .sort({ createdAt: -1 });

    if (!orderRequest) {
      return res.json({
        success: true,
        message: 'No in-progress order request found',
        data: null
      });
    }

    const processedOrderRequest = orderRequest.toObject();

    res.json({
      success: true,
      message: 'In-progress order request retrieved successfully',
      data: processedOrderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create order request
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { orderType, numberOfGuests, eatTimings, dineInstructions, takeawayTimings, takeawayInstructions } = req.body;
    const userId = req.user.userId;

    // Check if user has fullName
    const user = await User.findById(userId).select('fullName');
    if (!user || !user.fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your profile by adding your full name before creating an order request',
        code: 'FULLNAME_REQUIRED'
      });
    }

    // Validate orderType
    if (!orderType || !['dine-in', 'takeaway'].includes(orderType)) {
      return res.status(400).json({ success: false, message: 'Invalid orderType' });
    }

    // Validate required fields
    if (orderType === 'dine-in') {
      if (!numberOfGuests || !eatTimings?.startTime || !eatTimings?.endTime) {
        return res.status(400).json({
          success: false,
          message: 'For dine-in orders: numberOfGuests, eatTimings.startTime and eatTimings.endTime are required'
        });
      }
    } else if (orderType === 'takeaway') {
      if (!takeawayTimings?.startTime || !takeawayTimings?.endTime) {
        return res.status(400).json({
          success: false,
          message: 'For takeaway orders: takeawayTimings.startTime and takeawayTimings.endTime are required'
        });
      }
    }

    // Validate time format (HH:MM with valid hours 0-23 and minutes 0-59)
    const isValidTime = (time) => {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(time);
    };

    if (orderType === 'dine-in') {
      if (!isValidTime(eatTimings.startTime) || !isValidTime(eatTimings.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Please use HH:MM format with valid hours (0-23) and minutes (0-59).',
          code: 'INVALID_TIME_FORMAT'
        });
      }
    } else if (orderType === 'takeaway') {
      if (!isValidTime(takeawayTimings.startTime) || !isValidTime(takeawayTimings.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Please use HH:MM format with valid hours (0-23) and minutes (0-59).',
          code: 'INVALID_TIME_FORMAT'
        });
      }
    }

    // Validate timing - user cannot create order request with current time in the time range
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    if (orderType === 'dine-in' && eatTimings) {
      const startTime = eatTimings.startTime.slice(0, 5);
      const endTime = eatTimings.endTime.slice(0, 5);
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return res.status(400).json({
          success: false,
          message: `You cannot create order request for current time slot (${eatTimings.startTime} - ${eatTimings.endTime}). Please select a future time.`,
          code: 'INVALID_TIME_SLOT'
        });
      }
    } else if (orderType === 'takeaway' && takeawayTimings) {
      const startTime = takeawayTimings.startTime.slice(0, 5);
      const endTime = takeawayTimings.endTime.slice(0, 5);
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return res.status(400).json({
          success: false,
          message: `You cannot create order request for current time slot (${takeawayTimings.startTime} - ${takeawayTimings.endTime}). Please select a future time.`,
          code: 'INVALID_TIME_SLOT'
        });
      }
    }

    // Check if user already has an active order request
    const existingActiveOrder = await OrderRequest.findOne({ 
      userId, 
      status: { $in: ['pending', 'confirmed', 'waiting'] }
    });
    
    if (existingActiveOrder) {
      return res.status(400).json({ 
        success: false, 
        message: `You already have an active order request (${existingActiveOrder.status}). Please complete or cancel that order request first.`,
        code: 'ACTIVE_ORDER_REQUEST_EXISTS'
      });
    }

    // Find user's cart (WITHOUT population here)
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate applied coupon if exists
    if (cart.appliedCoupon && cart.appliedCoupon.couponId) {
      const coupon = await Coupon.findOne({
        _id: cart.appliedCoupon.couponId,
        status: true
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Applied coupon is no longer valid'
        });
      }

      // Check if coupon belongs to same restaurant as cart
      if (coupon.restaurantId.toString() !== cart.restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Applied coupon does not belong to the restaurant'
        });
      }

      // Check minimum order total
      if (cart.baseCartTotal < coupon.minOrderTotal) {
        return res.status(400).json({
          success: false,
          message: `Minimum order total of ${coupon.minOrderTotal} required for this coupon`
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
    }

    // Get restaurant
    const restaurant = await Restaurant.findById(cart.restaurantId);
    if (!restaurant) {
      return res.status(400).json({ success: false, message: 'Restaurant not found' });
    }

    // Check operating hours
    const { openTime, closeTime } = restaurant.basicInfo.operatingHours || {};
    if (openTime && closeTime) {
      if (restaurant.isManuallyClosed) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant is temporarily closed'
        });
      }
      if (orderType === 'dine-in') {
        // For dine-in, check both start and end times
        const startTime = eatTimings?.startTime;
        const endTime = eatTimings?.endTime;

        if (startTime && !isTimeWithinOperatingHours(startTime, openTime, closeTime)) {
          return res.status(400).json({
            success: false,
            message: `Restaurant is closed at start time. Operating hours: ${openTime} - ${closeTime}`
          });
        }

        if (endTime && !isTimeWithinOperatingHours(endTime, openTime, closeTime)) {
          return res.status(400).json({
            success: false,
            message: `Restaurant is closed at end time. Operating hours: ${openTime} - ${closeTime}`
          });
        }
      } else {
        // For takeaway, check both start and end times
        const startTime = takeawayTimings?.startTime;
        const endTime = takeawayTimings?.endTime;

        if (startTime && !isTimeWithinOperatingHours(startTime, openTime, closeTime)) {
          return res.status(400).json({
            success: false,
            message: `Restaurant is closed at start time. Operating hours: ${openTime} - ${closeTime}`
          });
        }

        if (endTime && !isTimeWithinOperatingHours(endTime, openTime, closeTime)) {
          return res.status(400).json({
            success: false,
            message: `Restaurant is closed at end time. Operating hours: ${openTime} - ${closeTime}`
          });
        }
      }
    }



    // Create order request with cart data including totals
    const orderRequest = new OrderRequest({
      userId,
      restaurantId: cart.restaurantId,
      items: cart.items,
      orderType,
      numberOfGuests,
      eatTimings,
      dineInstructions,
      takeawayTimings,
      takeawayInstructions,
      baseCartTotal: cart.baseCartTotal,
      cartTotal: cart.cartTotal,
      appliedCoupon: cart.appliedCoupon
    });

    await orderRequest.save();

    // Populate the created order request
    const populatedOrderRequest = await OrderRequest.findById(orderRequest._id)
      .populate('userId', 'fullName phone')
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select:
          'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
        populate: [
          {
            path: 'subcategory',
            model: 'Subcategory',
            select: 'name'
          },
          {
            path: 'addons',
            model: 'AddonItem',
            select: 'category name description images currency isAvailable attributes'
          }
        ]
      })
      .populate({
        path: 'items.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      })
      .populate({
        path: 'items.selectedAddons.addonId',
        model: 'AddonItem',
        select: 'category name description images currency isAvailable attributes',
        populate: {
          path: 'attributes.attribute',
          model: 'Attribute'
        }
      })
      .populate({
        path: 'items.selectedAddons.selectedAttribute',
        model: 'Attribute',
        select: 'name'
      });

    const processedOrderRequest = populatedOrderRequest.toObject();

    // Emit socket event to restaurant
    const io = req.app.get('io');
    if (io) {
      emitToRestaurant(io, orderRequest.restaurantId, 'new-order-req', processedOrderRequest);
    }

    res.status(201).json({
      success: true,
      message: 'Order request created successfully',
      data: processedOrderRequest
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Cancel order request
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const { orderReqId } = req.body;
    const userId = req.user.userId;

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, userId, status: { $in: ['pending', 'confirmed', 'waiting'] } },
      { status: 'cancelled', cancelledBy: 'User' },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found or cannot be cancelled' });
    }

    // Delete the cart
    await Cart.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: 'Order request cancelled successfully',
      data: orderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
