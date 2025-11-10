const express = require('express');
const router = express.Router();
const Attribute = require('../models/Attribute');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');

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

module.exports = router;