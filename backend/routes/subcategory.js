const express = require('express');
const router = express.Router();
const Subcategory = require('../models/Subcategory');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const authMiddleware = require('../middleware/auth');

// Get all subcategories for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ restaurantId: req.restaurant.restaurantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create subcategory
router.post('/', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const subcategoryData = { ...req.body, restaurantId: req.restaurant.restaurantId };
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'subcategory-images'))
      );
      subcategoryData.images = imageUrls;
    }
    
    const subcategory = new Subcategory(subcategoryData);
    await subcategory.save();
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subcategory
router.put('/update', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'subcategory-images'))
      );
      updateData.images = imageUrls;
    }
    
    const subcategory = await Subcategory.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      updateData,
      { new: true }
    );
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subcategory status
router.patch('/status', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    
    const subcategory = await Subcategory.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    // Update all related items and addon items
    const Item = require('../models/Item');
    const AddonItem = require('../models/AddonItem');
    
    await Promise.all([
      Item.updateMany(
        { subcategory: id, restaurantId: req.restaurant.restaurantId },
        { isAvailable }
      ),
      AddonItem.updateMany(
        { subcategory: id, restaurantId: req.restaurant.restaurantId },
        { isAvailable }
      )
    ]);
    
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete subcategory
router.delete('/delete', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const subcategory = await Subcategory.findOneAndDelete({ _id: id, restaurantId: req.restaurant.restaurantId });
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all subcategories for restaurant
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ restaurantId: req.restaurant.restaurantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create subcategory
router.post('/admin', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const subcategoryData = { ...req.body, restaurantId: req.restaurant.restaurantId };
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'subcategory-images'))
      );
      subcategoryData.images = imageUrls;
    }
    
    const subcategory = new Subcategory(subcategoryData);
    await subcategory.save();
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subcategory
router.put('/admin/update', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'subcategory-images'))
      );
      updateData.images = imageUrls;
    }
    
    const subcategory = await Subcategory.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      updateData,
      { new: true }
    );
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subcategory status
router.patch('/admin/status', authMiddleware, async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    
    const subcategory = await Subcategory.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    // Update all related items and addon items
    const Item = require('../models/Item');
    const AddonItem = require('../models/AddonItem');
    
    await Promise.all([
      Item.updateMany(
        { subcategory: id, restaurantId: req.restaurant.restaurantId },
        { isAvailable }
      ),
      AddonItem.updateMany(
        { subcategory: id, restaurantId: req.restaurant.restaurantId },
        { isAvailable }
      )
    ]);
    
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete subcategory
router.delete('/admin/delete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const subcategory = await Subcategory.findOneAndDelete({ _id: id, restaurantId: req.restaurant.restaurantId });
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;