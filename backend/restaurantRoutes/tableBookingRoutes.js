const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const router = express.Router();

// GET route to get all table bookings for restaurant
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ restaurantId });
    
    const bookings = await TableBooking.find({ restaurantId })
      .populate('userId', 'fullName phone')
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
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'pending' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'pending' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'confirmed' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'confirmed' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'arrived' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'arrived' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'seated' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'seated' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'completed' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'completed' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'cancelled' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'cancelled' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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

// GET route to get expired table bookings
router.get('/expired', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'expired' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'expired' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
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
    console.error('Error fetching expired bookings:', error);
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
      { status: 'didNotArrived' },
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
        status: { $in: ['pending', 'confirmed', 'didNotArrived'] }
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

// GET route to get no_show table bookings
router.get('/no-show', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const totalCount = await TableBooking.countDocuments({ 
      restaurantId, 
      status: 'no_show' 
    });
    
    const bookings = await TableBooking.find({ 
      restaurantId, 
      status: 'no_show' 
    })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'No-show table bookings retrieved successfully',
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
    console.error('Error fetching no-show bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching no-show bookings',
      error: error.message
    });
  }
});

module.exports = router;