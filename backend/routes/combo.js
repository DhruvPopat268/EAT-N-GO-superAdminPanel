const express = require('express');
const router = express.Router();
const Combo = require('../models/Combo');
const Item = require('../models/Item');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Restaurent <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

router.get('/',restaurantAuthMiddleware, async (req, res) => {
  try {
    const  restaurantId  = req.restaurant.restaurantId;
    const combos = await Combo.find({ restaurantId })
      .populate('items.itemId', 'name images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: combos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get combo details
router.post('/detail',restaurantAuthMiddleware, async (req, res) => {
  try {
    const { comboId } = req.body;
    const restaurantId = req.restaurant.restaurantId;
    const combo = await Combo.findOne({ _id: comboId, restaurantId })
      .populate('items.itemId');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new combo
router.post('/add', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const restaurantId = req.restaurant.restaurantId;
    const { name, description, items, price } = data;
    
    // Validate items exist
    const itemIds = items.map(item => item.itemId);
    const existingItems = await Item.find({ _id: { $in: itemIds }, restaurantId });
    
    if (existingItems.length !== itemIds.length) {
      return res.status(400).json({ success: false, message: 'Some items not found' });
    }
    
    // Auto-determine category based on items
    const hasNonVeg = existingItems.some(item => item.category === 'Non-Veg');
    const category = hasNonVeg ? 'Non-Veg' : 'Veg';
    
    const combo = new Combo({
      restaurantId,
      name,
      description,
      items,
      price,
      category,
      images: req.files ? req.files.map(file => file.path) : []
    });
    
    await combo.save();
    res.json({ success: true, data: combo, message: 'Combo created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update combo
router.put('/update', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { comboId } = data;
    const restaurantId = req.restaurant.restaurantId;
    
    const updateData = { ...data };
    delete updateData.comboId;
    delete updateData.restaurantId;
    
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }
    
    const combo = await Combo.findOneAndUpdate(
      { _id: comboId, restaurantId },
      updateData,
      { new: true }
    ).populate('items.itemId');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo, message: 'Combo updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update combo status
router.patch('/status',restaurantAuthMiddleware, async (req, res) => {
  try {
    const { comboId, isAvailable } = req.body;
    const restaurantId = req.restaurant.restaurantId;
    
    const combo = await Combo.findOneAndUpdate(
      { _id: comboId, restaurantId },
      { isAvailable },
      { new: true }
    );
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo, message: 'Combo status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete combo
router.delete('/delete',restaurantAuthMiddleware, async (req, res) => {
  try {
    const { comboId } = req.body;
    const restaurantId = req.restaurant.restaurantId;
    
    const combo = await Combo.findOneAndDelete({ _id: comboId, restaurantId });
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, message: 'Combo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all combos for a restaurant
router.post('/admin',authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const combos = await Combo.find({ restaurantId })
      .populate('items.itemId', 'name images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: combos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get combo details
router.post('/admin/detail',authMiddleware, async (req, res) => {
  try {
    const { comboId, restaurantId } = req.body;
    const combo = await Combo.findOne({ _id: comboId, restaurantId })
      .populate('items.itemId');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new combo
router.post('/admin/add',authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { restaurantId, name, description, items, price } = data;
    
    // Validate items exist
    const itemIds = items.map(item => item.itemId);
    const existingItems = await Item.find({ _id: { $in: itemIds }, restaurantId });
    
    if (existingItems.length !== itemIds.length) {
      return res.status(400).json({ success: false, message: 'Some items not found' });
    }
    
    // Auto-determine category based on items
    const hasNonVeg = existingItems.some(item => item.category === 'Non-Veg');
    const category = hasNonVeg ? 'Non-Veg' : 'Veg';
    
    const combo = new Combo({
      restaurantId,
      name,
      description,
      items,
      price,
      category,
      images: req.files ? req.files.map(file => file.path) : []
    });
    
    await combo.save();
    res.json({ success: true, data: combo, message: 'Combo created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update combo
router.put('/admin/update',authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { comboId, restaurantId } = data;
    
    const updateData = { ...data };
    delete updateData.comboId;
    delete updateData.restaurantId;
    
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }
    
    const combo = await Combo.findOneAndUpdate(
      { _id: comboId, restaurantId },
      updateData,
      { new: true }
    ).populate('items.itemId');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo, message: 'Combo updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update combo status
router.patch('/admin/status',authMiddleware, async (req, res) => {
  try {
    const { comboId, restaurantId, isAvailable } = req.body;
    
    const combo = await Combo.findOneAndUpdate(
      { _id: comboId, restaurantId },
      { isAvailable },
      { new: true }
    );
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo, message: 'Combo status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete combo
router.delete('/admin/delete', async (req, res) => {
  try {
    const { comboId, restaurantId } = req.body;
    
    const combo = await Combo.findOneAndDelete({ _id: comboId, restaurantId });
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, message: 'Combo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;