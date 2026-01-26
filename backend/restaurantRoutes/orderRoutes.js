const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');
const { processOrdersWithTotals } = require('../utils/orderHelpers');

// Get all orders for restaurant
router.get('/all', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/waiting', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'waiting' });
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find({ 
      restaurantId, 
      status: 'waiting' 
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
router.get('/confirmed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'confirmed' });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/preparing', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'preparing' });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/ready', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'ready' });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/served', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'served' });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/completed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'completed' });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/cancelled', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ restaurantId, status: 'cancelled' });
    const totalPages = Math.ceil(totalCount / limit);

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
router.get('/detail/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

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

// Update order status to confirmed (from waiting)
router.patch('/confirm/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, status: 'waiting' },
      { status: 'confirmed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or cannot be confirmed' });
    }

    // Update corresponding order request status to completed
    await OrderRequest.findByIdAndUpdate(order.orderRequestId, {
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Order confirmed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update order status to preparing
router.patch('/preparing/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, status: 'confirmed' },
      { status: 'preparing' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or cannot be updated to preparing' });
    }

    res.json({
      success: true,
      message: 'Order status updated to preparing',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update order status to ready
router.patch('/ready/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, status: 'preparing' },
      { status: 'ready' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or cannot be updated to ready' });
    }

    res.json({
      success: true,
      message: 'Order status updated to ready',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update order status to served
router.patch('/served/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, status: 'ready', orderType: 'dine-in' },
      { status: 'served' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found, cannot be updated to served, or not a dine-in order' });
    }

    res.json({
      success: true,
      message: 'Order status updated to served',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update order status to completed
router.patch('/completed/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, status: { $in: ['served', 'ready'] } },
      { status: 'completed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or cannot be updated to completed' });
    }

    res.json({
      success: true,
      message: 'Order status updated to completed',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Cancel order
router.patch('/cancel/:orderId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, status: { $in: ['confirmed', 'preparing'] } },
      { status: 'cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or cannot be cancelled' });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;