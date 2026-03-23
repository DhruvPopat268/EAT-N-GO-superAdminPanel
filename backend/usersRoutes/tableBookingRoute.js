const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const TableBookingCheckAvailability = require('../usersModels/TableBookingCheckAvailability');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');
const tableBookingCheckAvailabilityRoute = require('./tableBookingCheckAvailabilityRoute');
const router = express.Router();

// Use check availability route
router.use('/check-availability', tableBookingCheckAvailabilityRoute);

// POST route to create a new table booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { checkAvailabilityId } = req.body;

    // Validate required fields
    if (!checkAvailabilityId) {
      return res.status(400).json({
        success: false,
        message: 'checkAvailabilityId is required'
      });
    }

    // Find the availability check record
    const availabilityCheck = await TableBookingCheckAvailability.findOne({
      _id: checkAvailabilityId,
      userId,
      status: 'pending'
    });

    if (!availabilityCheck) {
      return res.status(404).json({
        success: false,
        message: 'Availability check not found or expired'
      });
    }

    // Check if availability check is still valid using stored expiry time
    const now = new Date();
    
    if (now > availabilityCheck.expiresAt) {
      // Mark as expired and release the slot capacity
      availabilityCheck.status = 'expired';
      await availabilityCheck.save();
      
      // Find the slot ID from the availability check data
      const timeSlots = await TableBookingSlot.findOne({ restaurantId: availabilityCheck.restaurantId });
      const requestedSlot = timeSlots?.timeSlots.find(slot => 
        slot.time === availabilityCheck.bookingTimings.slotTime
      );
      
      if (requestedSlot) {
        // Decrease onlineGuests count to release the reserved capacity
        await TableBookingSlot.updateOne(
          { 
            restaurantId: availabilityCheck.restaurantId,
            'timeSlots._id': requestedSlot._id 
          },
          { 
            $inc: { 'timeSlots.$.onlineGuests': -availabilityCheck.numberOfGuests } 
          }
        );
      }
      
      return res.status(400).json({
        success: false,
        message: 'Availability check has expired. Please check availability again.',
        expiredAt: availabilityCheck.expiresAt
      });
    }

    // Create table booking using data from availability check
    const tableBookingData = {
      userId: availabilityCheck.userId,
      restaurantId: availabilityCheck.restaurantId,
      numberOfGuests: availabilityCheck.numberOfGuests,
      bookingTimings: availabilityCheck.bookingTimings,
      specialInstructions: availabilityCheck.specialInstructions,
      coverCharges: availabilityCheck.coverCharges,
      currency: availabilityCheck.currency,
      ...(availabilityCheck.offer && { offer: availabilityCheck.offer })
    };

    const tableBooking = new TableBooking(tableBookingData);
    await tableBooking.save();

    // Mark availability check as completed
    availabilityCheck.status = 'completed';
    await availabilityCheck.save();

    // Populate the response with restaurant and user details
    const populatedBooking = await TableBooking.findById(tableBooking._id)
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state')
      .populate('userId', 'fullName phone');

    res.status(201).json({
      success: true,
      message: 'Table booking created successfully',
      data: populatedBooking
    });

  } catch (error) {
    console.error('Error creating table booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating table booking',
      error: error.message
    });
  }
});

// POST route to cancel availability check
router.post('/cancel-availability', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { checkAvailabilityId } = req.body;

    if (!checkAvailabilityId) {
      return res.status(400).json({
        success: false,
        message: 'checkAvailabilityId is required'
      });
    }

    // Find the availability check record
    const availabilityCheck = await TableBookingCheckAvailability.findOne({
      _id: checkAvailabilityId,
      userId,
      status: 'pending'
    });

    if (!availabilityCheck) {
      return res.status(404).json({
        success: false,
        message: 'Availability check not found or already processed'
      });
    }

    // Find the slot and release capacity
    const timeSlots = await TableBookingSlot.findOne({ restaurantId: availabilityCheck.restaurantId });
    const requestedSlot = timeSlots?.timeSlots.find(slot => 
      slot.time === availabilityCheck.bookingTimings.slotTime
    );
    
    if (requestedSlot) {
      // Decrease onlineGuests count to release the reserved capacity
      await TableBookingSlot.updateOne(
        { 
          restaurantId: availabilityCheck.restaurantId,
          'timeSlots._id': requestedSlot._id 
        },
        { 
          $inc: { 'timeSlots.$.onlineGuests': -availabilityCheck.numberOfGuests } 
        }
      );
    }

    // Mark as expired
    availabilityCheck.status = 'expired';
    await availabilityCheck.save();

    res.json({
      success: true,
      message: 'Availability check cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling availability check:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling availability check',
      error: error.message
    });
  }
});

module.exports = router;