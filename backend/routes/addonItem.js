const express = require('express');
const router = express.Router();
const AddonItem = require('../models/AddonItem');
const Restaurant = require('../models/Restaurant');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const createLog = require('../utils/createLog');

// Get all addon items for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const totalCount = await AddonItem.countDocuments({ restaurantId: req.restaurant.restaurantId });
    const totalPages = Math.ceil(totalCount / limit);

    const addonItems = await AddonItem.find({ restaurantId: req.restaurant.restaurantId })
    .populate([
      {
        path: 'subcategory',
        select: 'category name isAvailable',
      },
      {
        path: 'attributes.attribute',
        select: 'name ',
      }
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      data: addonItems,
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
    const { id, status } = req.body;
    console.log(req.body);
    const addonItem = await AddonItem.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurant.restaurantId },
      { isAvailable: status },
      { new: true }
    ).populate('subcategory');
    console.log(addonItem);
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

// Get all addon items from all restaurants
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const addonItems = await AddonItem.find({})
      .populate('restaurantId', 'basicInfo.restaurantName')
      .populate([
      {
        path: 'subcategory',
        select: 'category name isAvailable',
      },
      {
        path: 'attributes.attribute',
        select: 'name ',
      }
    ])
      .sort({ createdAt: -1 });
    
    // Transform the data to include restaurantName and restaurantId
    const transformedAddonItems = addonItems.map(addonItem => {
      const addonItemObj = addonItem.toObject();
      return {
        ...addonItemObj,
        restaurantName: addonItemObj.restaurantId.basicInfo?.restaurantName || 'Unknown Restaurant',
        restaurantId: addonItemObj.restaurantId._id
      };
    });
    
    res.json({ success: true, data: transformedAddonItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all addon items for restaurant
router.post('/admin/list', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const addonItems = await AddonItem.find({ restaurantId }).populate('subcategory').sort({ createdAt: -1 });
    res.json({ success: true, data: addonItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create addon item
router.post('/admin', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const addonData = JSON.parse(req.body.data || '{}');

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'addon-images');
      addonData.image = imageUrl;
    }

    const addonItem = new AddonItem(addonData);
    await addonItem.save();
    await addonItem.populate('subcategory');
    
    const restaurant = await Restaurant.findById(addonData.restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'AddonItem',
      'create',
      `Created addon item "${addonItem.name}"`,
      restaurant?.basicInfo?.restaurantName,
      addonItem.name
    );
    
    res.status(201).json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update addon item
router.put('/admin/update', authMiddleware, upload.single('image'), async (req, res) => {
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
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'AddonItem',
      'update',
      `Updated addon item "${addonItem.name}"`,
      restaurant?.basicInfo?.restaurantName,
      addonItem.name
    );
    
    res.json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update addon item status
router.patch('/admin/status', authMiddleware, async (req, res) => {
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
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'AddonItem',
      'status_update',
      `${isAvailable ? 'Enabled' : 'Disabled'} addon item "${addonItem.name}"`,
      restaurant?.basicInfo?.restaurantName,
      addonItem.name
    );
    
    res.json({ success: true, data: addonItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete addon item
router.delete('/admin/delete', authMiddleware, async (req, res) => {
  try {
    const { id, restaurantId } = req.body;
    const addonItem = await AddonItem.findById(id);
    if (!addonItem) {
      return res.status(404).json({ success: false, message: 'Addon item not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'AddonItem',
      'delete',
      `Deleted addon item "${addonItem.name}"`,
      restaurant?.basicInfo?.restaurantName,
      addonItem.name
    );
    
    await AddonItem.findOneAndDelete({ _id: id, restaurantId });
    res.json({ success: true, message: 'Addon item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;