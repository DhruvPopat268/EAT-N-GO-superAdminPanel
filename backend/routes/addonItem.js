const express = require('express');
const router = express.Router();
const AddonItem = require('../models/AddonItem');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Get all addon items for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const addonItems = await AddonItem.find({ restaurantId: req.restaurant.restaurantId }).populate('subcategory').sort({ createdAt: -1 });
    res.json({ success: true, data: addonItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create addon item
router.post('/', restaurantAuthMiddleware, upload.single('image'), async (req, res) => {
  try {
    const addonData = JSON.parse(req.body.data || '{}');
    addonData.restaurantId = req.restaurant.restaurantId;

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'addon-images');
      addonData.image = imageUrl;
    }

    const addonItem = new AddonItem(addonData);
    await addonItem.save();
    await addonItem.populate('subcategory');
    res.status(201).json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// Update addon item
router.put('/update', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const updateData = JSON.parse(req.body.data || '{}');
    const { id } = updateData;
    delete updateData.id;

    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'addon-images'))
      );
      updateData.images = imageUrls;
    }

    const addonItem = await AddonItem.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      updateData,
      { new: true }
    ).populate('subcategory');
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    res.json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update addon item status
router.patch('/status', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    const addonItem = await AddonItem.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      { isAvailable },
      { new: true }
    ).populate('subcategory');
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    res.json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete addon item
router.delete('/delete', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const addonItem = await AddonItem.findOneAndDelete({ _id: id, restaurantId: req.restaurant.restaurantId });
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    res.json({ success: true, message: 'Addon item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all addon items for restaurant
router.post('/admin/list', async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const addonItems = await AddonItem.find({ restaurantId }).populate('subcategory').sort({ createdAt: -1 });
    res.json({ success: true, data: addonItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create addon item
router.post('/admin', upload.single('image'), async (req, res) => {
  try {
    const addonData = JSON.parse(req.body.data || '{}');

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'addon-images');
      addonData.image = imageUrl;
    }

    const addonItem = new AddonItem(addonData);
    await addonItem.save();
    await addonItem.populate('subcategory');
    res.status(201).json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update addon item
router.put('/admin/update', upload.single('image'), async (req, res) => {
  try {
    const updateData = JSON.parse(req.body.data || '{}');
    const { id, restaurantId } = updateData;
    delete updateData.id;
    delete updateData.restaurantId;

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'addon-images');
      updateData.image = imageUrl;
    }

    const addonItem = await AddonItem.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    ).populate('subcategory');
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    res.json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update addon item status
router.patch('/admin/status', async (req, res) => {
  try {
    const { id, isAvailable, restaurantId } = req.body;
    const addonItem = await AddonItem.findOneAndUpdate(
      { _id: id, restaurantId },
      { isAvailable },
      { new: true }
    ).populate('subcategory');
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    res.json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete addon item
router.delete('/admin/delete', async (req, res) => {
  try {
    const { id, restaurantId } = req.body;
    const addonItem = await AddonItem.findOneAndDelete({ _id: id, restaurantId });
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    res.json({ success: true, message: 'Addon item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;