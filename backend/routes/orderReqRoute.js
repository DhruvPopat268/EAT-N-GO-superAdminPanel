const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const OrderRequest = require('../usersModels/OrderRequest');
const { processOrdersWithTotals } = require('../utils/orderHelpers');

// Get all order requests for restaurant
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId } : {};
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

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
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'pending' } : { status: 'pending' };
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

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
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'confirmed' } : { status: 'confirmed' };
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

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
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'waiting' } : { status: 'waiting' };
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

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
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'completed' } : { status: 'completed' };
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

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
    const { restaurantId } = req.query;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = restaurantId ? { restaurantId, status: 'rejected' } : { status: 'rejected' };
    const totalCount = await OrderRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const orderRequests = await OrderRequest.find(filter)
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

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
      });

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found' });
    }

    const processedOrderRequests = await processOrdersWithTotals([orderRequest]);
    const processedOrder = processedOrderRequests[0];

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