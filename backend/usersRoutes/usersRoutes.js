const express = require('express');
const router = express.Router();
const UserOtpSession = require('../usersModels/userOtpSession');
const UserSession = require('../usersModels/userSession');
const User = require('../usersModels/usersModel');
const { generateTokens, verifyToken } = require('../middleware/userAuth');
const jwt = require('jsonwebtoken');

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

// Refresh access token
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

    // Generate only new access token
    const newAccessToken = jwt.sign({ mobileNo: decoded.mobileNo, userId: decoded.userId }, process.env.JWT_SECRET_ACCESS_TOKEN_USER, { expiresIn: '15m' });
    
    // Update session with new access token only
    session.accessToken = newAccessToken;
    await session.save();

    res.json({ 
      success: true,
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken
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

module.exports = router;