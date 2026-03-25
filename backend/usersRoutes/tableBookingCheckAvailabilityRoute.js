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
    // Handle DD-MM-YYYY format properly with UTC
    const [day, month, year] = bookingTimings.date.split('-');
    const bookingDate = new Date(Date.UTC(year, month - 1, day)); // Force UTC creation
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Use UTC for consistency
    
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
    
    if (isToday) {
      // Convert current UTC time to IST (UTC + 5:30) since slots are stored in IST
      const currentTime = new Date();
      const istOffset = 5.5 * 60; // IST is UTC + 5:30 (5.5 hours in minutes)
      const currentUTCMinutes = currentTime.getUTCHours() * 60 + currentTime.getUTCMinutes();
      const currentISTMinutes = currentUTCMinutes + istOffset;
      
      // Handle day overflow (if IST time goes to next day)
      const currentISTHours = Math.floor(currentISTMinutes / 60) % 24;
      const currentISTMins = currentISTMinutes % 60;
      
      // Parse slot time (format: "12:00" - assumed to be in IST)
      const [slotHours, slotMinutes] = requestedSlot.time.split(':').map(Number);
      const slotTimeInMinutes = slotHours * 60 + slotMinutes;
      
      // Compare IST times
      const currentISTTimeInDay = currentISTMinutes % (24 * 60); // Handle day overflow
      
      if (slotTimeInMinutes <= currentISTTimeInDay) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book a time slot that has already passed today',
          debug: {
            currentUTCTime: `${currentTime.getUTCHours()}:${currentTime.getUTCMinutes().toString().padStart(2, '0')}`,
            currentISTTime: `${currentISTHours}:${currentISTMins.toString().padStart(2, '0')}`,
            slotTime: requestedSlot.time,
            currentISTTimeInMinutes: currentISTTimeInDay,
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
        adminOfferPercentageOnBill
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
      status: 'pending',
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
        _id: availabilityCheck._id,
        expiresInMinutes: expiryMinutes,
        remainingCapacity: availableCapacity - numberOfGuests,
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

// POST route to get available slots for a specific date
router.post('/get-slots', verifyToken, async (req, res) => {
  try {
    const { restaurantId, date } = req.body;

    // Validate required fields
    if (!restaurantId || !date) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId and date are required'
      });
    }

    // Find restaurant with table booking configuration
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

    // Find time slots configuration for the restaurant
    const timeSlots = await TableBookingSlot.findOne({ restaurantId });
    if (!timeSlots) {
      return res.status(404).json({
        success: false,
        message: 'No time slots configured for this restaurant'
      });
    }

    // Parse the provided date (DD-MM-YYYY format)
    const [day, month, year] = date.split('-');
    const providedDate = new Date(Date.UTC(year, month - 1, day));
    
    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Check if provided date is today
    const isToday = providedDate.getTime() === today.getTime();

    // Filter slots based on status and time (if today)
    let availableSlots = timeSlots.timeSlots.filter(slot => slot.status === true);
    let currentISTTime = null;
    
    if (isToday) {
      // Convert current UTC time to IST since slots are stored in IST
      const currentTime = new Date();
      const istOffset = 5.5 * 60; // IST is UTC + 5:30 (5.5 hours in minutes)
      const currentUTCMinutes = currentTime.getUTCHours() * 60 + currentTime.getUTCMinutes();
      const currentISTMinutes = currentUTCMinutes + istOffset;
      const currentISTTimeInDay = currentISTMinutes % (24 * 60); // Handle day overflow
      
      const currentISTHours = Math.floor(currentISTTimeInDay / 60);
      const currentISTMins = currentISTTimeInDay % 60;
      
      // Store formatted IST time for response
      currentISTTime = `${currentISTHours}:${currentISTMins.toString().padStart(2, '0')}`;
      
      // Filter out slots that have already passed today
      availableSlots = availableSlots.filter(slot => {
        const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
        const slotTimeInMinutes = slotHours * 60 + slotMinutes;
        
        // Return slots that are in the future (greater than current IST time)
        return slotTimeInMinutes > currentISTTimeInDay;
      });
    }

    // Format the response with slot details
    const formattedSlots = availableSlots.map(slot => ({
      slotId: slot._id,
      time: slot.time
    }));

    // Build response data
    const responseData = {
      restaurantId,
      date,
      isToday,
      totalSlots: formattedSlots.length,
      slots: formattedSlots,
      slotDuration: timeSlots.duration
    };

    // Add current IST time only if it's today
    if (isToday && currentISTTime) {
      responseData.currentISTTime = currentISTTime;
    }

    res.status(200).json({
      success: true,
      message: `Available slots retrieved for ${date}`,
      data: responseData
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting available slots',
      error: error.message
    });
  }
});

// POST route to get restaurant cover charges and offers
router.post('/offers-coverCharges', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    // Validate restaurantId
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId is required'
      });
    }

    // Find restaurant with table booking configuration
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

    // Get cover charge per person and admin offer percentage
    const coverChargePerPerson = restaurant.tableReservationBookingConfig?.coverChargePerPerson || 0;
    const adminOfferPercentageOnBill = restaurant.tableReservationBookingConfig?.adminOfferPercentageOnBill || 0;
    const currency = restaurant.businessDetails?.currency || {
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹'
    };

    // Find active offers for this restaurant
    const offers = await TableBookingOffers.find({
      restaurantId,
      status: true
    }).select('_id name percentage');

    // Calculate total discount percentage for each offer
    const formattedOffers = offers.map(offer => ({
      offerId: offer._id,
      name: offer.name,
      restaurantOfferPercentage: offer.percentage,
      adminOfferPercentage: adminOfferPercentageOnBill,
      totalDiscountPercentage: offer.percentage + adminOfferPercentageOnBill
    }));

    res.status(200).json({
      success: true,
      message: 'Restaurant information retrieved successfully',
      data: {
        restaurantId,
        coverCharges: {
          perPerson: coverChargePerPerson,
          currency
        },
        offers: formattedOffers,
        totalOffers: formattedOffers.length
      }
    });

  } catch (error) {
    console.error('Error getting restaurant information:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting restaurant information',
      error: error.message
    });
  }
});

module.exports = router;