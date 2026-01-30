const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/userAuth');
const Cart = require('../usersModels/Cart');
const OrderRequest = require('../usersModels/OrderRequest');
const Restaurant = require('../models/Restaurant');
const { isRestaurantOpen } = require('../utils/restaurantOperatingTiming');

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

// Get user order requests
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orderRequests = await OrderRequest.find({ userId })
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
      .sort({ createdAt: -1 });

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

// Create order request
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { orderType, numberOfGuests, eatTimings, dineInstructions, takeawayTimings, takeawayInstructions } = req.body;
    const userId = req.user.userId;

    // Validate orderType
    if (!orderType || !['dine-in', 'takeaway'].includes(orderType)) {
      return res.status(400).json({ success: false, message: 'Invalid orderType' });
    }

    // Validate required fields
    if (orderType === 'dine-in') {
      if (!numberOfGuests || !eatTimings?.startTime || !eatTimings?.endTime || !dineInstructions) {
        return res.status(400).json({
          success: false,
          message: 'For dine-in orders: numberOfGuests, eatTimings.startTime, eatTimings.endTime and dineInstructions are required'
        });
      }
    } else if (orderType === 'takeaway') {
      if (!takeawayTimings?.startTime || !takeawayTimings?.endTime || !takeawayInstructions) {
        return res.status(400).json({
          success: false,
          message: 'For takeaway orders: takeawayTimings.startTime, takeawayTimings.endTime and takeawayInstructions are required'
        });
      }
    }
    
    // Find user's cart (WITHOUT population here)
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Get restaurant
    const restaurant = await Restaurant.findById(cart.restaurantId);
    if (!restaurant) {
      return res.status(400).json({ success: false, message: 'Restaurant not found' });
    }

    // Check operating hours
    const { openTime, closeTime } = restaurant.basicInfo.operatingHours || {};
    if (openTime && closeTime) {
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

    // Check for existing order request with same configuration
    const existingOrders = await OrderRequest.find({ 
      userId, 
      status: 'pending' 
    });
    
    const duplicateOrder = findExistingOrderRequest(existingOrders, {
      restaurantId: cart.restaurantId,
      orderType,
      eatTimings,
      takeawayTimings,
      items: cart.items
    });
    
    if (duplicateOrder) {
      return res.status(400).json({
        success: false,
        message: 'An order request with the same configuration already exists',
        code: 'DUPLICATE_ORDER_REQUEST'
      });
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
      cartTotal: cart.cartTotal
    });

    await orderRequest.save();

    // Populate the created order request
    const populatedOrderRequest = await OrderRequest.findById(orderRequest._id)
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

    res.status(201).json({
      success: true,
      message: 'Order request created successfully',
      data: processedOrderRequest
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;