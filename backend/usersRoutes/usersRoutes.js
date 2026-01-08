const express = require('express');
const router = express.Router();
const UserOtpSession = require('../usersModels/userOtpSession');
const UserSession = require('../usersModels/userSession');
const User = require('../usersModels/usersModel');
const { generateTokens, verifyToken } = require('../middleware/userAuth');
const { getRestaurantsAlongRoute } = require('../utils/routeUtils');
const jwt = require('jsonwebtoken');
const itemRoutes = require('./itemRoute');
const restaurentRoutes = require('./restaurentRoutes');
const cartRoutes = require('./cartRoutes');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    // Delete existing OTP sessions for this mobile
    await UserOtpSession.deleteMany({ mobileNo });

    // Create new OTP session with dummy OTP
    const otpSession = new UserOtpSession({
      mobileNo,
      otp: '123456'
    });

    await otpSession.save();

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    if (!mobileNo || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }
   console.log("mobileNo, otp", mobileNo, otp);
   console.log(await UserOtpSession.find({}));
    // Find OTP session
    const otpSession = await UserOtpSession.findOne({ mobileNo, otp });
    console.log("otpSession", otpSession);
    if (!otpSession) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Delete existing user sessions
    await UserSession.deleteMany({ mobileNo });

    // Find or create user
    let user = await User.findOne({ phone: mobileNo });
    if (!user) {
      user = new User({ phone: mobileNo });
      await user.save();
    }

    // Generate tokens and create session
    const { accessToken, refreshToken } = generateTokens(mobileNo, user._id);
    const userSession = new UserSession({
      userId: user._id,
      mobileNo,
      accessToken,
      refreshToken
    });

    await userSession.save();

    // Delete OTP session after successful verification
    await UserOtpSession.deleteOne({ _id: otpSession._id });

    res.json({ 
      success: true,
      message: 'OTP verified successfully',
      accessToken,
      refreshToken,
      mobileNo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.json({
        success: true,
        message: 'User profile retrieved',
        data: {
          fullName: null,
          email: null,
          phone: null,
          gender: null,
          currentLocation: null,
          destinationLocation: null,
          travelHistory: [],
          recentSearches: [],
          favoriteRestaurants: [],
          orders: []
        }
      });
    }

    res.json({
      success: true,
      message: 'User profile fatched successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Rotate access token & refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN_USER);
    
    // Find session with this refresh token
    const session = await UserSession.findOne({ userId: decoded.userId, refreshToken });
    
    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Generate both new access and refresh tokens for security
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.mobileNo, decoded.userId);
    
    // Update session with both new tokens
    session.accessToken = newAccessToken;
    session.refreshToken = newRefreshToken;
    await session.save();

    res.json({ 
      success: true,
      message: 'Tokens refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired', code: 'REFRESH_TOKEN_EXPIRED' });
    }
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User from token:", req.user);
    
    const updateData = { ...req.body }; // Create a copy to avoid modifying original
    delete updateData.phone; // Prevent phone number update

    const userId = req.user.userId;
    console.log("Updating user:", userId, updateData);
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true,
      message: 'Profile updated successfully', 
      data: user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get restaurants along route
router.post('/restaurants-along-route', verifyToken, async (req, res) => {
  try {
    const { currentLocation, destinationLocation, bufferRadius = 500 } = req.body;

    if (!currentLocation || !destinationLocation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current location and destination location are required' 
      });
    }

    if (!currentLocation.lat || !currentLocation.lng || !destinationLocation.lat || !destinationLocation.lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required for both locations' 
      });
    }

    const Restaurant = require('../models/Restaurant');
    const allRestaurants = await Restaurant.find({ status: 'approved' });

    const filteredRestaurants = getRestaurantsAlongRoute(
      allRestaurants, 
      currentLocation, 
      destinationLocation, 
      bufferRadius
    ).map(restaurant => ({
      _id: restaurant._id,
      basicInfo: {
        restaurantName: restaurant.basicInfo.restaurantName,
        foodCategory: restaurant.basicInfo.foodCategory,
        cuisineTypes: restaurant.basicInfo.cuisineTypes
      },
      contactDetails: {
        address: restaurant.contactDetails.address,
        city: restaurant.contactDetails.city,
        state: restaurant.contactDetails.state,
        latitude: restaurant.contactDetails.latitude,
        longitude: restaurant.contactDetails.longitude
      },
    }));

    res.json({
      success: true,
      message: 'Restaurants along route retrieved successfully',
      data: {
        totalRestaurants: allRestaurants.length,
        filteredRestaurants: filteredRestaurants.length,
        bufferRadius,
        restaurants: filteredRestaurants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Use item routes
router.use('/items', itemRoutes);

// Use restaurant routes
router.use('/restaurents', restaurentRoutes);

// Use cart routes
router.use('/cart', cartRoutes);

module.exports = router;