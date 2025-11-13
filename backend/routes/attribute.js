const express = require('express');
const router = express.Router();
const Attribute = require('../models/Attribute');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const authMiddleware = require('../middleware/auth');

// Get all attributes for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const attributes = await Attribute.find({ restaurantId: req.restaurant.restaurantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: attributes });
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
    const attributes = await Attribute.find({})
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 });
    
    // Transform the data to include restaurantName and restaurantId
    const transformedAttributes = attributes.map(attribute => {
      const attributeObj = attribute.toObject();
      return {
        ...attributeObj,
        restaurantName: attributeObj.restaurantId.basicInfo?.restaurantName || 'Unknown Restaurant',
        restaurantId: attributeObj.restaurantId._id
      };
    });
    
    res.json({ success: true, data: transformedAttributes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all attributes for restaurant
router.post('/admin/get', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const attributes = await Attribute.find({ restaurantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: attributes });
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
    const attribute = await Attribute.findOneAndDelete({ _id: id, restaurantId });
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    res.json({ success: true, message: 'Attribute deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;