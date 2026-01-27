const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Order = require('../usersModels/Order');
const { processOrdersWithTotals } = require('../utils/orderHelpers');

// Get all orders for restaurant
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId } : {};
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'All orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get waiting orders
router.get('/waiting', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'waiting' } : { status: 'waiting' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Waiting orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get confirmed orders
router.get('/confirmed', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'confirmed' } : { status: 'confirmed' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Confirmed orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get preparing orders
router.get('/preparing', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'preparing' } : { status: 'preparing' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Preparing orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get ready orders
router.get('/ready', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'ready' } : { status: 'ready' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Ready orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get served orders
router.get('/served', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'served' } : { status: 'served' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Served orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get completed orders
router.get('/completed', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'completed' } : { status: 'completed' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Completed orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get cancelled orders
router.get('/cancelled', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'cancelled' } : { status: 'cancelled' };
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrders = await processOrdersWithTotals(orders);

    res.json({
      success: true,
      message: 'Cancelled orders retrieved successfully',
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/detail/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { restaurantId } = req.query;

    console.log('Fetching details for orderId:', orderId, 'and restaurantId:', restaurantId);

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    const order = await Order.findOne({ _id: orderId, restaurantId })
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

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const processedOrders = await processOrdersWithTotals([order]);
    const processedOrder = processedOrders[0];

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: processedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;