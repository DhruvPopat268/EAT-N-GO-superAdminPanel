const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const Cart = require('../usersModels/Cart');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');
const User = require('../usersModels/usersModel');
const { emitOrderToRestaurant } = require('../utils/socketUtils');

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

    // Check if user has other active order requests
    const otherActiveOrderReq = await OrderRequest.findOne({
      userId,
      _id: { $ne: orderReqId },
      status: { $in: ['pending', 'confirmed', 'waiting'] }
    });

    if (otherActiveOrderReq) {
      return res.status(400).json({
        success: false,
        message: `You have another order request (${otherActiveOrderReq.status}) that needs attention. Please complete or cancel that order request first.`,
        code: 'OTHER_ORDER_REQUEST_ACTIVE'
      });
    }

    // Validate timing - user cannot place order during their specified time slot
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    let timings;
    if (orderRequest.orderType === 'dine-in') {
      timings = orderRequest.eatTimings;
    } else if (orderRequest.orderType === 'takeaway') {
      timings = orderRequest.takeawayTimings;
    }

    if (timings && timings.startTime && timings.endTime) {
      const startTime = timings.startTime.slice(0, 5); // Extract HH:MM
      const endTime = timings.endTime.slice(0, 5); // Extract HH:MM

      // Check if current time is within the specified time slot
      if (currentTime >= startTime && currentTime <= endTime) {
        // Auto-cancel the order request
        await OrderRequest.findByIdAndUpdate(orderReqId, {
          $set: {
            status: 'cancelled',
            cancelledBy: 'System'
          }
        });

        return res.status(400).json({
          success: false,
          message: `You cannot place order during your specified time slot (${timings.startTime} - ${timings.endTime}). Order request has been cancelled.`,
          code: 'ORDER_DURING_TIME_SLOT'
        });
      }

      // Check if the time slot has already passed
      if (currentTime > endTime) {
        // Auto-cancel the order request
        await OrderRequest.findByIdAndUpdate(orderReqId, {
          $set: {
            status: 'cancelled',
            cancelledBy: 'System'
          }
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

    // Compare cart items with order request items
    const itemsMatch = compareItemsConfiguration(cart.items, orderRequest.items);
    if (!itemsMatch) {
      return res.status(400).json({
        success: false,
        message: 'Cart items do not match order request items',
        code: 'CART_ITEMS_MISMATCH'
      });
    }

    // Use cart total directly from database
    const cartTotal = cart.cartTotal || 0;

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
      totalAmount: cartTotal,
      cartTotal,
      status: 'confirmed'
    });

    await order.save();

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
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage')
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
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage')
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
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage')
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
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory contactDetails.address contactDetails.city contactDetails.state contactDetails.country contactDetails.pincode contactDetails.phone contactDetails.latitude contactDetails.longitude basicInfo.operatingHours documents.primaryImage')
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
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.foodCategory')
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