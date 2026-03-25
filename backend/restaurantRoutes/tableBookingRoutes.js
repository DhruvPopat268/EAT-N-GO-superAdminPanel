const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const router = express.Router();

// GET route to get all table bookings for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10, date, slot } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { restaurantId };
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching table bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching pending bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching confirmed bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching arrived bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching seated bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching completed bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching cancelled bookings:', error);
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
    const { page = 1, limit = 10, date, slot } = req.query;
    
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
    
    const totalCount = await TableBooking.countDocuments(filter);
    
    const bookings = await TableBooking.find(filter)
      .populate('userId', 'fullName phone')
      .sort({ 'bookingTimings.date': -1, 'bookingTimings.slotTime': -1, createdAt: -1 })
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
    console.error('Error fetching not arrived bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching not arrived bookings',
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
        $push: { 
          allocatedTables: { 
            tableNumbers,
            allocatedAt: new Date()
          } 
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
    console.error('Error allocating tables:', error);
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
    console.error('Error fetching booking details:', error);
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
      { _id: bookingId, restaurantId, status: 'confirmed' },
      { status: 'arrived' },
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
      message: 'Customer marked as arrived',
      data: booking
    });

  } catch (error) {
    console.error('Error updating arrival status:', error);
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
    console.error('Error updating seated status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seated status',
      error: error.message
    });
  }
});

// PATCH route to mark booking as completed
router.patch('/completed', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { _id: bookingId, restaurantId, status: 'seated' },
      { status: 'completed' },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or customer is not seated yet'
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
        console.error(`Slot not found for slotId: ${slotId}, restaurantId: ${restaurantId}`);
        // Still return success for booking completion, but log the issue
        return res.status(200).json({
          success: true,
          message: 'Booking marked as completed, but slot capacity could not be updated',
          warning: 'Slot not found - capacity may be inconsistent',
          data: booking
        });
      }

      if (slotUpdateResult.modifiedCount === 0) {
        console.warn(`Slot found but not modified for slotId: ${slotId}`);
      }
    } else {
      console.error(`No slotId found in booking: ${bookingId}`);
      return res.status(200).json({
        success: true,
        message: 'Booking marked as completed, but no slotId found',
        warning: 'Missing slotId - capacity may be inconsistent',
        data: booking
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking marked as completed',
      data: booking
    });

  } catch (error) {
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
    console.error('Error updating did not arrive status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating did not arrive status',
      error: error.message
    });
  }
});

// PATCH route to cancel booking
router.patch('/cancel', restaurantAuthMiddleware, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const restaurantId = req.restaurant.restaurantId;

    const booking = await TableBooking.findOneAndUpdate(
      { 
        _id: bookingId, 
        restaurantId, 
        status: { $in: ['pending', 'confirmed', 'notArrived'] }
      },
      { 
        status: 'cancelled',
        'cancellation.cancelledBy': 'Restaurant',
        'cancellation.reason': reason
      },
      { new: true }
    ).populate('userId', 'fullName phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be cancelled'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

module.exports = router;