const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const Order = require('../usersModels/Order');
const OrderRequest = require('../usersModels/OrderRequest');
const Payment = require('../models/Payment');
const User = require('../usersModels/usersModel');
const OrderCancelRefund = require('../restaurantModels/OrderCancelRefund');
const { handleOrderCompletion, handlePayAtRestaurantCompletion } = require('../utils/depositTestingHandler');
const { handleRestaurantCancellationOnline } = require('../utils/orderCancellationSettlement');

// Get all orders for restaurant
router.get('/all', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, status, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add status filter
    if (status && ['confirmed', 'waiting', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'refunded'].includes(status)) {
      filter.status = status;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'waiting' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'confirmed' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'preparing' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'ready' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'served' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'completed' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'cancelled' };
    
    // Add orderType filter
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(filter)
      .populate('userId', 'fullName phone')
      .populate('userRatingId', 'rating feedback createdAt')
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

    const processedOrders = orders.map(order => order.toObject());

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
        path: 'userRatingId',
        select: 'restaurantRating itemRatings createdAt',
        populate: {
          path: 'itemRatings.itemId',
          model: 'Item',
          select: 'name'
        }
      })
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
      .populate('appliedCoupon.couponId', 'name couponCode discountType amount maxDiscount');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const processedOrder = order.toObject();

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
  const session = await mongoose.startSession();
  
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.restaurantId;

    await session.startTransaction();

    const order = await Order.findOne({
      _id: orderId,
      restaurantId,
      $or: [
        { status: 'served' },
        { status: 'ready', orderType: 'takeaway' }
      ]
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Order not found or cannot be updated to completed' });
    }

    // Check if already settled to prevent duplicate settlement
    if (order.settlement?.status === 'settled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Order already settled' });
    }

    // Handle settlement based on payment method
    if (order.paymentMethod === 'online' && order.paymentId) {
      try {
        const settlementResult = await handleOrderCompletion(order);
        console.log('Online payment settlement completed:', settlementResult.settlement);
      } catch (settlementError) {
        await session.abortTransaction();
        session.endSession();
        console.error('Settlement failed - transaction rolled back:', settlementError);
        return res.status(500).json({
          success: false,
          message: 'Settlement failed. Order status not changed. Please retry or contact support.',
          error: settlementError.message
        });
      }
    } else if (order.paymentMethod === 'pay_at_restaurant') {
      try {
        const settlementResult = await handlePayAtRestaurantCompletion(order);
        console.log('Pay at restaurant settlement completed:', settlementResult.settlement);
      } catch (settlementError) {
        await session.abortTransaction();
        session.endSession();
        console.error('Pay at restaurant settlement failed - transaction rolled back:', settlementError);
        return res.status(500).json({
          success: false,
          message: 'Commission settlement failed. Order status not changed. Please retry or contact support.',
          error: settlementError.message
        });
      }
    }

    // Only update order status after successful settlement
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Order status updated to completed',
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Order completion error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Cancel order
router.patch('/cancel', restaurantAuthMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { orderId, cancellationReasonId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    if (!orderId || !cancellationReasonId) {
      return res.status(400).json({ success: false, message: 'orderId and cancellationReasonId are required' });
    }

    await session.startTransaction();

    const order = await Order.findOne(
      { _id: orderId, restaurantId, status: { $in: ['confirmed', 'preparing', 'ready', 'served'] } }
    ).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Order not found or cannot be cancelled from current status' });
    }

    // For restaurant cancellation: No new cancellation charges, only handle appliedPendingCancellationCharges
    const appliedPendingCharges = order.appliedPendingCancellationCharges || 0;
    let refundAmount;
    let willAddInPendingCancellationCharges = 0;

    // Handle based on payment method
    if (order.paymentMethod === 'online' && order.paymentId) {
      const payment = await Payment.findById(order.paymentId).session(session);
      
      if (!payment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: 'Payment record not found for online order. Cannot proceed with cancellation.',
          code: 'PAYMENT_NOT_FOUND'
        });
      }
      
      if (payment.status !== 'success') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: `Payment status is ${payment.status}. Cannot refund non-successful payment.`,
          code: 'INVALID_PAYMENT_STATUS'
        });
      }

      // Deduct only appliedPendingCharges from online payment, refund the rest
      if (appliedPendingCharges > order.totalAmount) {
        // If applied charges exceed total amount, deduct full amount and store remaining in pending
        refundAmount = 0;
        willAddInPendingCancellationCharges = appliedPendingCharges - order.totalAmount;
      } else {
        // Normal case: Refund = totalAmount - appliedPendingCharges
        refundAmount = order.totalAmount - appliedPendingCharges;
        willAddInPendingCancellationCharges = 0;
      }
      
      // Update payment status
      payment.status = refundAmount > 0 ? 'refunded' : 'cancelled';
      if (refundAmount > 0) {
        payment.refund = {
          amount: refundAmount,
          currency: order.currency?.code || payment.actual.currency,
          reason: 'Order cancelled by restaurant',
          refundedAt: new Date()
        };
      }
      await payment.save({ session });
      
      // Handle settlement - split cancellation charges between admin and restaurant
      if (appliedPendingCharges > 0) {
        try {
          await handleRestaurantCancellationOnline(order, refundAmount, appliedPendingCharges);
        } catch (settlementError) {
          await session.abortTransaction();
          session.endSession();
          console.error('Cancellation settlement failed:', settlementError);
          return res.status(500).json({
            success: false,
            message: 'Cancellation settlement failed. Please retry or contact support.',
            error: settlementError.message
          });
        }
      }
      
      // Update order
      order.status = refundAmount > 0 ? 'refunded' : 'cancelled';
      order.cancelledBy = 'Restaurant';
      order.cancellationReasonId = cancellationReasonId;
      order.refundAmount = refundAmount;
      order.cancellationCharges = 0; // No new cancellation charges for restaurant cancellation
      await order.save({ session });

      // Add remaining charges to user's pending balance if any
      if (willAddInPendingCancellationCharges > 0) {
        await User.findByIdAndUpdate(
          order.userId,
          { $inc: { pendingOrderCancellationCharges: willAddInPendingCancellationCharges } },
          { session }
        );
      }
      
      await session.commitTransaction();
      session.endSession();
      
      return res.json({
        success: true,
        message: refundAmount > 0 
          ? `Order cancelled. Refund of ${refundAmount} will be processed${willAddInPendingCancellationCharges > 0 ? `. Remaining pending charges of ${willAddInPendingCancellationCharges} added to user's balance.` : '.'}`
          : `Order cancelled. Applied pending charges of ${appliedPendingCharges} ${willAddInPendingCancellationCharges > 0 ? `exceeded payment. Remaining ${willAddInPendingCancellationCharges} added to user's pending balance.` : 'deducted from payment.'}`,
        data: order,
        refundAmount,
        appliedPendingCharges,
        willAddInPendingCancellationCharges
      });
    } else if (order.paymentMethod === 'pay_at_restaurant') {
      // For pay_at_restaurant: Return appliedPendingCharges back to user's pending balance
      willAddInPendingCancellationCharges = appliedPendingCharges;
      refundAmount = 0;

      // Update order
      order.status = 'cancelled';
      order.cancelledBy = 'Restaurant';
      order.cancellationReasonId = cancellationReasonId;
      order.refundAmount = 0;
      order.cancellationCharges = 0; // No new cancellation charges for restaurant cancellation
      await order.save({ session });

      // Return appliedPendingCharges back to user's pending balance
      if (willAddInPendingCancellationCharges > 0) {
        await User.findByIdAndUpdate(
          order.userId,
          { $inc: { pendingOrderCancellationCharges: willAddInPendingCancellationCharges } },
          { session }
        );
      }
      
      await session.commitTransaction();
      session.endSession();

      return res.json({
        success: true,
        message: willAddInPendingCancellationCharges > 0
          ? `Order cancelled. Applied pending charges of ${willAddInPendingCancellationCharges} returned to user's pending balance.`
          : 'Order cancelled successfully.',
        data: order,
        refundAmount: 0,
        appliedPendingCharges,
        willAddInPendingCancellationCharges
      });
    }
    
    // Fallback (should not reach here)
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, message: 'Invalid payment method' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;