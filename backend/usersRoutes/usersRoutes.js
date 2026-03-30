const express = require('express');
const router = express.Router();
const UserOtpSession = require('../usersModels/userOtpSession');
const UserSession = require('../usersModels/userSession');
const User = require('../usersModels/usersModel');
const TableBooking = require('../usersModels/TableBooking');
const Restaurant = require('../models/Restaurant');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const TableBookingOffers = require('../restaurantModels/TableBookingOffers');
const { generateTokens, verifyToken } = require('../middleware/userAuth');
const { getRestaurantsAlongRoute } = require('../utils/routeUtils');
const jwt = require('jsonwebtoken');
const itemRoutes = require('./itemRoute');
const restaurentRoutes = require('./restaurentRoutes');
const cartRoutes = require('./cartRoutes');
const orderRequestRoutes = require('./orderRequestRoutes');
const orderRoutes = require('./orderRoutes');
const couponRoutes = require('./couponRoutes');
const userRatingRoutes = require('./userRatingRoutes');
const tableBookingRoutes = require('./tableBookingRoute');

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

    // Find OTP session
    const otpSession = await UserOtpSession.findOne({ mobileNo, otp });
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
    const { fullName } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name is required' 
      });
    }
    
    const updateData = { ...req.body };
    delete updateData.phone;

    const userId = req.user.userId;
    
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get restaurants along route
router.post('/restaurants-along-route', verifyToken, async (req, res) => {
  try {
    const { currentLocation, destinationLocation, bufferRadius = 5000 } = req.body;

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
    const { calculateDistance, getRestaurantsAlongRoute, getRouteSide, distanceToLineSegment, isAheadOnRoute } = require('../utils/routeUtils');
    const { isRestaurantOpen } = require('../utils/restaurantOperatingTiming');
    const allRestaurants = await Restaurant.find({ status: 'approved' });

    // Debug logging
    console.log('=== ROUTE ANALYSIS DEBUG ===');
    console.log('Current Location:', currentLocation);
    console.log('Destination Location:', destinationLocation);
    console.log('Buffer Radius (meters):', bufferRadius);
    console.log('Total approved restaurants found:', allRestaurants.length);
    console.log('\n=== RESTAURANT ANALYSIS ===');

    // Detailed analysis for each restaurant
    const restaurantAnalysis = await Promise.all(allRestaurants.map(async restaurant => {
      const restLat = parseFloat(restaurant.contactDetails.latitude);
      const restLng = parseFloat(restaurant.contactDetails.longitude);
      
      if (!restLat || !restLng) {
        console.log(`❌ Restaurant "${restaurant.basicInfo.restaurantName}" - Invalid coordinates: lat=${restaurant.contactDetails.latitude}, lng=${restaurant.contactDetails.longitude}`);
        return null;
      }

      // Calculate distance from restaurant to route line
      const distanceToRoute = distanceToLineSegment(
        restLat, restLng, 
        currentLocation.lat, currentLocation.lng, 
        destinationLocation.lat, destinationLocation.lng
      );
      
      const isAhead = isAheadOnRoute(
        restLat, restLng,
        currentLocation.lat, currentLocation.lng,
        destinationLocation.lat, destinationLocation.lng
      );
      
      // Determine which side of route
      const routeSide = getRouteSide(
        restLat, restLng,
        currentLocation.lat, currentLocation.lng,
        destinationLocation.lat, destinationLocation.lng
      );
      
      const distanceFromCurrent = await calculateDistance(currentLocation.lat, currentLocation.lng, restLat, restLng);
      const isWithinBuffer = distanceToRoute <= bufferRadius;
      
      console.log(`\n🏪 Restaurant: "${restaurant.basicInfo.restaurantName}"`);
      console.log(`   📍 Coordinates: ${restLat}, ${restLng}`);
      console.log(`   📏 Distance from current location: ${(distanceFromCurrent / 1000).toFixed(2)} km`);
      console.log(`   🛣️  Distance from route line: ${(distanceToRoute / 1000).toFixed(2)} km`);
      console.log(`   ⬆️  Is ahead on route: ${isAhead ? '✅ Yes' : '❌ No (behind current location)'}`);
      console.log(`   🎯 Within buffer radius (${bufferRadius}m): ${isWithinBuffer ? '✅ Yes' : '❌ No'}`);
      console.log(`   🔄 Route side: ${routeSide === 'left' ? '⬅️ LEFT' : routeSide === 'right' ? '➡️ RIGHT' : '🎯 CENTER'}`);
      console.log(`   🏁 Will be included: ${isAhead && isWithinBuffer ? '✅ YES' : '❌ NO'}`);
      
      return {
        restaurant,
        restLat,
        restLng,
        distanceToRoute,
        isAhead,
        isWithinBuffer,
        routeSide,
        willBeIncluded: isAhead && isWithinBuffer
      };
    }));
    const filteredAnalysis = restaurantAnalysis.filter(Boolean);

    const filteredRestaurants = await Promise.all(getRestaurantsAlongRoute(
      allRestaurants, 
      currentLocation, 
      destinationLocation, 
      bufferRadius
    ).map(async restaurant => {
      const restLat = parseFloat(restaurant.contactDetails.latitude);
      const restLng = parseFloat(restaurant.contactDetails.longitude);
      const distanceInMeters = await calculateDistance(currentLocation.lat, currentLocation.lng, restLat, restLng);
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);
      
      // Calculate if restaurant is open
      const isOpen = isRestaurantOpen(
        restaurant.basicInfo.operatingHours?.openTime,
        restaurant.basicInfo.operatingHours?.closeTime,
        restaurant.isManuallyClosed
      );
      

      
      // Get route side for response
      const routeSide = getRouteSide(
        restLat, restLng,
        currentLocation.lat, currentLocation.lng,
        destinationLocation.lat, destinationLocation.lng
      );
      
      const responseData = {
        _id: restaurant._id,
        basicInfo: {
          restaurantName: restaurant.basicInfo.restaurantName,
          foodCategory: restaurant.basicInfo.foodCategory,
          cuisineTypes: restaurant.basicInfo.cuisineTypes,
          operatingHours: restaurant.basicInfo.operatingHours
        },
        contactDetails: {
          address: restaurant.contactDetails.address,
          city: restaurant.contactDetails.city,
          state: restaurant.contactDetails.state,
          latitude: restaurant.contactDetails.latitude,
          longitude: restaurant.contactDetails.longitude
        },
        currency: restaurant.businessDetails?.currency,
        primaryImage: restaurant.documents?.primaryImage || null,
        distanceFromCurrentLocation: `${distanceInKm} km`,
        isOpen: isOpen,
        averageRating: restaurant.averageRating,
        totalRatings: restaurant.totalRatings,
        alcoholAvailable: restaurant.basicInfo?.alcoholAvailable,
        routeSide: routeSide
      };
      
      if (restaurant.tableReservationBooking) {
        responseData.minBufferTimeBeforeCancel = restaurant.tableReservationBookingConfig?.minBufferTimeBeforeCancel || 0;
      }
      
      return responseData;
    }));

    console.log('\n=== FINAL RESULTS ===');
    console.log(`✅ Restaurants included in results: ${filteredRestaurants.length}`);
    console.log(`❌ Restaurants excluded: ${allRestaurants.length - filteredRestaurants.length}`);
    const leftCount = filteredRestaurants.filter(r => r.routeSide === 'left').length;
    const rightCount = filteredRestaurants.filter(r => r.routeSide === 'right').length;
    const centerCount = filteredRestaurants.filter(r => r.routeSide === 'center').length;
    console.log(`📊 Side distribution - Left: ${leftCount}, Right: ${rightCount}, Center: ${centerCount}`);
    console.log('========================\n');

    res.json({
      success: true,
      message: 'Restaurants along route retrieved successfully',
      data: filteredRestaurants
    });
  } catch (error) {
    console.error('Error in restaurants-along-route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Use item routes
router.use('/items', itemRoutes);

// Use restaurant routes
router.use('/restaurents', restaurentRoutes);

// Use cart routes
router.use('/cart', cartRoutes);

// Use coupon routes
router.use('/coupons', couponRoutes);

// Use order request routes
router.use('/order-request', orderRequestRoutes);

// Use order routes
router.use('/orders', orderRoutes);

// Use user rating routes
router.use('/ratings', userRatingRoutes);

// Use table booking routes
router.use('/table-bookings', tableBookingRoutes);

module.exports = router;