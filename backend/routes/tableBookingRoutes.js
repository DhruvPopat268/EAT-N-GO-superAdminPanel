const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET route to get all table bookings for users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, date, slot, activeBookings, status, restaurantId, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Restaurant ID filter
    if (restaurantId) filter.restaurantId = restaurantId;
    
    // Status filter
    if (status) filter.status = status;
    
    // Filter out completed and cancelled bookings if activeBookings is true
    if (activeBookings === 'true') {
      filter.status = { $nin: ['completed', 'cancelled'] };
    }
    
    // Date range filter
    if (date) {
      const { startDate, endDate } = JSON.parse(date);
      if (startDate && endDate) {
        filter['bookingTimings.date'] = {
          $gte: startDate,
          $lte: endDate
        };
      } else if (startDate) {
        filter['bookingTimings.date'] = { $gte: startDate };
      } else if (endDate) {
        filter['bookingTimings.date'] = { $lte: endDate };
      }
    }
    
    // Slot filter
    if (slot) filter['bookingTimings.slotTime'] = slot;
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const User = require('../usersModels/usersModel');
      
      // Search for matching users by name or phone
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      
      // Build search conditions
      const searchConditions = [
        { userId: { $in: userIds } }
      ];
      
      // Check if search is a number for booking number search
      const numericSearch = parseInt(search);
      if (!isNaN(numericSearch)) {
        searchConditions.push({ tableBookingNo: numericSearch });
      }
      
      filter.$or = searchConditions;
    }
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Table bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table bookings',
      error: error.message
    });
  }
});

// GET route to get slots by restaurant ID
router.get('/slots/:restaurantId', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const slots = await TableBookingSlot.findOne({ restaurantId });
    
    if (!slots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this restaurant'
      });
    }
    
    // Extract only the time from timeSlots
    const timeSlots = slots.timeSlots.map(slot => slot.time);
    
    res.status(200).json({
      success: true,
      message: 'Slots retrieved successfully',
      data: timeSlots
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching slots',
      error: error.message
    });
  }
});

// GET route to get table booking detail by ID
router.get('/detail', authMiddleware, async (req, res) => {
  try {
    const { bookingId, restaurantId } = req.query;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'bookingId is required' 
      });
    }

    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'restaurantId is required' 
      });
    }

    const booking = await TableBooking.findOne({ _id: bookingId, restaurantId })
      .populate('userId', 'fullName phone email')
      .populate('restaurantId', 'basicInfo.restaurantName basicInfo.address');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Table booking not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Table booking retrieved successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching table booking details', 
      error: error.message 
    });
  }
});

// GET route to get in-progress table bookings (all except completed and cancelled)
router.get('/in-progress', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, date, slot, restaurantId, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object - exclude completed and cancelled
    const filter = { 
      status: { $nin: ['completed', 'cancelled'] }
    };
    
    // Restaurant ID filter
    if (restaurantId) filter.restaurantId = restaurantId;
    
    // Date range filter
    if (date) {
      const { startDate, endDate } = JSON.parse(date);
      if (startDate && endDate) {
        filter['bookingTimings.date'] = {
          $gte: startDate,
          $lte: endDate
        };
      } else if (startDate) {
        filter['bookingTimings.date'] = { $gte: startDate };
      } else if (endDate) {
        filter['bookingTimings.date'] = { $lte: endDate };
      }
    }
    
    // Slot filter
    if (slot) filter['bookingTimings.slotTime'] = slot;
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const User = require('../usersModels/usersModel');
      
      // Search for matching users by name or phone
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      
      // Build search conditions
      const searchConditions = [
        { userId: { $in: userIds } }
      ];
      
      // Check if search is a number for booking number search
      const numericSearch = parseInt(search);
      if (!isNaN(numericSearch)) {
        searchConditions.push({ tableBookingNo: numericSearch });
      }
      
      filter.$or = searchConditions;
    }
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'In-progress table bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching in-progress bookings',
      error: error.message
    });
  }
});

// GET route to get past table bookings (completed and cancelled)
router.get('/past', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, date, slot, restaurantId, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object - only completed and cancelled
    const filter = { 
      status: { $in: ['completed', 'cancelled'] }
    };
    
    // Restaurant ID filter
    if (restaurantId) filter.restaurantId = restaurantId;
    
    // Date range filter
    if (date) {
      const { startDate, endDate } = JSON.parse(date);
      if (startDate && endDate) {
        filter['bookingTimings.date'] = {
          $gte: startDate,
          $lte: endDate
        };
      } else if (startDate) {
        filter['bookingTimings.date'] = { $gte: startDate };
      } else if (endDate) {
        filter['bookingTimings.date'] = { $lte: endDate };
      }
    }
    
    // Slot filter
    if (slot) filter['bookingTimings.slotTime'] = slot;
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const User = require('../usersModels/usersModel');
      
      // Search for matching users by name or phone
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      
      // Build search conditions
      const searchConditions = [
        { userId: { $in: userIds } }
      ];
      
      // Check if search is a number for booking number search
      const numericSearch = parseInt(search);
      if (!isNaN(numericSearch)) {
        searchConditions.push({ tableBookingNo: numericSearch });
      }
      
      filter.$or = searchConditions;
    }
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .populate('restaurantId', 'basicInfo.restaurantName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Past table bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching past bookings',
      error: error.message
    });
  }
});

module.exports = router;