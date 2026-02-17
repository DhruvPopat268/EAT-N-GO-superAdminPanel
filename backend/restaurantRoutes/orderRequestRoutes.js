const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const OrderRequest = require('../usersModels/OrderRequest');
const OrderActionReason = require('../models/OrderActionReason');
const Cart = require('../usersModels/Cart');

// Get all order requests for restaurant
router.get('/all', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, status, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { restaurantId };
    
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

    const orderRequests = await OrderRequest.find(filter)
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
router.get('/pending', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'pending' };
    
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

    const orderRequests = await OrderRequest.find(filter)
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
router.get('/confirmed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// Get rejected order requests
router.get('/rejected', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'rejected' };
    
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

    const orderRequests = await OrderRequest.find(filter)
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// Get waiting order requests
router.get('/waiting', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
router.get('/completed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
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
        { orderRequestNo: { $regex: searchRegex } },
        { 'userId.fullName': { $regex: searchRegex } },
        { 'userId.phone': { $regex: searchRegex } }
      ];
    }

    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// Get cancelled order requests
router.get('/cancelled', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { search, orderType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { restaurantId, status: 'cancelled' };
    
    if (orderType && ['dine-in', 'takeaway'].includes(orderType)) {
      filter.orderType = orderType;
    }
    
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

    const orderRequests = await OrderRequest.find(filter)
      .populate('userId', 'fullName phone')
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
      .populate('orderReqReasonId', 'reasonType reasonText').sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const processedOrderRequests = orderRequests.map(order => order.toObject());

    res.json({
      success: true,
      message: 'Cancelled order requests retrieved successfully',
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
router.get('/by-id', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { orderReqId } = req.query;
    const restaurantId = req.restaurant.restaurantId;

    if (!orderReqId) {
      return res.status(400).json({ success: false, message: 'orderReqId is required' });
    }

    const orderRequest = await OrderRequest.findOne({ 
      _id: orderReqId, 
      restaurantId 
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
      });

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

// Create order status reason
router.post('/action-reasons', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { reasonType, reasonText } = req.body;

    if (!reasonType || !reasonText) {
      return res.status(400).json({ success: false, message: 'reasonType and reasonText are required' });
    }

    const reason = new OrderActionReason({
      restaurantId,
      reasonType,
      reasonText
    });

    await reason.save();

    res.json({
      success: true,
      message: 'Reason created successfully',
      data: reason
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get order status reasons
router.get('/action-reasons', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { reasonType } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { restaurantId};
    if (reasonType) filter.reasonType = reasonType;

    const totalCount = await OrderActionReason.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const reasons = await OrderActionReason.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      message: 'Reasons retrieved successfully',
      data: reasons,
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

// Get active order status reasons
router.get('/active-reasons', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { reasonType } = req.query;

    const filter = { restaurantId, isActive: true };
    if (reasonType) filter.reasonType = reasonType;

    const reasons = await OrderActionReason.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Active reasons retrieved successfully',
      data: reasons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update order status reason
router.patch('/action-reasons/:reasonId', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { reasonId } = req.params;
    const { reasonText, isActive } = req.body;

    const updateData = {};
    if (reasonText !== undefined) updateData.reasonText = reasonText;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const reason = await OrderActionReason.findOneAndUpdate(
      { _id: reasonId, restaurantId },
      { $set: updateData },
      { new: true }
    );

    if (!reason) {
      return res.status(404).json({ success: false, message: 'Reason not found' });
    }

    res.json({
      success: true,
      message: 'Reason updated successfully',
      data: reason
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Confirm order request
router.patch('/confirm', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { orderReqId } = req.body;

    if (!orderReqId) {
      return res.status(400).json({ success: false, message: 'orderReqId is required' });
    }

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, restaurantId, status: { $in: ['pending', 'waiting'] } },
      { 
        $set: {
          status: 'confirmed'
        }
      },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found or cannot be confirmed from current status' });
    }

    res.json({
      success: true,
      message: 'Order request confirmed successfully',
      data: orderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Reject order request
router.patch('/reject', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { orderReqId, orderReqReasonId } = req.body;

    if (!orderReqId || !orderReqReasonId) {
      return res.status(400).json({ success: false, message: 'orderReqId and orderReqReasonId are required' });
    }

    // Validate reason ownership, type, and active status
    const reason = await OrderActionReason.findOne({
      _id: orderReqReasonId,
      restaurantId,
      isActive: true,
      reasonType: 'rejected'
    });

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive rejection reason' });
    }

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, restaurantId, status: { $in: ['pending', 'waiting'] } },
      { 
        $set: {
          status: 'rejected',
          orderReqReasonId
        }
      },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found or cannot be rejected from current status' });
    }

    // Delete the cart
    await Cart.findOneAndDelete({ userId: orderRequest.userId });

    res.json({
      success: true,
      message: 'Order request rejected successfully',
      data: orderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Set order request to waiting
router.patch('/waiting', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { orderReqId, orderReqReasonId, waitingTime } = req.body;

    if (!orderReqId || !orderReqReasonId || waitingTime == null)  {
      return res.status(400).json({ success: false, message: 'orderReqId, orderReqReasonId and waitingTime are required' });
    }

    if (waitingTime <= 0) {
      return res.status(400).json({ success: false, message: 'waitingTime must be greater than 0' });
    }

    // Validate reason ownership, type, and active status
    const reason = await OrderActionReason.findOne({
      _id: orderReqReasonId,
      restaurantId,
      isActive: true,
      reasonType: 'waiting'
    });

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive waiting reason' });
    }

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, restaurantId, status: 'pending' },
      { 
        $set: {
          status: 'waiting',
          orderReqReasonId,
          waitingTime
        }
      },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found or cannot be set to waiting from current status' });
    }

    res.json({
      success: true,
      message: 'Order request set to waiting successfully',
      data: orderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Cancel order request
router.patch('/cancel', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { orderReqId, orderReqReasonId } = req.body;

    if (!orderReqId || !orderReqReasonId) {
      return res.status(400).json({ success: false, message: 'orderReqId and orderReqReasonId are required' });
    }

    // Validate reason ownership, type, and active status
    const reason = await OrderActionReason.findOne({
      _id: orderReqReasonId,
      restaurantId,
      isActive: true,
      reasonType: 'cancelled'
    });

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive cancellation reason' });
    }

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, restaurantId, status: { $in: ['pending', 'confirmed', 'waiting'] } },
      { 
        $set: {
          status: 'cancelled',
          cancelledBy: 'Restaurant',
          orderReqReasonId
        }
      },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found or cannot be cancelled from current status' });
    }

    // Delete the cart
    await Cart.findOneAndDelete({ userId: orderRequest.userId });

    res.json({
      success: true,
      message: 'Order request cancelled successfully',
      data: orderRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;