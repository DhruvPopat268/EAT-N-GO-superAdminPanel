/**
 * Table Booking Configuration Routes
 * 
 * API Endpoints:
 * GET    /api/restaurants/table-booking/                    - Get table booking configuration
 * PATCH  /api/restaurants/table-booking/toggle             - Enable/disable table reservation booking
 * POST   /api/restaurants/table-booking/time-slots         - Create time slots configuration
 * PATCH  /api/restaurants/table-booking/time-slots         - Update time slots configuration
 * PATCH  /api/restaurants/table-booking/time-slots/status  - Update status of specific time slot
 * POST   /api/restaurants/table-booking/offers             - Create table booking offers
 * PATCH  /api/restaurants/table-booking/offers             - Update table booking offers
 * DELETE /api/restaurants/table-booking/offers             - Delete table booking offers
 * 
 * Authentication: All routes require restaurantAuthMiddleware
 * Validation: time-slots and offers routes require tableReservationBooking = true
 * 
 * Usage Examples:
 * 
 * 1. Get Configuration:
 *    GET /api/restaurants/table-booking/
 *    Headers: { Authorization: "Bearer <restaurant_token>" }
 *    Response: {
 *      tableReservationBooking: boolean,
 *      timeSlots: { duration, timeSlots: [{ _id, time, status }] } | null,
 *      offers: { offerType, percentage, fixedAmount, coverChargePerPerson, status, currency } | null
 *    }
 * 
 * 2. Toggle Table Booking:
 *    PATCH /api/restaurants/table-booking/toggle
 *    Body: { tableReservationBooking: true }
 * 
 * 3. Create Time Slots:
 *    POST /api/restaurants/table-booking/time-slots
 *    Body: { duration: 60 }
 *    Note: Auto-generates slots from restaurant operating hours
 * 
 * 4. Update Time Slots:
 *    PATCH /api/restaurants/table-booking/time-slots
 *    Body: { duration: 30 }
 * 
 * 5. Update Specific Time Slot Status:
 *    PATCH /api/restaurants/table-booking/time-slots/status
 *    Body: { 
 *      timeSlotId: "slot_id_1", 
 *      status: false 
 *    }
 *    Note: Updates status of a single time slot by its MongoDB _id
 * 
 * 6. Create Table Booking Offers:
 *    POST /api/restaurants/table-booking/offers
 *    Body: {
 *      offerType: "percentage",
 *      percentage: 20,
 *      coverChargePerPerson: 100,
 *      status: true,
 *      currency: { code: "INR", name: "Indian Rupee", symbol: "₹" }
 *    }
 * 
 * 7. Update Table Booking Offers:
 *    PATCH /api/restaurants/table-booking/offers
 *    Body: {
 *      offerType: "fixed",
 *      fixedAmount: 50,
 *      coverChargePerPerson: 150,
 *      status: false,
 *      currency: { code: "INR", name: "Indian Rupee", symbol: "₹" }
 *    }
 * 
 * 8. Delete Table Booking Offers:
 *    DELETE /api/restaurants/table-booking/offers
 */

const express = require('express');
const Restaurant = require('../models/Restaurant');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const TableBookingOffers = require('../restaurantModels/TableBookingOffers');
const restaurantAuthMiddleware = require('../middleware/restaurantAuth');
const router = express.Router();

// Helper function to generate time slots based on operating hours
const generateTimeSlots = (openTime, closeTime, duration, maxGuests = 1) => {
  const durationNum = parseInt(duration);
  const slots = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMin;
  let closeMinutes = closeHour * 60 + closeMin;
  
  // Handle overnight operations (e.g., 08:00 to 02:00 next day)
  if (closeMinutes <= openMinutes) {
    closeMinutes += 24 * 60; // Add 24 hours for next day
  }
  
  for (let minutes = openMinutes; minutes < closeMinutes; minutes += durationNum) {
    const hour = Math.floor(minutes / 60) % 24; // Use modulo to handle 24+ hours
    const min = minutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    slots.push({ 
      time: timeStr, 
      status: true, 
      maxGuests,
      onlineGuests: 0,
      offlineGuests: 0
    });
  }
  
  return slots;
};

// GET route to fetch table booking configuration
router.get('/', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    const [restaurant, timeSlots, offers] = await Promise.all([
      Restaurant.findById(restaurantId).select('tableReservationBooking'),
      TableBookingSlot.findOne({ restaurantId }),
      TableBookingOffers.find({ restaurantId })
    ]);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({
      tableReservationBooking: restaurant.tableReservationBooking,
      timeSlots: timeSlots || null,
      offers: offers || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH route to enable/disable table reservation booking
router.patch('/toggle', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { tableReservationBooking } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { tableReservationBooking },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({
      message: 'Table reservation booking updated successfully',
      tableReservationBooking: restaurant.tableReservationBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST route to create table booking time slots
router.post('/time-slots', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { duration, maxGuests } = req.body;
    const durationNum = parseInt(duration);
    const maxGuestsNum = parseInt(maxGuests);

    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }

    if (!maxGuests || isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
      return res.status(400).json({ message: 'Valid maxGuests is required' });
    }

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Check if time slots already exist
    const existingSlot = await TableBookingSlot.findOne({ restaurantId });
    if (existingSlot) {
      return res.status(409).json({ 
        message: 'Time slots already exist. Use PATCH to update.' 
      });
    }

    if (!restaurant?.basicInfo?.operatingHours?.openTime || !restaurant?.basicInfo?.operatingHours?.closeTime) {
      return res.status(400).json({ message: 'Restaurant operating hours not found' });
    }

    const { openTime, closeTime } = restaurant.basicInfo.operatingHours;
    const timeSlots = generateTimeSlots(openTime, closeTime, durationNum, maxGuestsNum);

    const slot = new TableBookingSlot({
      restaurantId,
      duration: durationNum,
      timeSlotCreatedWith: {
        maxGuests: maxGuestsNum
      },
      timeSlots
    });

    await slot.save();

    res.status(201).json({
      message: 'Time slots created successfully',
      data: slot
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH route to update table booking time slots
router.patch('/time-slots', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { duration, maxGuests } = req.body;
    const durationNum = parseInt(duration);
    const maxGuestsNum = parseInt(maxGuests);

    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }

    if (!maxGuests || isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
      return res.status(400).json({ message: 'Valid maxGuests is required' });
    }

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Check if time slots exist
    const existingSlot = await TableBookingSlot.findOne({ restaurantId });
    if (!existingSlot) {
      return res.status(404).json({ 
        message: 'Time slots not found. Use POST to create.' 
      });
    }

    if (!restaurant?.basicInfo?.operatingHours?.openTime || !restaurant?.basicInfo?.operatingHours?.closeTime) {
      return res.status(400).json({ message: 'Restaurant operating hours not found' });
    }

    const { openTime, closeTime } = restaurant.basicInfo.operatingHours;
    const timeSlots = generateTimeSlots(openTime, closeTime, durationNum, maxGuestsNum);

    const slot = await TableBookingSlot.findOneAndUpdate(
      { restaurantId },
      { 
        duration: durationNum, 
        timeSlots,
        timeSlotCreatedWith: {
          maxGuests: maxGuestsNum
        }
      },
      { new: true }
    );

    res.json({
      message: 'Time slots updated successfully',
      data: slot
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH route to update status of multiple time slots
router.patch('/time-slots/status', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { timeSlots } = req.body;

    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ message: 'timeSlots array is required and must not be empty' });
    }

    // Validate each time slot
    for (const slot of timeSlots) {
      if (!slot.timeSlotId) {
        return res.status(400).json({ message: 'timeSlotId is required for each slot' });
      }
      if (typeof slot.status !== 'boolean') {
        return res.status(400).json({ message: 'status must be a boolean value for each slot' });
      }
      if (slot.maxGuests !== undefined) {
        const maxGuestsNum = parseInt(slot.maxGuests);
        if (isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
          return res.status(400).json({ message: 'maxGuests must be a positive number for each slot' });
        }
      }
      if (slot.onlineGuests !== undefined) {
        const onlineGuestsNum = parseInt(slot.onlineGuests);
        if (isNaN(onlineGuestsNum) || onlineGuestsNum < 0) {
          return res.status(400).json({ message: 'onlineGuests must be a non-negative number for each slot' });
        }
      }
      if (slot.offlineGuests !== undefined) {
        const offlineGuestsNum = parseInt(slot.offlineGuests);
        if (isNaN(offlineGuestsNum) || offlineGuestsNum < 0) {
          return res.status(400).json({ message: 'offlineGuests must be a non-negative number for each slot' });
        }
      }
    }

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Find the time slots document
    const existingSlot = await TableBookingSlot.findOne({ restaurantId });
    if (!existingSlot) {
      return res.status(404).json({ 
        message: 'Time slots configuration not found' 
      });
    }

    // Update multiple slots using bulkWrite
    const bulkOperations = timeSlots.map(slot => {
      const updateObj = { 'timeSlots.$.status': slot.status };
      if (slot.maxGuests !== undefined) {
        updateObj['timeSlots.$.maxGuests'] = parseInt(slot.maxGuests);
      }
      if (slot.onlineGuests !== undefined) {
        updateObj['timeSlots.$.onlineGuests'] = parseInt(slot.onlineGuests);
      }
      if (slot.offlineGuests !== undefined) {
        updateObj['timeSlots.$.offlineGuests'] = parseInt(slot.offlineGuests);
      }

      return {
        updateOne: {
          filter: { 
            restaurantId,
            'timeSlots._id': slot.timeSlotId
          },
          update: { $set: updateObj }
        }
      };
    });

    // Execute bulk operations
    const bulkResult = await TableBookingSlot.bulkWrite(bulkOperations);

    // Get updated document
    const updatedSlot = await TableBookingSlot.findOne({ restaurantId });

    // Find the updated time slots to confirm changes
    const updatedTimeSlots = timeSlots.map(slot => {
      const updatedTimeSlot = updatedSlot.timeSlots.find(ts => 
        ts._id.toString() === slot.timeSlotId
      );
      return {
        timeSlotId: slot.timeSlotId,
        updated: updatedTimeSlot || null
      };
    });

    res.json({
      message: `${bulkResult.modifiedCount} time slots updated successfully`,
      data: updatedSlot,
      updatedTimeSlots: updatedTimeSlots,
      bulkResult: {
        modifiedCount: bulkResult.modifiedCount,
        matchedCount: bulkResult.matchedCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST route to create a single time slot in existing configuration
router.post('/time-slots/single', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { time, maxGuests, onlineGuests = 0, offlineGuests = 0, status = true } = req.body;

    // Validate required fields
    if (!time) {
      return res.status(400).json({ message: 'time is required' });
    }

    // Validate time format (HH:MM)
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return res.status(400).json({ message: 'time must be in 24-hour format (HH:MM)' });
    }

    const maxGuestsNum = parseInt(maxGuests);
    if (!maxGuests || isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
      return res.status(400).json({ message: 'Valid maxGuests is required' });
    }

    const onlineGuestsNum = parseInt(onlineGuests);
    if (isNaN(onlineGuestsNum) || onlineGuestsNum < 0) {
      return res.status(400).json({ message: 'onlineGuests must be a non-negative number' });
    }

    const offlineGuestsNum = parseInt(offlineGuests);
    if (isNaN(offlineGuestsNum) || offlineGuestsNum < 0) {
      return res.status(400).json({ message: 'offlineGuests must be a non-negative number' });
    }

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Find existing time slots configuration
    const existingSlot = await TableBookingSlot.findOne({ restaurantId });
    if (!existingSlot) {
      return res.status(404).json({ 
        message: 'Time slots configuration not found. Create time slots first using POST /time-slots' 
      });
    }

    // Check if time slot already exists
    const duplicateSlot = existingSlot.timeSlots.find(slot => slot.time === time);
    if (duplicateSlot) {
      return res.status(409).json({ 
        message: `Time slot ${time} already exists` 
      });
    }

    // Create new time slot object
    const newTimeSlot = {
      time,
      maxGuests: maxGuestsNum,
      onlineGuests: onlineGuestsNum,
      offlineGuests: offlineGuestsNum,
      status
    };

    // Add the new time slot to existing configuration
    const updatedSlot = await TableBookingSlot.findOneAndUpdate(
      { restaurantId },
      { $push: { timeSlots: newTimeSlot } },
      { new: true }
    );

    // Get the newly created slot (last one in the array)
    const createdSlot = updatedSlot.timeSlots[updatedSlot.timeSlots.length - 1];

    res.status(201).json({
      message: 'Single time slot created successfully',
      data: {
        slotConfiguration: updatedSlot,
        createdSlot: createdSlot
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST route to create table booking offers
router.post('/offers', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { name, percentage, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Offer name is required' });
    }

    const percentageNum = parseFloat(percentage);
    if (!percentage || isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      return res.status(400).json({ message: 'Valid percentage (0-100) is required' });
    }

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Check if offer with same name already exists
    const duplicateOffer = await TableBookingOffers.findOne({ 
      restaurantId,
      name: name.trim()
    });
    
    if (duplicateOffer) {
      return res.status(409).json({ 
        message: 'An offer with the same name already exists.' 
      });
    }

    const offerData = {
      restaurantId,
      name: name.trim(),
      percentage: percentageNum,
      status: status !== undefined ? status : true
    };

    const offer = new TableBookingOffers(offerData);

    await offer.save();

    res.status(201).json({
      message: 'Table booking offer created successfully',
      data: offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH route to update table booking offers
router.patch('/offers', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;
    const { offerId, name, percentage, status } = req.body;

    if (!offerId) {
      return res.status(400).json({ message: 'offerId is required' });
    }

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Prepare update object
    const updateObj = {};
    
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Offer name cannot be empty' });
      }
      updateObj.name = name.trim();
    }
    
    if (percentage !== undefined) {
      const percentageNum = parseFloat(percentage);
      if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
        return res.status(400).json({ message: 'Valid percentage (0-100) is required' });
      }
      updateObj.percentage = percentageNum;
    }
    
    if (status !== undefined) {
      updateObj.status = status;
    }

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({ message: 'At least one field to update is required' });
    }

    const offer = await TableBookingOffers.findOneAndUpdate(
      { _id: offerId, restaurantId },
      updateObj,
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ 
        message: 'Table booking offer not found' 
      });
    }

    res.json({
      message: 'Table booking offer updated successfully',
      data: offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE route to delete table booking offers
router.delete('/offers', restaurantAuthMiddleware, async (req, res) => {
  try {
    const restaurantId = req.restaurant.restaurantId;

    // Check if table reservation booking is enabled
    const restaurant = req.restaurantDetails;
    
    if (!restaurant?.tableReservationBooking) {
      return res.status(403).json({ 
        message: 'Table reservation booking is not enabled for this restaurant' 
      });
    }

    // Check if offers exist
    const existingOffer = await TableBookingOffers.findOne({ restaurantId });
    if (!existingOffer) {
      return res.status(404).json({ 
        message: 'Table booking offers not found' 
      });
    }

    await TableBookingOffers.findOneAndDelete({ restaurantId });

    res.json({
      message: 'Table booking offers deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;