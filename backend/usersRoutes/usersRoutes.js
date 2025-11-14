const express = require('express');
const router = express.Router();
const UserOtpSession = require('../usersModels/userOtpSession');
const UserSession = require('../usersModels/userSession');
const User = require('../usersModels/usersModel');
const { generateToken, verifyToken } = require('../middleware/userAuth');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Delete existing OTP sessions for this mobile
    await UserOtpSession.deleteMany({ mobileNo });

    // Create new OTP session with dummy OTP
    const otpSession = new UserOtpSession({
      mobileNo,
      otp: '123456'
    });

    await otpSession.save();

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    if (!mobileNo || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }
   console.log("mobileNo, otp", mobileNo, otp);
   console.log(await UserOtpSession.find({}));
    // Find OTP session
    const otpSession = await UserOtpSession.findOne({ mobileNo, otp });
    console.log("otpSession", otpSession);
    if (!otpSession) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete existing user sessions (one session at a time)
    await UserSession.deleteMany({ mobileNo });

    // Find or create user
    let user = await User.findOne({ phone: mobileNo });
    if (!user) {
      user = new User({ phone: mobileNo });
      await user.save();
    }

    // Generate new token and create session
    const token = generateToken(mobileNo, user._id);
    const userSession = new UserSession({
      mobileNo,
      token
    });

    await userSession.save();

    // Delete OTP session after successful verification
    await UserOtpSession.deleteOne({ _id: otpSession._id });

    res.json({ 
      message: 'OTP verified successfully',
      token,
      mobileNo
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.json({
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
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;