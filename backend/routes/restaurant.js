const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const RestaurantSession = require('../models/RestaurantSession');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const createLog = require('../utils/createLog');
const { sendUserCredentials } = require('../services/emailService');
const { getJwtConfig } = require('../utils/jwtConfig');
const { getCurrencyFromCountry } = require('../utils/countryToCurrencyConverter');
const router = express.Router();
const Item = require('../models/Item');
const orderRequestRoutes = require('../restaurantRoutes/orderRequestRoutes');
const orderRoutes = require('../restaurantRoutes/orderRoutes');
const orderCancelRefundRoutes = require('../restaurantRoutes/orderCancelRefund');
const couponRoutes = require('../restaurantRoutes/couponRoutes');
const userRatingRoutes = require('../restaurantRoutes/userRatingRoutes');
const axios = require('axios');

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

// Generate temporary password
const generateTempPassword = (email) => {
  const username = email.split('@')[0];
  const randomChars = Math.random().toString(36).substring(2, 6);
  return `${username}${randomChars}`;
};

// Restaurant login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const restaurant = await Restaurant.findOne({ 'contactDetails.email': email });
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

    // Check and manage session limit
    const maxSessions = parseInt(process.env.RESTAURANT_ALLOWED_SESSIONS) || 1;
    const existingSessions = await RestaurantSession.find({ 
      restaurantId: restaurant._id 
    }).sort({ createdAt: 1 });

    if (existingSessions.length >= maxSessions) {
      // Delete oldest sessions to maintain limit
      const sessionsToDelete = existingSessions.slice(0, existingSessions.length - maxSessions + 1);
      await RestaurantSession.deleteMany({ 
        _id: { $in: sessionsToDelete.map(s => s._id) } 
      });
    }

    // Validate JWT configuration
    const { secret, expiry } = getJwtConfig('restaurant');

    const token = jwt.sign(
      { restaurantId: restaurant._id, email: restaurant.contactDetails.email },
      secret,
      { expiresIn: expiry }
    );

    // Create new session
    await RestaurantSession.create({
      email: restaurant.contactDetails.email,
      token: token,
      restaurantId: restaurant._id
    });

    res.cookie('RestaurantToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.eatngo.in' : undefined,
      maxAge: process.env.RESTAURANT_COOKIE_MAX_AGE
    });

    const restaurantResponse = restaurant.toObject();
    delete restaurantResponse.tempPassword;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token
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

    const restaurentData = await Restaurant.findById(restaurantId).select('status rejectedFormFields rejectionReason isManuallyClosed');

    res.status(200).json({
      success: true,
      data: restaurentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant status',
      error: error.message
    });
  }
})

// Restaurant resubmit rejected application
router.put('/resubmit', restaurantAuthMiddleware, upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'foodLicense', maxCount: 1 },
  { name: 'restaurantImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const restaurantId = req.restaurant?.restaurantId;
    // console.log('Restaurant ID for resubmission:', restaurantId);
    // console.log('Request body for resubmission:', req.body);
    const updateData = JSON.parse(req.body.data || '{}');

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Can only resubmit rejected applications'
      });
    }

    // Upload new documents to Cloudinary if provided
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

    // Use $set with dot notation to update only specific fields
    const setData = {
      status: 'pending',
      rejectionReason: null,
      rejectedFormFields: []
    };

    // Map fields using dot notation to preserve existing nested fields
    Object.entries(updateData).forEach(([key, value]) => {
      if (['restaurantName', 'ownerName', 'foodCategory', 'cuisineTypes', 'operatingHours'].includes(key)) {
        setData[`basicInfo.${key}`] = value;
      } else if (['email', 'phone', 'address', 'city', 'state', 'country', 'pincode', 'latitude', 'longitude'].includes(key)) {
        setData[`contactDetails.${key}`] = value;
      } else if (['licenseNumber', 'gstNumber', 'bankAccount', 'ifscCode', 'description'].includes(key)) {
        setData[`businessDetails.${key}`] = value;
      }
    });

    // Handle documents with dot notation
    Object.entries(documents).forEach(([key, value]) => {
      setData[`documents.${key}`] = value;
    });
    
    if (restaurantImages.length > 0) {
      setData['documents.restaurantImages'] = restaurantImages;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: setData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Application resubmitted successfully',
      data: updatedRestaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resubmitting application',
      error: error.message
    });
  }
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Restaurent <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Update isManuallyClosed status
router.patch('/manuallyClosed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { isManuallyClosed } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.restaurant.restaurantId,
      { isManuallyClosed },
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
      message: 'Status updated successfully',
      data: { isManuallyClosed: restaurant.isManuallyClosed }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// Get current restaurant details (using restaurant middleware)
router.get('/details', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.restaurantId);
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
      message: 'Error fetching restaurant details',
      error: error.message
    });
  }
});

// Get restaurant useful details
router.get('/usefullDetails', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.restaurantId, 'basicInfo.foodCategory contactDetails.country');
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const foodCategory = restaurant.basicInfo?.foodCategory;
    const categories = foodCategory === 'Mixed' ? ['Veg', 'Non-Veg'] : [foodCategory];

    res.status(200).json({
      success: true,
      data: {
        foodCategory: categories,
        country: restaurant.contactDetails?.country
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food category',
      error: error.message
    });
  }
});

// Update restaurant data
router.patch('/updateData', restaurantAuthMiddleware, upload.array('restaurantImages', 10), async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    // Get existing restaurant data
    const existingRestaurant = await Restaurant.findById(restaurantId);

    // Parse JSON data from form
    const updateData = {};
    if (req.body.basicInfo) {
      updateData.basicInfo = JSON.parse(req.body.basicInfo);
    }
    if (req.body.contactDetails) {
      updateData.contactDetails = JSON.parse(req.body.contactDetails);
    }
    if (req.body.businessDetails) {
      updateData.businessDetails = JSON.parse(req.body.businessDetails);
    }

    // Collect existing image URLs from form data
    const existingImages = [];
    let primaryImage = null;
    
    if (req.body.primaryImage && req.body.primaryImage.startsWith('http')) {
      primaryImage = req.body.primaryImage;
    }
    
    if (req.body.restaurantImages) {
      const images = Array.isArray(req.body.restaurantImages) ? req.body.restaurantImages : [req.body.restaurantImages];
      existingImages.push(...images.filter(img => typeof img === 'string' && img.startsWith('http')));
    }

    // Upload new restaurant images if provided
    let newUploadedImages = [];
    if (req.files && req.files.length > 0) {
      newUploadedImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'restaurant-images'))
      );
    }

    // Set primary image priority: explicit > existing > newly uploaded
    if (!primaryImage) {
      if (existingImages.length > 0) {
        primaryImage = existingImages[0];
        existingImages.shift(); // Remove first existing image from gallery
      } else if (newUploadedImages.length > 0) {
        primaryImage = newUploadedImages[0];
        newUploadedImages = newUploadedImages.slice(1);
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newUploadedImages];

    if (primaryImage || allImages.length > 0) {
      updateData.documents = { 
        ...existingRestaurant.documents, 
        ...(primaryImage && { primaryImage }),
        restaurantImages: allImages 
      };
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
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

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Super Admin <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Get restaurant useful details
router.post('/admin/usefullDetails', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const restaurant = await Restaurant.findById(restaurantId, 'basicInfo.foodCategory contactDetails.country');
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const foodCategory = restaurant.basicInfo?.foodCategory;
    const categories = foodCategory === 'Mixed' ? ['Veg', 'Non-Veg'] : [foodCategory];

    res.status(200).json({
      success: true,
      data: {
        foodCategory: categories,
        country: restaurant.contactDetails?.country
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food category',
      error: error.message
    });
  }
});

// Get approved restaurant names
router.get('/restaurantNames', authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find(
      { status: 'approved' },
      { _id: 1, 'basicInfo.restaurantName': 1 }
    )
    .sort({ 'basicInfo.restaurantName': 1 })
    .lean();
    
    const formattedRestaurants = restaurants.map(restaurant => ({
      restaurantId: restaurant._id,
      name: restaurant.basicInfo.restaurantName
    }));
    
    res.json({ success: true, data: formattedRestaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
    const restaurants = await Restaurant.find({ status: "approved" }).sort({ updatedAt: -1 });
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
    const restaurants = await Restaurant.find({ status: "rejected" }).sort({ updatedAt: -1 });
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

// Use order cancel refund routes (MUST be before /:id route)
router.use('/order-cancel-refund', orderCancelRefundRoutes);

// Use order request routes (MUST be before /:id route)
router.use('/order-requests', orderRequestRoutes);

// Use order routes (MUST be before /:id route)
router.use('/orders', orderRoutes);

// Use coupon routes (MUST be before /:id route)
router.use('/coupons', couponRoutes);

// Use user rating routes (MUST be before /:id route)
router.use('/ratings', userRatingRoutes);

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

// Create new restaurant with file uploads
router.post(
  '/',
  upload.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
    { name: 'foodLicense', maxCount: 1 },
    { name: 'restaurantImages', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      // console.log('✅ Received request to register restaurant');

      const restaurantData = JSON.parse(req.body.data);
      // console.log('🧾 Parsed restaurant data:', restaurantData);

      if (!restaurantData.email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const existingRestaurant = await Restaurant.findOne({
        'contactDetails.email': restaurantData.email
      });

      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant with this email already exists'
        });
      }

      // Generate temp password (plain + hashed)
      const tempPassword = generateTempPassword(restaurantData.email);
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

      // Get currency from country
      const currency = await getCurrencyFromCountry(restaurantData.country);

      // Upload files
      const documents = {};
      let restaurantImages = [];

      if (req.files && Object.keys(req.files).length > 0) {
        for (const [key, files] of Object.entries(req.files)) {
          if (key === 'restaurantImages' && files) {
            restaurantImages = await Promise.all(
              files.map(file => uploadToCloudinary(file.buffer, 'restaurant-images'))
            );
          } else if (files && files[0]) {
            const uploadResult = await uploadToCloudinary(files[0].buffer, 'restaurant-documents');
            documents[key] = uploadResult;
          }
        }
      }

      const nestedData = {
        basicInfo: {
          restaurantName: restaurantData.restaurantName,
          ownerName: restaurantData.ownerName,
          foodCategory: restaurantData.foodCategory,
          cuisineTypes: restaurantData.cuisineTypes,
          otherCuisine: restaurantData.otherCuisine
        },
        contactDetails: {
          email: restaurantData.email,
          phone: restaurantData.phone,
          address: restaurantData.address,
          city: restaurantData.city,
          state: restaurantData.state,
          country: restaurantData.country,
          pincode: restaurantData.pincode,
          latitude: restaurantData.latitude,
          longitude: restaurantData.longitude
        },
        businessDetails: {
          licenseNumber: restaurantData.licenseNumber,
          gstNumber: restaurantData.gstNumber,
          bankAccount: restaurantData.bankAccount,
          ifscCode: restaurantData.ifscCode,
          description: restaurantData.description,
          currency: currency
        },
        documents: { ...documents, restaurantImages },
        tempPassword: hashedTempPassword // store only hashed version in DB
      };

      const restaurant = new Restaurant(nestedData);
      await restaurant.save();

      // Send email (optional)
      try {
        await sendUserCredentials(
          restaurantData.email,
          restaurantData.restaurantName,
          tempPassword,
          'Restaurant'
        );
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }

      // ✅ Include plain tempPassword only in response (not in DB)
      res.status(201).json({
        success: true,
        message: 'Restaurant registered successfully',
        data: {
          ...restaurant.toObject(),
          plainTempPassword: tempPassword
        }
      });
    } catch (error) {
      console.error('💥 Error registering restaurant:', error);
      res.status(400).json({
        success: false,
        message: 'Error registering restaurant',
        error: error.message
      });
    }
  }
);

// Approve restaurant
router.post('/approve/:id', authMiddleware, async (req, res) => {
  try {

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }


    await createLog(
      req.user,
      'Restaurant Management',
      'Onboarding',
      'approve',
      `Approved restaurant with ID ${req.params.id}`,
      restaurant.basicInfo.restaurantName
    );



    res.json({
      success: true,
      message: 'Restaurant approved successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Error in approve route:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving restaurant',
      error: error.message
    });
  }
});

// Reject restaurant
router.post('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const { reason, formFields } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason,
        rejectedFormFields: formFields
      },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    await createLog(
      req.user,
      'Restaurant Management',
      'Onboarding',
      'reject',
      `Rejected restaurant with ID ${req.params.id}. Reason: ${reason}`,
      restaurant.basicInfo.restaurantName
    );

    res.json({
      success: true,
      message: 'Restaurant rejected successfully',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting restaurant',
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