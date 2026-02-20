const express = require('express');
const router = express.Router();
const Attribute = require('../models/Attribute');
const Restaurant = require('../models/Restaurant');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const authMiddleware = require('../middleware/auth');
const createLog = require('../utils/createLog');

// Get all attributes for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const status = req.query.status?.trim() || '';

    const query = { restaurantId: req.restaurant.restaurantId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.isAvailable = status === 'available';
    }

    const totalCount = await Attribute.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const attributes = await Attribute.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: attributes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create attribute
router.post('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const attribute = new Attribute({ ...req.body, restaurantId: req.restaurant.restaurantId });
    await attribute.save();
    res.status(201).json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update attribute
router.put('/update', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const attribute = await Attribute.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      updateData,
      { new: true }
    );
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    res.json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update attribute status
router.patch('/status', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    const attribute = await Attribute.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    res.json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete attribute
router.delete('/delete', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const attribute = await Attribute.findOneAndDelete({ _id: id, restaurantId: req.restaurant.restaurantId });
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    res.json({ success: true, message: 'Attribute deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all attributes from all restaurants
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { attributeName, isAvailable } = req.query;

    const attributes = await Attribute.find({})
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 });
    
    let transformedAttributes = attributes.map(attribute => {
      const attributeObj = attribute.toObject();
      return {
        ...attributeObj,
        restaurantName: attributeObj.restaurantId.basicInfo?.restaurantName || 'Unknown Restaurant',
        restaurantId: attributeObj.restaurantId._id
      };
    });

    if (attributeName) {
      transformedAttributes = transformedAttributes.filter(a => 
        a.name.toLowerCase().includes(attributeName.toLowerCase())
      );
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      const statusFilter = isAvailable === 'true';
      transformedAttributes = transformedAttributes.filter(a => a.isAvailable === statusFilter);
    }

    const totalCount = transformedAttributes.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedData = transformedAttributes.slice(skip, skip + limit);
    
    res.json({ 
      success: true, 
      data: paginatedData,
      pagination: { page, limit, totalCount, totalPages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all attributes for restaurant
router.post('/admin/get', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, page = 1, limit = 20, attributeName, isAvailable } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { restaurantId };
    if (attributeName) {
      query.name = { $regex: attributeName, $options: 'i' };
    }
    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable;
    }

    const totalCount = await Attribute.countDocuments(query);
    const attributes = await Attribute.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ 
      success: true, 
      data: attributes,
      pagination: { 
        page: pageNum, 
        limit: limitNum, 
        totalCount, 
        totalPages: Math.ceil(totalCount / limitNum) 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create attribute
router.post('/admin', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, ...attributeData } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const attribute = new Attribute({ ...attributeData, restaurantId });
    await attribute.save();
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Attribute',
      'create',
      `Created attribute "${attribute.name}"`,
      restaurant?.basicInfo?.restaurantName,
      attribute.name
    );
    
    res.status(201).json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update attribute
router.put('/admin/update', authMiddleware, async (req, res) => {
  try {
    const { id, restaurantId, ...updateData } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const attribute = await Attribute.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Attribute',
      'update',
      `Updated attribute "${attribute.name}"`,
      restaurant?.basicInfo?.restaurantName,
      attribute.name
    );
    
    res.json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update attribute status
router.patch('/admin/status', authMiddleware, async (req, res) => {
  try {
    const { id, isAvailable, restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const attribute = await Attribute.findOneAndUpdate(
      { _id: id, restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Attribute',
      'status_update',
      `${isAvailable ? 'Enabled' : 'Disabled'} attribute "${attribute.name}"`,
      restaurant?.basicInfo?.restaurantName,
      attribute.name
    );
    
    res.json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete attribute
router.delete('/admin/delete', authMiddleware, async (req, res) => {
  try {
    const { id, restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const attribute = await Attribute.findById(id);
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Attribute',
      'delete',
      `Deleted attribute "${attribute.name}"`,
      restaurant?.basicInfo?.restaurantName,
      attribute.name
    );
    
    await Attribute.findOneAndDelete({ _id: id, restaurantId });
    res.json({ success: true, message: 'Attribute deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;