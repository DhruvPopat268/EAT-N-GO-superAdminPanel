const express = require('express');
const router = express.Router();
const Subcategory = require('../models/Subcategory');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const authMiddleware = require('../middleware/auth');
const createLog = require('../utils/createLog');
const Restaurant = require('../models/Restaurant');

// Get all subcategories for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const category = req.query.category?.trim() || '';
    const status = req.query.status?.trim() || '';

    const query = { restaurantId: req.restaurant.restaurantId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.isAvailable = status === 'available';
    }

    const totalCount = await Subcategory.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const subcategories = await Subcategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: subcategories,
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

router.post('/', restaurantAuthMiddleware, upload.single('image'), async (req, res) => {
    try {
      const subcategoryData = {
        ...req.body,
        restaurantId: req.restaurant.restaurantId,
      };

      // console.log('✅ File received:', req.file.originalname);

      // ✅ Upload single file to Cloudinary
      if (req.file) {
        // console.log('📤 Uploading to Cloudinary...');
        try {
          const imageUrl = await uploadToCloudinary(
            req.file.buffer,
            'subcategory-images'
          );
          // console.log('✅ Cloudinary URL:', imageUrl);
          subcategoryData.image = imageUrl;
        } catch (uploadError) {
          console.error('❌ Cloudinary upload error:', uploadError);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to upload image',
            error: uploadError.message 
          });
        }
      }

      // console.log('💾 Saving subcategory data:', subcategoryData);
      
      const subcategory = new Subcategory(subcategoryData);
      await subcategory.save();

      // console.log('✅ Saved subcategory:', subcategory);

      res.status(201).json({ success: true, data: subcategory });
    } catch (error) {
      console.error('❌ Route error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Update subcategory
router.put('/update', restaurantAuthMiddleware, upload.single('image'), async (req, res) => {
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

// Get all subcategories from all restaurants
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { subcategoryName } = req.query;

    const subcategories = await Subcategory.find({})
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 });
    
    let transformedSubcategories = subcategories.map(subcategory => {
      const subcategoryObj = subcategory.toObject();
      return {
        ...subcategoryObj,
        restaurantName: subcategoryObj.restaurantId.basicInfo?.restaurantName || 'Unknown Restaurant',
        restaurantId: subcategoryObj.restaurantId._id
      };
    });

    if (subcategoryName) {
      transformedSubcategories = transformedSubcategories.filter(s => 
        s.name.toLowerCase().includes(subcategoryName.toLowerCase())
      );
    }

    const totalCount = transformedSubcategories.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedData = transformedSubcategories.slice(skip, skip + limit);
    
    res.json({ 
      success: true, 
      data: paginatedData,
      pagination: { page, limit, totalCount, totalPages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all subcategories for restaurant
router.post('/admin/get', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, page = 1, limit = 20, subcategoryName } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { restaurantId };
    if (subcategoryName) {
      query.name = { $regex: subcategoryName, $options: 'i' };
    }

    const totalCount = await Subcategory.countDocuments(query);
    const subcategories = await Subcategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ 
      success: true, 
      data: subcategories,
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

// Create subcategory
router.post('/admin', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { restaurantId, ...subcategoryData } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    
    const finalData = { ...subcategoryData, restaurantId };
    
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'subcategory-images');
      finalData.image = imageUrl;
    }
    
    const subcategory = new Subcategory(finalData);
    await subcategory.save();
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Subcategory',
      'create',
      `Created subcategory "${subcategory.name}"`,
      restaurant?.basicInfo?.restaurantName,
      subcategory.name
    );
    
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subcategory
router.put('/admin/update', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id, restaurantId, ...updateData } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'subcategory-images');
      updateData.image = imageUrl;
    }
    
    const subcategory = await Subcategory.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Subcategory',
      'update',
      `Updated subcategory "${subcategory.name}"`,
      restaurant?.basicInfo?.restaurantName,
      subcategory.name
    );
    
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subcategory status
router.patch('/admin/status', authMiddleware, async (req, res) => {
  try {
    const { id, isAvailable, restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    
    const subcategory = await Subcategory.findOneAndUpdate(
      { _id: id, restaurantId },
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
        { subcategory: id, restaurantId },
        { isAvailable }
      ),
      AddonItem.updateMany(
        { subcategory: id, restaurantId },
        { isAvailable }
      )
    ]);
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Subcategory',
      'status_update',
      `${isAvailable ? 'Enabled' : 'Disabled'} subcategory "${subcategory.name}"`,
      restaurant?.basicInfo?.restaurantName,
      subcategory.name
    );
    
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete subcategory
router.delete('/admin/delete', authMiddleware, async (req, res) => {
  try {
    const { id, restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const subcategory = await Subcategory.findOneAndDelete({ _id: id, restaurantId });
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    await createLog(
      req.user,
      'Menu Management',
      'Subcategory',
      'delete',
      `Deleted subcategory "${subcategory.name}"`,
      restaurant?.basicInfo?.restaurantName,
      subcategory.name
    );
    
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;