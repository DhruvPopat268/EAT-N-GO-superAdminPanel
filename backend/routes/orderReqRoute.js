const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const OrderRequest = require('../usersModels/OrderRequest');
const { buildOrderQuery, orderPopulateConfig } = require('../utils/orderPopulate');

// Get all order requests for restaurant
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
    if (status && ['pending', 'confirmed', 'rejected', 'waiting', 'completed'].includes(status)) {
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
        endDateTime.setHours(23, 59, 59, 999); // Set to end of day
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }
    
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await buildOrderQuery(OrderRequest, filter, { page, limit });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'All order requests retrieved successfully',
      data: processedOrderRequests,
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

// Get pending order requests
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'pending' } : { status: 'pending' };
    
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }
    
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await buildOrderQuery(OrderRequest, filter, { page, limit });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Pending order requests retrieved successfully',
      data: processedOrderRequests,
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

// Get confirmed order requests
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }
    
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await buildOrderQuery(OrderRequest, filter, { page, limit });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Confirmed order requests retrieved successfully',
      data: processedOrderRequests,
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

// Get waiting order requests
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }
    
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await buildOrderQuery(OrderRequest, filter, { page, limit });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Waiting order requests retrieved successfully',
      data: processedOrderRequests,
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

// Get completed order requests
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }
    
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await buildOrderQuery(OrderRequest, filter, { page, limit });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Completed order requests retrieved successfully',
      data: processedOrderRequests,
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

// Get rejected order requests
router.get('/rejected', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, search, orderType, startDate, endDate } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'rejected' } : { status: 'rejected' };
    
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }
    
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await buildOrderQuery(OrderRequest, filter, { page, limit });

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Rejected order requests retrieved successfully',
      data: processedOrderRequests,
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

// Get order request by orderReqId
router.get('/by-id', authMiddleware, async (req, res) => {
  try {
    const { orderReqId, restaurantId } = req.query;

    if (!orderReqId) {
      return res.status(400).json({ success: false, message: 'orderReqId is required' });
    }

    const filter = { _id: orderReqId };
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    const orderRequest = await OrderRequest.findOne(filter)
      .populate(orderPopulateConfig);

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found' });
    }

    const processedOrder = orderRequest.toObject();

    res.json({
      success: true,
      message: 'Order request retrieved successfully',
      data: processedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;