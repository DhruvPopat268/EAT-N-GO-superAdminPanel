const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const Cart = require('../usersModels/Cart');
const Coupon = require('../usersModels/Coupon');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');
const User = require('../usersModels/usersModel');
const Restaurant = require('../models/Restaurant');
const { emitOrderToRestaurant } = require('../utils/socketUtils');
const { isRestaurantOpen } = require('../utils/restaurantOperatingTiming');

// Helper function to compare cart items with order request items
function compareItemsConfiguration(cartItems, orderRequestItems) {
  if (cartItems.length !== orderRequestItems.length) return false;

  return cartItems.every(cartItem => {
    return orderRequestItems.some(orderItem => {
      if (cartItem.itemId.toString() !== orderItem.itemId.toString()) return false;
      if (cartItem.quantity !== orderItem.quantity) return false;
      if ((cartItem.selectedAttribute?.toString() || null) !== (orderItem.selectedAttribute?.toString() || null)) return false;
      if ((cartItem.selectedFoodType || 'Regular') !== (orderItem.selectedFoodType || 'Regular')) return false;

      // Check customizations
      if (!customizationsEqual(cartItem.selectedCustomizations, orderItem.selectedCustomizations)) return false;

      // Check addons
      if (!addonsEqual(cartItem.selectedAddons, orderItem.selectedAddons)) return false;

      return true;
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

// Place order
router.post('/place', verifyToken, async (req, res) => {
  try {
    const { orderReqId, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Check if user has fullName
    const user = await User.findById(userId).select('fullName');
    if (!user || !user.fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your profile by adding your full name before placing an order',
        code: 'FULLNAME_REQUIRED'
      });
    }

    if (!orderReqId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'orderReqId and paymentMethod are required' });
    }

    if (!['online', 'pay_at_restaurant'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid paymentMethod' });
    }

    // Find order request
    const orderRequest = await OrderRequest.findOne({
      _id: orderReqId,
      userId,
      status: { $in: ['confirmed', 'waiting'] }
    });

    if (!orderRequest) {
      return res.status(400).json({
        success: false,
        message: 'Order request not found or not confirmed or not waiting',
        code: 'ORDER_REQUEST_NOT_CONFIRMED_OR_WAITING'
      });
    }

    // Validate timing - user cannot place order during their specified time slot
    let timings;
    if (orderRequest.orderType === 'dine-in') {
      timings = orderRequest.eatTimings;
    } else if (orderRequest.orderType === 'takeaway') {
      timings = orderRequest.takeawayTimings;
    }

    if (timings && timings.startTime && timings.endTime) {
      // Get current time in IST (UTC+5:30)
      const now = new Date();
      const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Get order request creation time in IST
      const orderReqDate = new Date(orderRequest.createdAt.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Build slot start/end Date objects
      const [startHour, startMin] = timings.startTime.split(':').map(Number);
      const [endHour, endMin] = timings.endTime.split(':').map(Number);
      
      let slotStart = new Date(orderReqDate);
      slotStart.setHours(startHour, startMin, 0, 0);
      
      let slotEnd = new Date(orderReqDate);
      slotEnd.setHours(endHour, endMin, 0, 0);
      
      // If end time < start time, slot spans midnight (next day)
      if (slotEnd <= slotStart) {
        slotEnd.setDate(slotEnd.getDate() + 1);
      }
      
      // If slot is in the past relative to order creation, assume next day
      if (slotEnd < orderReqDate) {
        slotStart.setDate(slotStart.getDate() + 1);
        slotEnd.setDate(slotEnd.getDate() + 1);
      }

      // Check if current time is within the specified time slot
      if (nowIST >= slotStart && nowIST <= slotEnd) {
        await OrderRequest.findByIdAndUpdate(orderReqId, {
          $set: { status: 'cancelled', cancelledBy: 'System' }
        });

        return res.status(400).json({
          success: false,
          message: `You cannot place order during your specified time slot (${timings.startTime} - ${timings.endTime}). Order request has been cancelled.`,
          code: 'ORDER_DURING_TIME_SLOT'
        });
      }

      // Check if the time slot has already passed
      if (nowIST > slotEnd) {
        await OrderRequest.findByIdAndUpdate(orderReqId, {
          $set: { status: 'cancelled', cancelledBy: 'System' }
        });

        return res.status(400).json({
          success: false,
          message: `Your specified time slot (${timings.startTime} - ${timings.endTime}) has already passed. Order request has been cancelled.`,
          code: 'TIME_SLOT_EXPIRED'
        });
      }
    }

    // Find current cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Check if cart restaurant matches order request restaurant
    if (cart.restaurantId.toString() !== orderRequest.restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cart restaurant does not match order request restaurant',
        code: 'RESTAURANT_MISMATCH'
      });
    }

    // Check if restaurant is open and not manually closed
    const restaurant = await Restaurant.findById(cart.restaurantId).select('basicInfo.operatingHours isManuallyClosed');
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const { openTime, closeTime } = restaurant.basicInfo.operatingHours || {};
    if (!isRestaurantOpen(openTime, closeTime, restaurant.isManuallyClosed)) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is currently closed',
        code: 'RESTAURANT_CLOSED'
      });
    }

    // Compare cart items with order request items
    const itemsMatch = compareItemsConfiguration(cart.items, orderRequest.items);
    if (!itemsMatch) {
      return res.status(400).json({
        success: false,
        message: 'Cart items do not match order request items',
        code: 'CART_ITEMS_MISMATCH'
      });
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

    // Use cart total directly from database
    const baseTotal = cart.baseCartTotal || 0;
    const finalTotal = cart.cartTotal || 0;

    // Create order
    const order = new Order({
      userId,
      restaurantId: orderRequest.restaurantId,
      orderRequestId: orderReqId,
      items: cart.items,
      orderType: orderRequest.orderType,
      numberOfGuests: orderRequest.numberOfGuests,
      eatTimings: orderRequest.eatTimings,
      dineInstructions: orderRequest.dineInstructions,
      takeawayTimings: orderRequest.takeawayTimings,
      takeawayInstructions: orderRequest.takeawayInstructions,
      paymentMethod,
      baseTotalAmount: baseTotal,
      totalAmount: finalTotal,
      appliedCoupon: cart.appliedCoupon,
      status: 'confirmed',
      waitingTime: orderRequest.waitingTime
    });

    await order.save();

    // Increment coupon usage count if coupon was applied
    if (cart.appliedCoupon && cart.appliedCoupon.couponId) {
      await Coupon.findByIdAndUpdate(cart.appliedCoupon.couponId, {
        $inc: { usageCount: 1 }
      });
    }

    // Add order to user's orders array
    await User.findByIdAndUpdate(userId, {
      $push: { orders: order._id }
    });

    // Clear cart
    await Cart.findOneAndDelete({ userId });

    // Update order request to completed with final order id
    await OrderRequest.findByIdAndUpdate(orderReqId, {
      $set: {
        finalOrderId: order._id,
        status: 'completed'
      }
    });

    // Populate the created order and add totals
    const populatedOrder = await Order.findById(order._id)
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

    // Process order with totals
    const processedOrder = populatedOrder.toObject();

    // Emit socket event to restaurant
    const io = req.app.get('io');
    if (io) {
      emitOrderToRestaurant(io, order.restaurantId, processedOrder);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: processedOrder
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    // Return all orders with pagination
    const orders = await Order.find({ userId })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory')
      .populate({
        path: 'items.itemId',
        model: 'Item',
        select: 'category name description images'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ userId });

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
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

// Get in-progress orders (for home screen)
router.get('/inprogress', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({
      userId,
      status: { $in: ['confirmed', 'waiting', 'preparing', 'ready'] }
    })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage businessDetails.currency')
      .sort({ createdAt: -1 });

    // Transform orders to include itemsCount instead of items array
    const ordersWithItemsCount = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.itemsCount = orderObj.items ? orderObj.items.length : 0;
      delete orderObj.items;
      return orderObj;
    });

    res.json({
      success: true,
      message: 'In-progress orders retrieved successfully',
      data: ordersWithItemsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get active orders
router.get('/active', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({
      userId,
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage businessDetails.currency')
      .sort({ createdAt: -1 });

    const ordersWithItemsCount = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.itemsCount = orderObj.items ? orderObj.items.length : 0;
      delete orderObj.items;
      return orderObj;
    });

    res.json({
      success: true,
      message: 'Active orders retrieved successfully',
      data: ordersWithItemsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get completed orders
router.get('/completed', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({
      userId,
      status: 'completed'
    })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage businessDetails.currency')
      .sort({ createdAt: -1 });

    const ordersWithItemsCount = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.itemsCount = orderObj.items ? orderObj.items.length : 0;
      delete orderObj.items;
      return orderObj;
    });

    res.json({
      success: true,
      message: 'Completed orders retrieved successfully',
      data: ordersWithItemsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get cancelled orders
router.get('/cancelled', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({
      userId,
      status: 'cancelled'
    })
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage businessDetails.currency')
      .sort({ createdAt: -1 });

    const ordersWithItemsCount = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.itemsCount = orderObj.items ? orderObj.items.length : 0;
      delete orderObj.items;
      return orderObj;
    });

    res.json({
      success: true,
      message: 'Cancelled orders retrieved successfully',
      data: ordersWithItemsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory businessDetails.currency')
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order details retrieved successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Cancel order
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const { orderId, cancellationReason } = req.body;
    const userId = req.user.userId;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order is already cancelled or completed
    if (order.status === 'cancelled' || order.status === 'refunded') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled', code: 'ALREADY_CANCELLED' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel completed order', code: 'ORDER_COMPLETED' });
    }

    // Only allow free cancellation for 'confirmed' status
    if (order.status === 'confirmed') {
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          status: 'cancelled',
          cancelledBy: 'User',
          cancellationReason,
          refundAmount: order.totalAmount
        }
      });

      return res.json({
        success: true,
        message: 'Order cancelled successfully. Full refund will be processed.',
        refundAmount: order.totalAmount
      });
    }

    // For other statuses, return error with appropriate message
    const errorMessages = {
      preparing: 'Cannot cancel order. Cooking has started. Partial refund (20-80%) may apply - please contact restaurant.',
      ready: 'Cannot cancel order. Food is already prepared. No refund available.',
      served: 'Cannot cancel order. Order has been served.'
    };

    return res.status(400).json({
      success: false,
      message: errorMessages[order.status] || 'Cannot cancel order at this stage',
      code: 'CANCELLATION_NOT_ALLOWED',
      currentStatus: order.status
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;