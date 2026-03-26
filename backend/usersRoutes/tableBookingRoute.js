const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const TableBookingCheckAvailability = require('../usersModels/TableBookingCheckAvailability');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');
const tableBookingCheckAvailabilityRoute = require('./tableBookingCheckAvailabilityRoute');
const DepositHandler = require('../utils/depositHandler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Use check availability route
router.use('/check-availability', tableBookingCheckAvailabilityRoute);

// Razorpay webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    // Verify Razorpay webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid Razorpay webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const { event, payload } = req.body;

    console.log('Received Razorpay webhook:', {
      event,
      paymentId: payload.payment?.entity?.id,
      orderId: payload.payment?.entity?.order_id
    });

    // Only process successful payments
    if (event !== 'payment.captured') {
      console.log('Ignoring non-payment.captured event:', event);
      return res.status(200).json({
        success: true,
        message: 'Event ignored'
      });
    }

    const paymentData = payload.payment.entity;
    const orderId = paymentData.order_id;

    // Fetch order details from Razorpay to get notes
    const orderData = await razorpay.orders.fetch(orderId);

    // Process payment through deposit handler
    const result = await DepositHandler.handleDeposit(paymentData, orderData);

    console.log('Payment processed successfully:', result);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return 200 to prevent Razorpay retries
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// POST route to create Razorpay order and table booking
router.post('/create-order', verifyToken, async (req, res) => {
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

    // Check if availability check is still valid
    const now = new Date();
    if (now > availabilityCheck.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Availability check has expired. Please check availability again.',
        expiredAt: availabilityCheck.expiresAt
      });
    }

    // Check if booking already exists
    const existingBooking = await TableBooking.findOne({
      userId,
      restaurantId: availabilityCheck.restaurantId,
      'bookingTimings.date': availabilityCheck.bookingTimings.date,
      'bookingTimings.slotTime': availabilityCheck.bookingTimings.slotTime
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Booking already exists for this slot',
        existingBookingId: existingBooking._id
      });
    }

    // Get cover charges amount
    const amount = availabilityCheck.coverCharges;
    const currency = availabilityCheck.currency?.code || 'INR';

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cover charges amount'
      });
    }

    // Create Razorpay order options
    const options = {
      amount: amount * 100, // Convert to paise (₹ to paise)
      currency: currency,
      receipt: `table_booking_${checkAvailabilityId}_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        type: 'table_booking_cover_charge',
        checkAvailabilityId: checkAvailabilityId,
        userId: userId.toString(),
        restaurantId: availabilityCheck.restaurantId.toString(),
        numberOfGuests: availabilityCheck.numberOfGuests,
        bookingDate: availabilityCheck.bookingTimings.date,
        slotTime: availabilityCheck.bookingTimings.slotTime
      }
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    // Create table booking with PENDING status
    const tableBookingData = {
      userId: availabilityCheck.userId,
      restaurantId: availabilityCheck.restaurantId,
      checkAvailabilityId: checkAvailabilityId,
      numberOfGuests: availabilityCheck.numberOfGuests,
      bookingTimings: availabilityCheck.bookingTimings,
      specialInstructions: availabilityCheck.specialInstructions,
      coverCharges: availabilityCheck.coverCharges,
      currency: availabilityCheck.currency,
      coverChargePaymentId: order.id, // Store Razorpay order ID initially
      coverChargePaymentStatus: 'pending', // Will be updated by webhook
      status: 'pending', // Will be confirmed by webhook
      ...(availabilityCheck.offer && { offer: availabilityCheck.offer })
    };

    const tableBooking = new TableBooking(tableBookingData);
    await tableBooking.save();

    // Populate the booking response
    const populatedBooking = await TableBooking.findById(tableBooking._id)
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state')
      .populate('userId', 'fullName phone');

    res.status(200).json({
      success: true,
      message: 'Razorpay order and table booking created successfully',
      data: {
        // Razorpay order details
        razorpayOrder: {
          orderId: order.id,
          amount: order.amount, // in paise
          currency: order.currency,
          receipt: order.receipt
        },
        // Table booking details
        tableBooking: {
          bookingId: tableBooking._id,
          status: tableBooking.status,
          coverChargePaymentStatus: tableBooking.coverChargePaymentStatus,
          bookingDetails: populatedBooking
        },
        // Additional info
        coverCharges: amount, // in rupees
        checkAvailabilityId,
        note: 'Booking created with pending status. Complete payment to confirm booking.'
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order and booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order and booking',
      error: error.message
    });
  }
});

// POST route to create a new table booking (dummy payment flow)
router.post('/dummy', verifyToken, async (req, res) => {
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

    // Generate dummy payment ID
    const dummyPaymentId = `dummy_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create table booking using data from availability check snapshot
    const tableBookingData = {
      userId: availabilityCheck.userId,
      restaurantId: availabilityCheck.restaurantId,
      checkAvailabilityId: checkAvailabilityId, // Store reference
      numberOfGuests: availabilityCheck.numberOfGuests,
      bookingTimings: availabilityCheck.bookingTimings,
      specialInstructions: availabilityCheck.specialInstructions,
      coverCharges: availabilityCheck.coverCharges,
      currency: availabilityCheck.currency,
      // Add dummy payment information
      coverChargePaymentId: dummyPaymentId,
      coverChargePaymentStatus: 'paid',
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
      message: 'Table booking created successfully (dummy payment)',
      data: {
        ...populatedBooking.toObject()
      }
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

// GET route for in-progress table bookings
router.get('/in-progress', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await TableBooking.find({
      userId,
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state')
      .sort({ 'bookingTimings.date': -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching in-progress bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching in-progress bookings',
      error: error.message
    });
  }
});

// GET route for past table bookings
router.get('/past', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await TableBooking.find({
      userId,
      status: { $in: ['completed', 'cancelled'] }
    })
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state')
      .sort({ 'bookingTimings.date': -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching past bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past bookings',
      error: error.message
    });
  }
});

module.exports = router;