const express = require('express');
const router = express.Router();
const Combo = require('../models/Combo');
const Item = require('../models/Item');
const Restaurant = require('../models/Restaurant');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const createLog = require('../utils/createLog');

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Restaurent <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

router.get('/',restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const category = req.query.category?.trim() || '';
    const status = req.query.status?.trim() || '';

    const query = { restaurantId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.isAvailable = status === 'available';
    }

    const totalCount = await Combo.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const combos = await Combo.find(query)
      .populate('items.itemId', 'name images')
      .populate('items.attribute', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data: combos,
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

// Get combo details
router.post('/detail',restaurantAuthMiddleware, async (req, res) => {
  try {
    const { comboId } = req.body;
    const restaurantId = req.restaurant.restaurantId;
    const combo = await Combo.findOne({ _id: comboId, restaurantId })
      .populate('items.itemId')
      .populate('items.attribute', 'name')
      .populate('addons');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new combo
router.post('/add', restaurantAuthMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const restaurantId = req.restaurant.restaurantId;
    const { name, description, items, price, addons } = data;
    
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
      addons: addons || [],
      price,
      category,
      image: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null
    });
    
    await combo.save();
    res.json({ success: true, data: combo, message: 'Combo created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update combo
router.put('/update', restaurantAuthMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { comboId } = data;
    const restaurantId = req.restaurant.restaurantId;
    
    const updateData = { ...data };
    delete updateData.comboId;
    delete updateData.restaurantId;
    
    if (req.file) {
      updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    const combo = await Combo.findOneAndUpdate(
      { _id: comboId, restaurantId },
      updateData,
      { new: true }
    ).populate('items.itemId')
     .populate('items.attribute', 'name')
     .populate('addons');
    
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

// Get attributes for specific item
router.post('/item-attributes', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const  restaurantId  = req.restaurant.restaurantId;

    const item = await Item.findOne({ _id: itemId, restaurantId })
      .populate('attributes.attribute', 'name');
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    const attributes = item.attributes.map(attr => attr.attribute).filter(Boolean);
    res.json({ success: true, data: attributes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all combos from all restaurants
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';

    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const totalCount = await Combo.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const combos = await Combo.find(query)
      .populate('restaurantId', 'basicInfo.restaurantName')
      .populate('items.itemId', 'name images')
      .populate('items.attribute', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const transformedCombos = combos.map(combo => {
      const comboObj = combo.toObject();
      return {
        ...comboObj,
        restaurantName: comboObj.restaurantId.basicInfo?.restaurantName || 'Unknown Restaurant',
        restaurantId: comboObj.restaurantId._id
      };
    });
    
    res.json({
      success: true,
      data: transformedCombos,
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

// Get all combos for a specific restaurant
router.post('/admin',authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';

    const query = { restaurantId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const totalCount = await Combo.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const combos = await Combo.find(query)
      .populate('items.itemId', 'name images')
      .populate('items.attribute', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data: combos,
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

// Get combo details
router.post('/admin/detail',authMiddleware, async (req, res) => {
  try {
    const { comboId, restaurantId } = req.body;
    const combo = await Combo.findOne({ _id: comboId, restaurantId })
      .populate('items.itemId')
      .populate('items.attribute', 'name')
      .populate('addons');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new combo
router.post('/admin/add',authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { restaurantId, name, description, items, price, addons } = data;
    
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
      addons: addons || [],
      price,
      category,
      image: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null
    });
    
    await combo.save();
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Combo',
      'create',
      `Created combo "${combo.name}"`,
      restaurant?.basicInfo?.restaurantName,
      combo.name
    );
    
    res.json({ success: true, data: combo, message: 'Combo created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update combo
router.put('/admin/update',authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { comboId, restaurantId } = data;
    
    const updateData = { ...data };
    delete updateData.comboId;
    delete updateData.restaurantId;
    
    if (req.file) {
      updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    const combo = await Combo.findOneAndUpdate(
      { _id: comboId, restaurantId },
      updateData,
      { new: true }
    ).populate('items.itemId')
     .populate('items.attribute', 'name')
     .populate('addons');
    
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Combo',
      'update',
      `Updated combo "${combo.name}"`,
      restaurant?.basicInfo?.restaurantName,
      combo.name
    );
    
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
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Combo',
      'status_update',
      `${isAvailable ? 'Enabled' : 'Disabled'} combo "${combo.name}"`,
      restaurant?.basicInfo?.restaurantName,
      combo.name
    );
    
    res.json({ success: true, data: combo, message: 'Combo status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete combo
router.delete('/admin/delete', authMiddleware, async (req, res) => {
  try {
    const { comboId, restaurantId } = req.body;
    
    const combo = await Combo.findById(comboId);
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Combo',
      'delete',
      `Deleted combo "${combo.name}"`,
      restaurant?.basicInfo?.restaurantName,
      combo.name
    );
    
    await Combo.findOneAndDelete({ _id: comboId, restaurantId });
    res.json({ success: true, message: 'Combo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attributes for specific item (restaurant route)
router.post('/restaurant/item-attributes', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const restaurantId = req.restaurant.restaurantId;
    const item = await Item.findOne({ _id: itemId, restaurantId })
      .populate('attributes.attribute', 'name');
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    const attributes = item.attributes.map(attr => attr.attribute).filter(Boolean);
    res.json({ success: true, data: attributes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;