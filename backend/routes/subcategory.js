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

router.post('/', restaurantAuthMiddleware, upload.single('image'), async (req, res) => {
    try {
      const subcategoryData = {
        ...req.body,
        restaurantId: req.restaurant.restaurantId,
      };

      console.log('✅ File received:', req.file.originalname);

      // ✅ Upload single file to Cloudinary
      if (req.file) {
        console.log('📤 Uploading to Cloudinary...');
        try {
          const imageUrl = await uploadToCloudinary(
            req.file.buffer,
            'subcategory-images'
          );
          console.log('✅ Cloudinary URL:', imageUrl);
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

      console.log('💾 Saving subcategory data:', subcategoryData);
      
      const subcategory = new Subcategory(subcategoryData);
      await subcategory.save();

      console.log('✅ Saved subcategory:', subcategory);

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

// Get all subcategories for restaurant
router.post('/admin/get', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }
    const subcategories = await Subcategory.find({ restaurantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: subcategories });
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
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;