const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Order = require('../usersModels/Order');
const { processOrdersWithTotals } = require('../utils/orderHelpers');
const { buildOrderQuery, orderPopulateConfig } = require('../utils/orderPopulate');

// Get all orders for restaurant
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, search, orderType, status, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId } : {};
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'waiting' } : { status: 'waiting' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'confirmed' } : { status: 'confirmed' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'preparing' } : { status: 'preparing' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'ready' } : { status: 'ready' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'served' } : { status: 'served' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'completed' } : { status: 'completed' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'cancelled' } : { status: 'cancelled' };
    
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

    const orders = await buildOrderQuery(Order, filter, { page, limit });

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
      .populate(orderPopulateConfig);

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