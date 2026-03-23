const express = require('express');
const TableBookingCheckAvailability = require('../usersModels/TableBookingCheckAvailability');
const TableBooking = require('../usersModels/TableBooking');
const Restaurant = require('../models/Restaurant');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const TableBookingOffers = require('../restaurantModels/TableBookingOffers');
const { verifyToken } = require('../middleware/userAuth');
const { isRestaurantOpen } = require('../utils/restaurantOperatingTiming');
const router = express.Router();

// POST route to check table booking availability
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      restaurantId,
      numberOfGuests,
      bookingTimings, // { date: "2024-01-15", slotId: "slot_id_here" }
      specialInstructions,
      offerId
    } = req.body;

    // Validate required fields
    if (!restaurantId || !numberOfGuests || !bookingTimings?.date || !bookingTimings?.slotId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId, numberOfGuests, bookingTimings.date, and bookingTimings.slotId are required'
      });
    }

    // Validate numberOfGuests
    if (numberOfGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: 'numberOfGuests must be greater than 0'
      });
    }

    // Check if restaurant exists, is approved, and has table booking enabled
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      status: 'approved',
      tableReservationBooking: true
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or table reservation booking is not available'
      });
    }

    // Check if restaurant is open and not manually closed
    const { openTime, closeTime } = restaurant.basicInfo.operatingHours || {};
    if (!isRestaurantOpen(openTime, closeTime, restaurant.isManuallyClosed)) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is currently closed'
      });
    }

    // Validate booking date (should be today or future)
    // Handle DD-MM-YYYY format properly
    const [day, month, year] = bookingTimings.date.split('-');
    const bookingDate = new Date(year, month - 1, day); // month is 0-indexed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Booking date parsed:', bookingDate);
    console.log('Today date:', today);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past'
      });
    }

    // Find time slots configuration for the restaurant
    const timeSlots = await TableBookingSlot.findOne({ restaurantId });
    if (!timeSlots) {
      return res.status(400).json({
        success: false,
        message: 'No time slots configured for this restaurant'
      });
    }

    // Find the specific slot by slotId with active status
    const requestedSlot = timeSlots.timeSlots.find(slot => 
      slot._id.toString() === bookingTimings.slotId && slot.status === true
    );

    if (!requestedSlot) {
      return res.status(400).json({
        success: false,
        message: 'Requested time slot not found or currently unavailable'
      });
    }

    // If booking is for today, validate that the slot time hasn't passed
    const isToday = bookingDate.getTime() === today.getTime();
    console.log('Is today booking:', isToday);
    
    if (isToday) {
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;
      
      console.log('Current time in minutes:', currentTimeInMinutes, `(${currentHours}:${currentMinutes})`);
      
      // Parse slot time (format: "12:00")
      const [slotHours, slotMinutes] = requestedSlot.time.split(':').map(Number);
      const slotTimeInMinutes = slotHours * 60 + slotMinutes;
      
      console.log('Slot time in minutes:', slotTimeInMinutes, `(${slotHours}:${slotMinutes})`);
      
      if (slotTimeInMinutes <= currentTimeInMinutes) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book a time slot that has already passed today',
          debug: {
            currentTime: `${currentHours}:${currentMinutes}`,
            slotTime: requestedSlot.time,
            currentTimeInMinutes,
            slotTimeInMinutes
          }
        });
      }
    }

    // Extract slot details
    const slotTime = requestedSlot.time;
    const maxGuests = requestedSlot.maxGuests;
    const onlineGuests = requestedSlot.onlineGuests; // Current guests sitting (online)
    const offlineGuests = requestedSlot.offlineGuests; // Current guests sitting (offline)

    // Calculate current occupied capacity
    const currentOccupiedGuests = onlineGuests + offlineGuests;
    
    // Calculate available capacity for new bookings
    const availableCapacity = maxGuests - currentOccupiedGuests;
    
    // Check if there's sufficient capacity for the requested number of guests
    if (availableCapacity < numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient capacity for the requested number of guests',
        availableCapacity: Math.max(0, availableCapacity),
        requestedGuests: numberOfGuests,
        maxCapacity: maxGuests,
        currentOccupied: currentOccupiedGuests,
        breakdown: {
          onlineGuests,
          offlineGuests
        }
      });
    }

    // Calculate cover charges
    const coverChargePerPerson = restaurant.tableReservationBookingConfig?.coverChargePerPerson || 0;
    const coverCharges = coverChargePerPerson * numberOfGuests;

    // Handle offer if provided
    let offerData = null;
    if (offerId) {
      const offer = await TableBookingOffers.findOne({
        _id: offerId,
        restaurantId,
        status: true
      });

      if (!offer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive offer'
        });
      }

      // Calculate offer percentages
      const adminOfferPercentageOnBill = restaurant.tableReservationBookingConfig?.adminOfferPercentageOnBill || 0;
      const restaurantOfferPercentageOnBill = offer.percentage; // Restaurant pays the full offer percentage

      offerData = {
        offerId: offer._id,
        offerName: offer.name,
        restaurantOfferPercentageOnBill,
        adminOfferPercentageOnBill,
        usageStatus: 'pending'
      };
    }

    // Calculate expiry time (current time + configurable minutes from .env)
    const expiryMinutes = parseInt(process.env.TABLE_BOOKING_AVAILABILITY_EXPIRY_MINUTES) || 30;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    // Create availability check record
    const availabilityData = {
      userId,
      restaurantId,
      numberOfGuests,
      bookingTimings: {
        date: bookingTimings.date,
        slotTime: slotTime
      },
      specialInstructions: specialInstructions || '',
      coverCharges,
      currency: restaurant.businessDetails?.currency || {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹'
      },
      expiresAt,
      ...(offerData && { offer: offerData })
    };

    const availabilityCheck = new TableBookingCheckAvailability(availabilityData);
    await availabilityCheck.save();

    // Update the TableBookingSlot - add guests to onlineGuests for this slot
    await TableBookingSlot.updateOne(
      { 
        restaurantId,
        'timeSlots._id': bookingTimings.slotId 
      },
      { 
        $inc: { 'timeSlots.$.onlineGuests': numberOfGuests } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Table availability confirmed',
      data: {
        checkAvailabilityId: availabilityCheck._id,
        expiresAt: availabilityCheck.expiresAt,
        expiresInMinutes: expiryMinutes,
        remainingCapacity: availableCapacity - numberOfGuests,
        slotDetails: {
          slotId: bookingTimings.slotId,
          time: slotTime,
          maxGuests,
          currentOccupied: {
            onlineGuests,
            offlineGuests,
            total: currentOccupiedGuests
          },
          availableCapacity,
          afterBooking: {
            remainingCapacity: availableCapacity - numberOfGuests
          }
        },
        bookingDetails: availabilityData
      }
    });

  } catch (error) {
    console.error('Error checking table availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking table availability',
      error: error.message
    });
  }
});

// GET route to cleanup expired availability checks
router.get('/cleanup-expired', async (req, res) => {
  try {
    const now = new Date();
    
    // Find all pending availability checks that have expired
    const expiredChecks = await TableBookingCheckAvailability.find({
      status: 'pending',
      expiresAt: { $lt: now }
    });

    if (expiredChecks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No expired availability checks found',
        data: {
          expiredCount: 0,
          expiredChecks: []
        }
      });
    }

    // Process each expired check to release slot capacity
    const processedChecks = [];
    
    for (const check of expiredChecks) {
      try {
        // Find the slot and release capacity
        const timeSlots = await TableBookingSlot.findOne({ restaurantId: check.restaurantId });
        const requestedSlot = timeSlots?.timeSlots.find(slot => 
          slot.time === check.bookingTimings.slotTime
        );
        
        if (requestedSlot) {
          // Decrease onlineGuests count to release the reserved capacity
          await TableBookingSlot.updateOne(
            { 
              restaurantId: check.restaurantId,
              'timeSlots._id': requestedSlot._id 
            },
            { 
              $inc: { 'timeSlots.$.onlineGuests': -check.numberOfGuests } 
            }
          );
        }

        // Mark as expired
        check.status = 'expired';
        await check.save();

        processedChecks.push({
          checkAvailabilityId: check._id,
          userId: check.userId,
          restaurantId: check.restaurantId,
          numberOfGuests: check.numberOfGuests,
          bookingDate: check.bookingTimings.date,
          slotTime: check.bookingTimings.slotTime,
          createdAt: check.createdAt,
          expiresAt: check.expiresAt,
          expiredMinutesAgo: Math.floor((now - check.expiresAt) / (1000 * 60))
        });
      } catch (error) {
        console.error(`Error processing expired check ${check._id}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully marked ${processedChecks.length} availability checks as expired`,
      data: {
        expiredCount: processedChecks.length,
        expiredChecks: processedChecks,
        cleanupTimestamp: now
      }
    });

  } catch (error) {
    console.error('Error cleaning up expired availability checks:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up expired availability checks',
      error: error.message
    });
  }
});

module.exports = router;