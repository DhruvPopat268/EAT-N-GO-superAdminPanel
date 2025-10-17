const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const RestaurantSession = require('../models/RestaurantSession');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const router = express.Router();

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder, 
        resource_type: 'auto',
        access_mode: 'public'  // Add this to make files publicly accessible
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// Restaurant login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or restaurant not approved'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, restaurant.tempPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Remove existing sessions for this restaurant
    await RestaurantSession.deleteMany({ email: restaurant.email });
    
    const token = jwt.sign(
      { restaurantId: restaurant._id, email: restaurant.email },
      process.env.JWT_SECRET_RESTAURENT || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Create new session
    await RestaurantSession.create({
      email: restaurant.email,
      token: token,
      restaurantId: restaurant._id
    });
    
    res.cookie('RestaurantToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    const restaurantResponse = restaurant.toObject();
    delete restaurantResponse.tempPassword;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      data: restaurantResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
})

router.get('/status', restaurantAuthMiddleware, async (req, res) => {

  try {
    const restaurantId = req.restaurant?.restaurantId;

    const restaurentStatus = await Restaurant.findById(restaurantId).select('status');

    res.status(200).json({
      success: true,
      data: restaurentStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant status',
      error: error.message
    });
  }
} )

// Get all restaurants
router.get('/', authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
});

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
});

router.get('/approved', authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: "approved" }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
});

router.get('/rejected', authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: "rejected" }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
});

// Generate temporary password
const generateTempPassword = (email) => {
  const username = email.split('@')[0];
  const randomChars = Math.random().toString(36).substring(2, 6);
  return `${username}${randomChars}`;
};

// Create new restaurant with file uploads
router.post('/', upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'foodLicense', maxCount: 1 },
  { name: 'restaurantImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const restaurantData = JSON.parse(req.body.data);
    
    // Check if restaurant with email already exists
    const existingRestaurant = await Restaurant.findOne({ email: restaurantData.email });
    if (existingRestaurant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Restaurant with this email already exists' 
      });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword(restaurantData.email);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    // Upload documents to Cloudinary
    const documents = {};
    let restaurantImages = [];
    
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        if (key === 'restaurantImages' && files) {
          restaurantImages = await Promise.all(
            files.map(file => uploadToCloudinary(file.buffer, 'restaurant-images'))
          );
        } else if (files && files[0]) {
          documents[key] = await uploadToCloudinary(files[0].buffer, 'restaurant-documents');
        }
      }
    }

    const restaurant = new Restaurant({
      ...restaurantData,
      documents,
      restaurantImages,
      tempPassword: hashedTempPassword
    });
    await restaurant.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant registered successfully',
      data: {
        ...restaurant.toObject(),
        credentials: {
          email: restaurant.email,
          password: tempPassword
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error registering restaurant',
      error: error.message
    });
  }
});

// Get restaurant by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant',
      error: error.message
    });
  }
});

// Update restaurant with file uploads
router.put('/:id', authMiddleware, upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'foodLicense', maxCount: 1 }
]), async (req, res) => {
  try {
    const restaurantData = JSON.parse(req.body.data);
    
    // Upload new documents to Cloudinary if provided
    const documents = {};
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        if (files && files[0]) {
          documents[key] = await uploadToCloudinary(files[0].buffer, 'restaurant-documents');
        }
      }
    }

    const updateData = {
      ...restaurantData,
      ...(Object.keys(documents).length > 0 && { 
        documents: { ...restaurantData.documents, ...documents }
      })
    };

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant',
      error: error.message
    });
  }
});

// Approve restaurant (only from pending)
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve restaurants with pending status'
      });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Restaurant approved successfully',
      data: updatedRestaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving restaurant',
      error: error.message
    });
  }
});

// Reject restaurant (only from pending)
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject restaurants with pending status'
      });
    }

    const updateData = { status: 'rejected' };
    if (reason) {
      updateData.rejectionReason = reason;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Restaurant rejected successfully',
      data: updatedRestaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting restaurant',
      error: error.message
    });
  }
});

// Delete restaurant
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant',
      error: error.message
    });
  }
});

module.exports = router;