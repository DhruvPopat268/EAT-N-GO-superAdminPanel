const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const authMiddleware = require('../middleware/auth');

// Get all items for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ restaurantId: req.restaurant.restaurantId })
      .populate('subcategory', 'name')
      .populate('attributes.attribute', 'name')
      .sort({ createdAt: -1 });

    // Transform attributes array
    const formattedItems = items.map(item => ({
      ...item.toObject(),
      attributes: item.attributes.map(attr => ({
        _id: attr.attribute?._id,
        name: attr.attribute?.name,
        price: attr.price,
      })),
    }));

    res.json({ success: true, data: formattedItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create item
router.post('/', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const itemData = JSON.parse(req.body.data || '{}');
    itemData.restaurantId = req.restaurant.restaurantId;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'item-images'))
      );
      itemData.images = imageUrls;
    }
    
    const item = new Item(itemData);
    await item.save();
    await item.populate('subcategory');
    await item.populate('attributes.attribute');
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update item
router.put('/update', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const updateData = JSON.parse(req.body.data || '{}');
    const { itemId } = updateData;
    delete updateData.itemId;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'item-images'))
      );
      updateData.images = imageUrls;
    }
    
    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurantId: req.restaurant.restaurantId },
      updateData,
      { new: true }
    ).populate('subcategory').populate('attributes.attribute');
    // console.log(item);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get item detail by ID
router.post('/detail', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await Item.findOne({ _id: itemId, restaurantId: req.restaurant.restaurantId })
      .populate('subcategory', 'name')
      .populate('attributes.attribute', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update item status
router.patch('/status', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { itemId, isAvailable } = req.body;
    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurantId: req.restaurant.restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete item
router.delete('/delete', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await Item.findOneAndDelete({ _id: itemId, restaurantId: req.restaurant.restaurantId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all items for restaurant
router.post('/admin', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const items = await Item.find({ restaurantId })
      .populate('subcategory', 'name')
      .populate('attributes.attribute', 'name')
      .sort({ createdAt: -1 });

    // Transform attributes array
    const formattedItems = items.map(item => ({
      ...item.toObject(),
      attributes: item.attributes.map(attr => ({
        _id: attr.attribute?._id,
        name: attr.attribute?.name,
        price: attr.price,
      })),
    }));

    res.json({ success: true, data: formattedItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create item
router.post('/admin/create', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const itemData = JSON.parse(req.body.data || '{}');
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'item-images'))
      );
      itemData.images = imageUrls;
    }
    
    const item = new Item(itemData);
    await item.save();
    await item.populate('subcategory');
    await item.populate('attributes.attribute');
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update item
router.put('/admin/update', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const updateData = JSON.parse(req.body.data || '{}');
    const { itemId, restaurantId } = updateData;
    delete updateData.itemId;
    delete updateData.restaurantId;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'item-images'))
      );
      updateData.images = imageUrls;
    }
    
    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurantId },
      updateData,
      { new: true }
    ).populate('subcategory').populate('attributes.attribute');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//Get items by restaurant ID
router.post('/admin/byRestaurant', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const items = await Item.find({ restaurantId })
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get item detail by ID
router.post('/admin/detail', authMiddleware, async (req, res) => {
  try {
    const { itemId, restaurantId } = req.body;
    const item = await Item.findOne({ _id: itemId, restaurantId })
      .populate('subcategory', 'name')
      .populate('attributes.attribute', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update item status
router.patch('/admin/status', authMiddleware, async (req, res) => {
  try {
    const { itemId, isAvailable, restaurantId } = req.body;
    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete item
router.delete('/admin/delete', authMiddleware, async (req, res) => {
  try {
    const { itemId, restaurantId } = req.body;
    const item = await Item.findOneAndDelete({ _id: itemId, restaurantId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;