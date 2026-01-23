const express = require('express');
const router = express.Router();
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const OrderRequest = require('../usersModels/OrderRequest');
const OrderStatusReason = require('../models/orderReqActionReason');
const { processOrdersWithTotals } = require('../utils/orderHelpers');

// Get all order requests for restaurant
router.get('/all', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orderRequests = await OrderRequest.find({ restaurantId })
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

    res.json({
      success: true,
      message: 'All order requests retrieved successfully',
      data: processedOrderRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get pending order requests
router.get('/pending', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orderRequests = await OrderRequest.find({ 
      restaurantId, 
      status: 'pending' 
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

    res.json({
      success: true,
      message: 'Pending order requests retrieved successfully',
      data: processedOrderRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get confirmed order requests
router.get('/confirmed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orderRequests = await OrderRequest.find({ 
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

    res.json({
      success: true,
      message: 'Confirmed order requests retrieved successfully',
      data: processedOrderRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get rejected order requests
router.get('/rejected', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orderRequests = await OrderRequest.find({ 
      restaurantId, 
      status: 'rejected' 
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

    res.json({
      success: true,
      message: 'Rejected order requests retrieved successfully',
      data: processedOrderRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get waiting order requests
router.get('/waiting', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orderRequests = await OrderRequest.find({ 
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
      .sort({ createdAt: -1 });

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

    res.json({
      success: true,
      message: 'Waiting order requests retrieved successfully',
      data: processedOrderRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get completed order requests
router.get('/completed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const orderRequests = await OrderRequest.find({ 
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

    const processedOrderRequests = await processOrdersWithTotals(orderRequests);

    res.json({
      success: true,
      message: 'Completed order requests retrieved successfully',
      data: processedOrderRequests
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

// Create order status reason
router.post('/action-reasons', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { reasonType, reasonText } = req.body;

    if (!reasonType || !reasonText) {
      return res.status(400).json({ success: false, message: 'reasonType and reasonText are required' });
    }

    const reason = new OrderStatusReason({
      restaurantId,
      reasonType,
      reasonText,
      createdBy: 'restaurant'
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

    const filter = { restaurantId};
    if (reasonType) filter.reasonType = reasonType;

    const reasons = await OrderStatusReason.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Reasons retrieved successfully',
      data: reasons
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

    const reasons = await OrderStatusReason.find(filter).sort({ createdAt: -1 });

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

    const reason = await OrderStatusReason.findOneAndUpdate(
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
      { _id: orderReqId, restaurantId },
      { 
        $set: {
          status: 'confirmed'
        }
      },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found' });
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

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, restaurantId },
      { 
        $set: {
          status: 'rejected',
          orderReqReasonId
        }
      },
      { new: true }
    );

    if (!orderRequest) {
      return res.status(404).json({ success: false, message: 'Order request not found' });
    }

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

    const orderRequest = await OrderRequest.findOneAndUpdate(
      { _id: orderReqId, restaurantId },
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
      return res.status(404).json({ success: false, message: 'Order request not found' });
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

module.exports = router;