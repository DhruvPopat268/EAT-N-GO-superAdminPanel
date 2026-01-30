const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const Cart = require('../usersModels/Cart');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');

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
      // If order request was waiting, set order status to waiting and copy waitingTime
      status: orderRequest.status === 'waiting' ? 'waiting' : 'confirmed',
      waitingTime: orderRequest.waitingTime || undefined,
      waitingAt: orderRequest.status === 'waiting' ? new Date() : undefined
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ userId });

    // Update order request with final order id only (keep current status)
    await OrderRequest.findByIdAndUpdate(orderReqId, {
      $set: { 
        finalOrderId: order._id
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

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: processedOrder
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;