const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Subcategory = require('../models/Subcategory');
const Attribute = require('../models/Attribute');
const Restaurant = require('../models/Restaurant');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const authMiddleware = require('../middleware/auth');
const XLSX = require('xlsx');
const multer = require('multer');

const excelUpload = multer({ storage: multer.memoryStorage() });

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
    await item.populate('addons');
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update item
router.put('/update', restaurantAuthMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const updateData = JSON.parse(req.body.data || '{}');
    const { itemId, existingImages } = updateData;
    delete updateData.itemId;
    delete updateData.existingImages;

    // Handle images: combine existing images with new uploaded images
    let allImages = [];

    // Add existing images (URLs)
    if (existingImages && existingImages.length > 0) {
      allImages = [...existingImages];
    }

    // Upload new images and add their URLs
    if (req.files && req.files.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'item-images'))
      );
      allImages = [...allImages, ...newImageUrls];
    }

    // Set the combined images array
    updateData.images = allImages;

    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurantId: req.restaurant.restaurantId },
      updateData,
      { new: true, runValidators: true }  // 👈 add this
    )
      .populate('subcategory')
      .populate('attributes.attribute')
      .populate('addons');

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
      .populate('attributes.attribute', 'name')
      .populate('addons');

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

// Bulk import items from Excel (Restaurant)
router.post('/bulk-import', restaurantAuthMiddleware, excelUpload.single('file'), async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file is required' });
    }

    // Get restaurant details for validation
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = { success: [], errors: [] };

    // Validate required columns
    const requiredColumns = ['name', 'category', 'subcategory', 'description'];
    const attributeColumns = ['attributes', 'attributes (attributeId:price, comma-separated)'];

    if (data.length > 0) {
      const availableColumns = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
      const hasAttributeColumn = attributeColumns.some(col => availableColumns.includes(col));

      if (missingColumns.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required columns: ${missingColumns.join(', ')}`
        });
      }

      if (!hasAttributeColumn) {
        return res.status(400).json({
          success: false,
          message: `Missing attributes column. Expected one of: ${attributeColumns.join(' or ')}`
        });
      }
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Validate category against restaurant's allowed food categories
        const allowedCategories = restaurant.basicInfo.foodCategory === 'Mixed'
          ? ['Veg', 'Non-Veg', 'Mixed']
          : [restaurant.basicInfo.foodCategory];

        if (!allowedCategories.includes(row.category)) {
          results.errors.push({ row: i + 2, error: `Category '${row.category}' not allowed for this restaurant. Allowed: ${allowedCategories.join(', ')}` });
          continue;
        }

        // Validate subcategory exists for this restaurant
        const subcategory = await Subcategory.findOne({
          name: row.subcategory,
          restaurantId
        });

        if (!subcategory) {
          results.errors.push({ row: i + 2, error: `Subcategory '${row.subcategory}' not found for this restaurant` });
          continue;
        }

        // Parse and validate attributes
        let attributes = [];
        const attributeColumn = row.attributes || row['attributes (attributeId:price, comma-separated)'];
        if (attributeColumn) {
          const attrData = attributeColumn.split(',');
          let hasAttributeError = false;

          for (const attr of attrData) {
            if (!attr.trim()) continue;

            const parts = attr.split(':');
            if (parts.length !== 2) {
              results.errors.push({ row: i + 2, error: `Invalid attribute format '${attr}'. Use 'name:price'` });
              hasAttributeError = true;
              break;
            }

            const [name, price] = parts;
            if (!name.trim()) {
              results.errors.push({ row: i + 2, error: 'Attribute name cannot be empty' });
              hasAttributeError = true;
              break;
            }

            if (!price.trim() || isNaN(parseFloat(price))) {
              results.errors.push({ row: i + 2, error: `Invalid price '${price}' for attribute '${name.trim()}'` });
              hasAttributeError = true;
              break;
            }

            const attribute = await Attribute.findOne({ name: name.trim(), restaurantId });
            if (!attribute) {
              results.errors.push({ row: i + 2, error: `Attribute '${name.trim()}' not found for this restaurant` });
              hasAttributeError = true;
              break;
            }

            attributes.push({ attribute: attribute._id, price: parseFloat(price) });
          }

          if (hasAttributeError) continue;
        }

        // Parse customizations if provided
        let customizations = [];
        if (row.customizations) {
          const customData = row.customizations.split('|');
          for (const custom of customData) {
            const [name, optionsStr] = custom.split(':');
            const options = optionsStr.split(';').map(opt => {
              const [label, quantity, unit, price] = opt.split(',');
              return {
                label: label.trim(),
                quantity: parseInt(quantity) || 0,
                unit: unit?.trim() || 'unit',
                price: parseFloat(price) || 0
              };
            });
            customizations.push({ name: name.trim(), options });
          }
        }

        // Parse food types
        let foodTypes = [];
        if (row.foodTypes) {
          foodTypes = row.foodTypes.split(',').map(type => type.trim());
        }

        const itemData = {
          restaurantId,
          category: row.category,
          subcategory: subcategory._id,
          name: row.name,
          description: row.description || '',
          attributes,
          foodTypes,
          customizations,
          currency: row.currency || 'INR',
          isAvailable: row.isAvailable !== 'false'
        };

        const item = new Item(itemData);
        await item.save();
        results.success.push({ row: i + 2, name: row.name });
      } catch (error) {
        results.errors.push({ row: i + 2, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.success.length} items created, ${results.errors.length} errors.`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get all items from all restaurants
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({})
      .populate('restaurantId', 'basicInfo.restaurantName')
      .populate('subcategory', 'name')
      .populate('attributes.attribute', 'name')
      .sort({ createdAt: -1 });

    // Transform the data to include restaurantName and restaurantId
    const transformedItems = items.map(item => {
      const itemObj = item.toObject();
      return {
        ...itemObj,
        restaurantName: itemObj.restaurantId.basicInfo?.restaurantName || 'Unknown Restaurant',
        restaurantId: itemObj.restaurantId._id,
        attributes: itemObj.attributes.map(attr => ({
          _id: attr.attribute?._id,
          name: attr.attribute?.name,
          price: attr.price,
        }))
      };
    });

    res.json({ success: true, data: transformedItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
    await item.populate('addons');
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update item
router.put('/admin/update', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const updateData = JSON.parse(req.body.data || '{}');
    const { itemId, restaurantId, existingImages } = updateData;
    delete updateData.itemId;
    delete updateData.restaurantId;
    delete updateData.existingImages;

    // Handle images: combine existing images with new uploaded images
    let allImages = [];

    // Add existing images (URLs)
    if (existingImages && existingImages.length > 0) {
      allImages = [...existingImages];
    }

    // Upload new images and add their URLs
    if (req.files && req.files.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'item-images'))
      );
      allImages = [...allImages, ...newImageUrls];
    }

    // Set the combined images array
    updateData.images = allImages;

    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurantId },
      updateData,
      { new: true , runValidators: true}  // 👈 add this
    ).populate('subcategory').populate('attributes.attribute').populate('addons');
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
      .populate('restaurantId', 'basicInfo.restaurantName')
      .populate('subcategory', 'name')
      .populate('attributes.attribute', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    // Transform the data to include restaurantName
    const itemObj = item.toObject();
    const responseData = {
      ...itemObj,
      restaurantName: itemObj.restaurantId?.basicInfo?.restaurantName || 'Unknown Restaurant'
    };
    
    res.json({ success: true, data: responseData });
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

// Bulk import items from Excel
router.post('/admin/bulk-import', authMiddleware, excelUpload.single('file'), async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file is required' });
    }

    // Get restaurant details for validation
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = { success: [], errors: [] };

    // Validate required columns
    const requiredColumns = ['name', 'category', 'subcategory', 'description'];
    const attributeColumns = ['attributes', 'attributes (attributeId:price, comma-separated)'];

    if (data.length > 0) {
      const availableColumns = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
      const hasAttributeColumn = attributeColumns.some(col => availableColumns.includes(col));

      if (missingColumns.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required columns: ${missingColumns.join(', ')}`
        });
      }

      if (!hasAttributeColumn) {
        return res.status(400).json({
          success: false,
          message: `Missing attributes column. Expected one of: ${attributeColumns.join(' or ')}`
        });
      }
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Validate category against restaurant's allowed food categories
        const allowedCategories = restaurant.basicInfo.foodCategory === 'Mixed'
          ? ['Veg', 'Non-Veg', 'Mixed']
          : [restaurant.basicInfo.foodCategory];

        if (!allowedCategories.includes(row.category)) {
          results.errors.push({ row: i + 2, error: `Category '${row.category}' not allowed for this restaurant. Allowed: ${allowedCategories.join(', ')}` });
          continue;
        }

        // Validate subcategory exists for this restaurant
        const subcategory = await Subcategory.findOne({
          name: row.subcategory,
          restaurantId
        });

        if (!subcategory) {
          results.errors.push({ row: i + 2, error: `Subcategory '${row.subcategory}' not found for this restaurant` });
          continue;
        }

        // Parse and validate attributes
        let attributes = [];
        const attributeColumn = row.attributes || row['attributes (attributeId:price, comma-separated)'];
        if (attributeColumn) {
          const attrData = attributeColumn.split(',');
          let hasAttributeError = false;

          for (const attr of attrData) {
            if (!attr.trim()) continue;

            const parts = attr.split(':');
            if (parts.length !== 2) {
              results.errors.push({ row: i + 2, error: `Invalid attribute format '${attr}'. Use 'name:price'` });
              hasAttributeError = true;
              break;
            }

            const [name, price] = parts;
            if (!name.trim()) {
              results.errors.push({ row: i + 2, error: 'Attribute name cannot be empty' });
              hasAttributeError = true;
              break;
            }

            if (!price.trim() || isNaN(parseFloat(price))) {
              results.errors.push({ row: i + 2, error: `Invalid price '${price}' for attribute '${name.trim()}'` });
              hasAttributeError = true;
              break;
            }

            const attribute = await Attribute.findOne({ name: name.trim(), restaurantId });
            if (!attribute) {
              results.errors.push({ row: i + 2, error: `Attribute '${name.trim()}' not found for this restaurant` });
              hasAttributeError = true;
              break;
            }

            attributes.push({ attribute: attribute._id, price: parseFloat(price) });
          }

          if (hasAttributeError) continue;
        }

        // Parse customizations if provided
        let customizations = [];
        if (row.customizations) {
          const customData = row.customizations.split('|');
          for (const custom of customData) {
            const [name, optionsStr] = custom.split(':');
            const options = optionsStr.split(';').map(opt => {
              const [label, quantity, unit, price] = opt.split(',');
              return {
                label: label.trim(),
                quantity: parseInt(quantity) || 0,
                unit: unit?.trim() || 'unit',
                price: parseFloat(price) || 0
              };
            });
            customizations.push({ name: name.trim(), options });
          }
        }

        // Parse food types
        let foodTypes = [];
        if (row.foodTypes) {
          foodTypes = row.foodTypes.split(',').map(type => type.trim());
        }

        const itemData = {
          restaurantId,
          category: row.category,
          subcategory: subcategory._id,
          name: row.name,
          description: row.description || '',
          attributes,
          foodTypes,
          customizations,
          currency: row.currency || 'INR',
          isAvailable: row.isAvailable !== 'false'
        };

        console.log('Excel row data:', row);
        console.log('Available columns:', Object.keys(row));
        console.log('Row attributes:', attributeColumn);
        console.log('Parsed attributes:', attributes);
        const item = new Item(itemData);
        console.log('Creating item:', itemData);
        await item.save();
        results.success.push({ row: i + 2, name: row.name });
      } catch (error) {
        results.errors.push({ row: i + 2, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.success.length} items created, ${results.errors.length} errors.`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;