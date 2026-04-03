const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const { handleRestaurantCancellation, handleRestaurantCollectedPayment } = require('../utils/tableBookingSettlementHandler');
const router = express.Router();

// Helper function for search
const addSearchFilter = async (filter, search) => {
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
  return filter;
};

// GET route to get all table bookings for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, activeBookings, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
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

// GET route to get pending table bookings
router.get('/pending', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'pending' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Pending table bookings retrieved successfully',
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
      message: 'Error fetching pending bookings',
      error: error.message
    });
  }
});

// GET route to get confirmed table bookings
router.get('/confirmed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'confirmed' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Confirmed table bookings retrieved successfully',
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
      message: 'Error fetching confirmed bookings',
      error: error.message
    });
  }
});

// GET route to get arrived table bookings
router.get('/arrived', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'arrived' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Arrived table bookings retrieved successfully',
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
      message: 'Error fetching arrived bookings',
      error: error.message
    });
  }
});

// GET route to get seated table bookings
router.get('/seated', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'seated' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Seated table bookings retrieved successfully',
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
      message: 'Error fetching seated bookings',
      error: error.message
    });
  }
});

// GET route to get completed table bookings
router.get('/completed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'completed' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Completed table bookings retrieved successfully',
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
      message: 'Error fetching completed bookings',
      error: error.message
    });
  }
});

// GET route to get cancelled table bookings
router.get('/cancelled', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'cancelled' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Cancelled table bookings retrieved successfully',
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
      message: 'Error fetching cancelled bookings',
      error: error.message
    });
  }
});

// GET route to get not arrived table bookings
router.get('/not-arrived', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'notArrived' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Not arrived table bookings retrieved successfully',
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
      message: 'Error fetching not arrived bookings',
      error: error.message
    });
  }
});

// GET route to get expired table bookings
router.get('/expired', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId, status: 'expired' };
    
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
    await addSearchFilter(filter, search);
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({  createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Expired table bookings retrieved successfully',
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
      message: 'Error fetching expired bookings',
      error: error.message
    });
  }
});

// PATCH route to allocate tables
router.patch('/allocate-tables', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { tableNumbers, bookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { _id: bookingId, restaurantId },
      { 
        allocatedTables: { 
          tableNumbers,
          allocatedAt: new Date()
        },
        status: 'confirmed'
      },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Table booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tables allocated successfully',
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error allocating tables',
      error: error.message
    });
  }
});

// POST route to get table booking details
router.post('/details', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { tableBookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOne({ 
      _id: tableBookingId, 
      restaurantId 
    })
      .populate('userId', 'fullName phone email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Table booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Table booking details retrieved successfully',
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details',
      error: error.message
    });
  }
});

// PATCH route to mark customer as arrived
router.patch('/arrived', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { _id: bookingId, restaurantId, status: { $in: ['confirmed', 'notArrived'] } },
      { status: 'arrived' },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not in confirmed/notArrived status'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer marked as arrived',
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating arrival status',
      error: error.message
    });
  }
});

// PATCH route to mark customer as seated
router.patch('/seated', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { _id: bookingId, restaurantId, status: 'arrived' },
      { status: 'seated' },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or customer has not arrived yet'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer marked as seated',
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating seated status',
      error: error.message
    });
  }
});

// PATCH route to mark booking as completed
router.patch('/completed', restaurantAuthMiddleware, async (req, res) => {
  const session = await TableBooking.startSession();
  session.startTransaction();

  try {
    const { bookingId, finalBillAmount, collectedBy } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    if (!finalBillAmount || !collectedBy) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'finalBillAmount and collectedBy are required'
      });
    }

    if (!['restaurant', 'app'].includes(collectedBy)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'collectedBy must be either "restaurant" or "app"'
      });
    }

    // Check if already completed
    const existingBooking = await TableBooking.findOne({ 
      _id: bookingId, 
      restaurantId 
    }).session(session);

    if (!existingBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (existingBooking.status === 'completed') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Booking already completed. Cannot modify final bill details.'
      });
    }

    if (existingBooking.status !== 'seated') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Booking must be in seated status to complete'
      });
    }

    // Determine status based on collectedBy
    const newStatus = collectedBy === 'restaurant' ? 'completed' : 'seated';
    
    existingBooking.status = newStatus;
    existingBooking.finalBill = {
      amount: finalBillAmount,
      collectedBy: collectedBy,
      setAt: new Date()
    };

    await existingBooking.save({ session });

    // If collected by restaurant, handle settlement and decrement slot capacity
    if (collectedBy === 'restaurant') {
      await handleRestaurantCollectedPayment(existingBooking, finalBillAmount, session);
      await existingBooking.save({ session });

      // Decrement slot capacity only for restaurant collection
      // For app payment, capacity is already decremented in /pay-final-bill route
      const slotId = existingBooking.bookingTimings.slotId;
      const numberOfGuests = existingBooking.numberOfGuests;

      if (slotId) {
        const slotUpdateResult = await TableBookingSlot.updateOne(
          { 
            restaurantId,
            'timeSlots._id': slotId 
          },
          { 
            $inc: { 'timeSlots.$.onlineGuests': -numberOfGuests }
          },
          { session }
        );

        if (slotUpdateResult.matchedCount === 0) {
          await session.commitTransaction();
          session.endSession();
          const booking = await TableBooking.findById(bookingId)
            .populate('userId', 'fullName phone');
          return res.status(200).json({
            success: true,
            message: 'Booking marked as completed, but slot capacity could not be updated',
            warning: 'Slot not found - capacity may be inconsistent',
            data: booking
          });
        }
      } else {
        await session.commitTransaction();
        session.endSession();
        const booking = await TableBooking.findById(bookingId)
          .populate('userId', 'fullName phone');
        return res.status(200).json({
          success: true,
          message: 'Booking marked as completed, but no slotId found',
          warning: 'Missing slotId - capacity may be inconsistent',
          data: booking
        });
      }
    }

    const booking = await TableBooking.findById(bookingId)
      .populate('userId', 'fullName phone')
      .session(session);

    await session.commitTransaction();
    session.endSession();

    if (collectedBy === 'restaurant') {
      return res.status(200).json({
        success: true,
        message: 'Booking marked as completed and settlement processed',
        data: booking
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Final bill set. Waiting for customer payment via app.',
        data: booking
      });
    }

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating completed status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating completed status',
      error: error.message
    });
  }
});

// PATCH route to mark customer as did not arrive
router.patch('/did-not-arrive', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { _id: bookingId, restaurantId, status: 'confirmed' },
      { status: 'notArrived' },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not in confirmed status'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer marked as did not arrive',
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating did not arrive status',
      error: error.message
    });
  }
});

// PATCH route to mark booking as expired
router.patch('/expired', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { _id: bookingId, restaurantId, status: 'notArrived' },
      { status: 'expired' },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not in not arrived status'
      });
    }

    // Update slot: remove guests from onlineGuests using slotId
    const slotId = booking.bookingTimings.slotId;
    const numberOfGuests = booking.numberOfGuests;

    if (slotId) {
      const slotUpdateResult = await TableBookingSlot.updateOne(
        { 
          restaurantId,
          'timeSlots._id': slotId 
        },
        { 
          $inc: { 'timeSlots.$.onlineGuests': -numberOfGuests }
        }
      );

      // Check if slot was found and updated
      if (slotUpdateResult.matchedCount === 0) {
        // Still return success for booking expiration, but log the issue
        return res.status(200).json({
          success: true,
          message: 'Booking marked as expired, but slot capacity could not be updated',
          warning: 'Slot not found - capacity may be inconsistent',
          data: booking
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: 'Booking marked as expired, but no slotId found',
        warning: 'Missing slotId - capacity may be inconsistent',
        data: booking
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking marked as expired',
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating expired status',
      error: error.message
    });
  }
});

// PATCH route to cancel booking
router.patch('/cancel', restaurantAuthMiddleware, async (req, res) => {
  const session = await TableBooking.startSession();
  session.startTransaction();

  try {
    const { bookingId, reason } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOne({
      _id: bookingId,
      restaurantId,
      status: { $in: ['pending', 'confirmed'] }
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be cancelled'
      });
    }

    // Restaurant cancellation always refunds full amount
    booking.status = 'cancelled';
    booking.coverChargePaymentStatus = 'refunded';
    booking.coverChargesRefundedAmount = booking.coverCharges;
    booking.cancellation = {
      cancelledBy: 'Restaurant',
      reason: reason
    };

    await booking.save({ session });

    // Handle restaurant cancellation refund
    await handleRestaurantCancellation(booking, session);

    const populatedBooking = await TableBooking.findById(booking._id)
      .populate('userId', 'fullName phone')
      .session(session);

    // Update slot: remove guests from onlineGuests using slotId
    const slotId = populatedBooking.bookingTimings.slotId;
    const numberOfGuests = booking.numberOfGuests;

    if (slotId) {
      const slotUpdateResult = await TableBookingSlot.updateOne(
        { 
          restaurantId,
          'timeSlots._id': slotId 
        },
        { 
          $inc: { 'timeSlots.$.onlineGuests': -numberOfGuests }
        },
        { session }
      );

      // Check if slot was found and updated
      if (slotUpdateResult.matchedCount === 0) {
        await session.commitTransaction();
        session.endSession();
        // Still return success for booking cancellation, but log the issue
        return res.status(200).json({
          success: true,
          message: 'Booking cancelled successfully and cover charges will be refunded, but slot capacity could not be updated',
          warning: 'Slot not found - capacity may be inconsistent',
          data: populatedBooking
        });
      }
    } else {
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully and cover charges will be refunded, but no slotId found',
        warning: 'Missing slotId - capacity may be inconsistent',
        data: populatedBooking
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and cover charges will be refunded',
      data: populatedBooking
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

module.exports = router;