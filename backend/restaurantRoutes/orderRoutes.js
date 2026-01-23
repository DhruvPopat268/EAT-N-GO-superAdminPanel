const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const Order = require('../usersModels/Order');
const { processOrdersWithTotals } = require('../utils/orderHelpers');

// Get all orders for restaurant
router.get('/all', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ restaurantId })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'All orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get confirmed orders
router.get('/confirmed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ 
      restaurantId, 
      status: 'confirmed' 
    })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Confirmed orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get preparing orders
router.get('/preparing', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ 
      restaurantId, 
      status: 'preparing' 
    })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Preparing orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get ready orders
router.get('/ready', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ 
      restaurantId, 
      status: 'ready' 
    })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Ready orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get served orders
router.get('/served', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ 
      restaurantId, 
      status: 'served' 
    })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Served orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get completed orders
router.get('/completed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ 
      restaurantId, 
      status: 'completed' 
    })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Completed orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get cancelled orders
router.get('/cancelled', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orders = await Order.find({ 
      restaurantId, 
      status: 'cancelled' 
    })
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
      })
      .sort({ createdAt: -1 });

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Cancelled orders retrieved successfully',
      data: processedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;