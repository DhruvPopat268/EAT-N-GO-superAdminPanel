const express = require('express');
const TableBooking = require('../usersModels/TableBooking');
const TableBookingCheckAvailability = require('../usersModels/TableBookingCheckAvailability');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../middleware/userAuth');
const tableBookingCheckAvailabilityRoute = require('./tableBookingCheckAvailabilityRoute');
const { emitToRestaurant } = require('../utils/socketUtils');
const { handleCoverChargePayment, handleFinalBillPayment, handleUserCancellation } = require('../utils/tableBookingSettlementHandler');
const router = express.Router();

// Use check availability route
router.use('/check-availability', tableBookingCheckAvailabilityRoute);

// POST route to create a new table booking
router.post('/dummy', verifyToken, async (req, res) => {
  const session = await TableBooking.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { checkAvailabilityId, coverChargesPaid } = req.body;

    // Validate required fields
    if (!checkAvailabilityId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'checkAvailabilityId is required'
      });
    }

    if (coverChargesPaid === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'coverChargesPaid is required'
      });
    }

    // Find the availability check record
    const availabilityCheck = await TableBookingCheckAvailability.findOne({
      _id: checkAvailabilityId,
      userId,
      status: 'pending'
    }).session(session);

    if (!availabilityCheck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Availability check not found or expired'
      });
    }

    // Verify cover charges match
    if (Math.abs(availabilityCheck.coverCharges - coverChargesPaid) > 0.01) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Cover charges mismatch. Please refresh and try again.',
        expected: availabilityCheck.coverCharges,
        received: coverChargesPaid
      });
    }

    // Get restaurant to fetch admin commission
    const restaurant = await Restaurant.findById(availabilityCheck.restaurantId)
      .select('adminCommission.tableBookingCommission')
      .session(session);
    
    if (!restaurant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if availability check is still valid using stored expiry time
    const now = new Date();
    
    if (now > availabilityCheck.expiresAt) {
      // Mark as expired and release the slot capacity
      availabilityCheck.status = 'expired';
      await availabilityCheck.save({ session });
      
      // Find the slot ID from the availability check data
      const timeSlots = await TableBookingSlot.findOne({ 
        restaurantId: availabilityCheck.restaurantId 
      }).session(session);
      
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
          },
          { session }
        );
      }
      
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Availability check has expired. Please check availability again.',
        expiredAt: availabilityCheck.expiresAt
      });
    }

    // Create Payment record for cover charges (testing mode - no actual gateway)
    const Payment = require('../models/Payment');
    const coverChargePayment = new Payment({
      userId: availabilityCheck.userId,
      restaurantId: availabilityCheck.restaurantId,
      referenceType: 'table_booking',
      referenceId: checkAvailabilityId, // Temporary reference, will be updated after booking creation
      tableBookingPaymentType: 'cover_charges',
      original: {
        amount: availabilityCheck.coverCharges,
        currency: availabilityCheck.currency.code
      },
      expected: {
        amount: availabilityCheck.coverCharges,
        currency: availabilityCheck.currency.code,
        rate: 1,
        source: null,
        calculatedAt: new Date()
      },
      actual: {
        amount: availabilityCheck.coverCharges,
        currency: availabilityCheck.currency.code,
        gateway: 'testing',
        fees: 0,
        tax: 0,
        gatewayTransactionId: `TEST_COVER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayOrderId: `COVER_${Date.now()}`,
        processedAt: new Date()
      },
      status: 'success'
    });

    await coverChargePayment.save({ session });

    // Create table booking using data from availability check snapshot
    const tableBookingData = {
      userId: availabilityCheck.userId,
      restaurantId: availabilityCheck.restaurantId,
      checkAvailabilityId: checkAvailabilityId,
      numberOfGuests: availabilityCheck.numberOfGuests,
      bookingTimings: availabilityCheck.bookingTimings,
      specialInstructions: availabilityCheck.specialInstructions,
      coverCharges: availabilityCheck.coverCharges,
      currency: availabilityCheck.currency,
      adminCommission: restaurant.adminCommission?.tableBookingCommission || 0,
      coverChargePaymentId: coverChargePayment._id,
      coverChargePaymentStatus: 'paid',
      ...(availabilityCheck.offer && { offer: availabilityCheck.offer })
    };

    const tableBooking = new TableBooking(tableBookingData);
    await tableBooking.save({ session });

    // Update payment referenceId to actual table booking ID
    coverChargePayment.referenceId = tableBooking._id;
    await coverChargePayment.save({ session });

    // Handle cover charge payment - Credit to AdminWallet
    await handleCoverChargePayment(tableBooking, coverChargePayment, session);

    // Mark availability check as completed
    availabilityCheck.status = 'completed';
    await availabilityCheck.save({ session });

    // Populate the response with restaurant and user details
    const populatedBooking = await TableBooking.findById(tableBooking._id)
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state contactDetails.latitude contactDetails.longitude documents.primaryImage')
      .populate('userId', 'fullName phone')
      .session(session);

    await session.commitTransaction();
    session.endSession();

    // Emit socket event to restaurant
    const io = req.app.get('io');
    if (io) {
      emitToRestaurant(io, availabilityCheck.restaurantId, 'new-table-booking', populatedBooking.toObject());
    }

    res.status(201).json({
      success: true,
      message: 'Table booking created successfully (dummy payment)',
      data: {
        ...populatedBooking.toObject(),
        coverChargePaymentId: coverChargePayment._id
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state contactDetails.latitude contactDetails.longitude documents.primaryImage')
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
      .populate('restaurantId', 'basicInfo.restaurantName contactDetails.address contactDetails.city contactDetails.state contactDetails.latitude contactDetails.longitude documents.primaryImage')
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

// POST route to check cancellation charges
router.post('/cancellation-charges', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tableBookingId } = req.body;

    if (!tableBookingId) {
      return res.status(400).json({
        success: false,
        message: 'tableBookingId is required'
      });
    }

    const booking = await TableBooking.findOne({
      _id: tableBookingId,
      userId,
      status: { $nin: ['cancelled', 'completed'] }
    }).populate('restaurantId', 'tableReservationBookingConfig.minBufferTimeBeforeCancel');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already cancelled/completed'
      });
    }

    // Current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);

    // Create slot datetime in IST (date is in UTC, slot time is in IST)
    const bookingDate = new Date(booking.bookingTimings.date); // UTC date
    const [hours, minutes] = booking.bookingTimings.slotTime.split(':');
    
    // Create IST date by adding IST offset to UTC date
    const istDate = new Date(bookingDate.getTime() + istOffset);
    istDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const timeDifferenceMinutes = (istDate - istNow) / (1000 * 60);
    const minBufferTime = booking.restaurantId.tableReservationBookingConfig?.minBufferTimeBeforeCancel || 0;

    let canCancel = true;
    let coverChargesRefundable = true;
    let message = '';

    if (booking.status === 'pending') {
      message = 'Free cancellation available. Full refund of cover charges.';
    } else if (timeDifferenceMinutes < minBufferTime) {
      coverChargesRefundable = false;
      message = `Cancellation allowed but cover charges (${booking.currency?.symbol || '₹'}${booking.coverCharges}) will not be refunded due to insufficient buffer time.`;
    } else {
      message = `Free cancellation available. Cover charges (${booking.currency?.symbol || '₹'}${booking.coverCharges}) will be refunded.`;
    }

    res.status(200).json({
      success: true,
      data: {
        canCancel,
        coverChargesRefundable,
        coverCharges: booking.coverCharges,
        currency: booking.currency,
        bufferTimeRemaining: Math.max(0, timeDifferenceMinutes),
        minBufferTimeRequired: minBufferTime,
        bookingStatus: booking.status,
        message
      }
    });

  } catch (error) {
    console.error('Error checking cancellation charges:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking cancellation charges',
      error: error.message
    });
  }
});

// POST route to calculate bill with offer discount
router.post('/calculate-bill', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tableBookingId, billAmount } = req.body;

    if (!tableBookingId || !billAmount) {
      return res.status(400).json({
        success: false,
        message: 'tableBookingId and billAmount are required'
      });
    }

    if (billAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'billAmount must be greater than 0'
      });
    }

    const booking = await TableBooking.findOne({
      _id: tableBookingId,
      userId,
      status: 'seated'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not in seated status'
      });
    }

    // Check if restaurant has set final bill
    if (!booking.finalBill || !booking.finalBill.amount) {
      return res.status(400).json({
        success: false,
        message: 'Final bill not yet set by restaurant. Please wait for restaurant to generate the bill.'
      });
    }

    // Check if payment was already collected at restaurant
    if (booking.finalBill.collectedBy === 'restaurant') {
      return res.status(400).json({
        success: false,
        message: 'Bill already paid at restaurant. No payment required via app.'
      });
    }

    // Validate billAmount matches restaurant's finalBill amount
    if (Math.abs(booking.finalBill.amount - billAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Bill amount mismatch. You must use the exact amount set by restaurant.',
        restaurantSetAmount: booking.finalBill.amount,
        yourAmount: billAmount
      });
    }

    let discountBreakup = {
      restaurantDiscount: 0,
      adminDiscount: 0,
      totalDiscount: 0
    };
    let discountedBillAmount = billAmount;
    let coverChargesDeducted = 0;

    if (booking.offer) {
      const restaurantOfferPercentage = booking.offer.restaurantOfferPercentageOnBill || 0;
      const adminOfferPercentage = booking.offer.adminOfferPercentageOnBill || 0;

      const restaurantDiscountAmount = (billAmount * restaurantOfferPercentage) / 100;
      const adminDiscountAmount = (billAmount * adminOfferPercentage) / 100;
      const totalDiscountAmount = restaurantDiscountAmount + adminDiscountAmount;
      
      discountedBillAmount = billAmount - totalDiscountAmount;

      discountBreakup = {
        restaurantDiscount: restaurantDiscountAmount,
        adminDiscount: adminDiscountAmount,
        totalDiscount: totalDiscountAmount
      };
    }

    if (booking.coverChargePaymentStatus === 'paid') {
      coverChargesDeducted = booking.coverCharges;
      discountedBillAmount = discountedBillAmount - coverChargesDeducted;
    }

    // Ensure discountedBillAmount is not negative
    if (discountedBillAmount < 0) {
      discountedBillAmount = 0;
    }

    res.status(200).json({
      success: true,
      data: {
        tableBookingId: booking._id,
        tableBookingNo: booking.tableBookingNo,
        originalBillAmount: billAmount,
        discountedBillAmount: parseFloat(discountedBillAmount.toFixed(2)),
        currency: booking.currency,
        coverCharges: booking.coverCharges,
        coverChargePaymentStatus: booking.coverChargePaymentStatus,
        offer: booking.offer ? {
          offerName: booking.offer.offerName,
          offerDescription: booking.offer.offerDescription,
          restaurantOfferPercentage: booking.offer.restaurantOfferPercentageOnBill || 0,
          adminOfferPercentage: booking.offer.adminOfferPercentageOnBill || 0,
          totalDiscountPercentage: (booking.offer.restaurantOfferPercentageOnBill || 0) + (booking.offer.adminOfferPercentageOnBill || 0)
        } : null,
        discountBreakup: {
          restaurantDiscount: parseFloat(discountBreakup.restaurantDiscount.toFixed(2)),
          adminDiscount: parseFloat(discountBreakup.adminDiscount.toFixed(2)),
          totalDiscount: parseFloat(discountBreakup.totalDiscount.toFixed(2)),
          coverChargesDeducted: parseFloat(coverChargesDeducted.toFixed(2))
        }
      }
    });

  } catch (error) {
    console.error('Error calculating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating bill',
      error: error.message
    });
  }
});

// POST route to pay final bill (testing mode)
router.post('/pay-final-bill', verifyToken, async (req, res) => {
  const session = await TableBooking.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { tableBookingId, originalFinalBill, discountedFinalBill } = req.body;

    if (!tableBookingId || originalFinalBill === undefined || discountedFinalBill === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'tableBookingId, originalFinalBill, and discountedFinalBill are required'
      });
    }

    if (originalFinalBill <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'originalFinalBill must be greater than 0'
      });
    }

    const booking = await TableBooking.findOne({
      _id: tableBookingId,
      userId,
      status: 'seated'
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not in seated status'
      });
    }

    // Check if restaurant has set final bill
    if (!booking.finalBill || !booking.finalBill.amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Final bill not yet set by restaurant. Please wait for restaurant to generate the bill.'
      });
    }

    // Check if payment was already collected at restaurant
    if (booking.finalBill.collectedBy === 'restaurant') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Bill already paid at restaurant. No payment required via app.'
      });
    }

    // Validate originalFinalBill matches restaurant's finalBill amount
    if (Math.abs(booking.finalBill.amount - originalFinalBill) > 0.01) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Bill amount mismatch. You must pay the exact amount set by restaurant.',
        restaurantSetAmount: booking.finalBill.amount,
        yourAmount: originalFinalBill
      });
    }

    // Calculate bill on backend to verify
    let discountBreakup = {
      restaurantDiscount: 0,
      adminDiscount: 0,
      totalDiscount: 0
    };
    let calculatedDiscountedBill = originalFinalBill;
    let coverChargesDeducted = 0;

    if (booking.offer) {
      const restaurantOfferPercentage = booking.offer.restaurantOfferPercentageOnBill || 0;
      const adminOfferPercentage = booking.offer.adminOfferPercentageOnBill || 0;

      const restaurantDiscountAmount = (originalFinalBill * restaurantOfferPercentage) / 100;
      const adminDiscountAmount = (originalFinalBill * adminOfferPercentage) / 100;
      const totalDiscountAmount = restaurantDiscountAmount + adminDiscountAmount;
      
      calculatedDiscountedBill = originalFinalBill - totalDiscountAmount;

      discountBreakup = {
        restaurantDiscount: restaurantDiscountAmount,
        adminDiscount: adminDiscountAmount,
        totalDiscount: totalDiscountAmount
      };
    }

    if (booking.coverChargePaymentStatus === 'paid') {
      coverChargesDeducted = booking.coverCharges;
      calculatedDiscountedBill = calculatedDiscountedBill - coverChargesDeducted;
    }

    if (calculatedDiscountedBill < 0) {
      calculatedDiscountedBill = 0;
    }

    // Verify frontend calculation matches backend
    if (Math.abs(calculatedDiscountedBill - discountedFinalBill) > 0.01) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Bill calculation mismatch. Please refresh and try again.',
        calculated: parseFloat(calculatedDiscountedBill.toFixed(2)),
        received: discountedFinalBill
      });
    }

    // Create Payment record (testing mode - no actual gateway)
    const Payment = require('../models/Payment');
    const payment = new Payment({
      userId: booking.userId,
      restaurantId: booking.restaurantId,
      referenceType: 'table_booking',
      referenceId: booking._id,
      tableBookingPaymentType: 'final_bill',
      original: {
        amount: discountedFinalBill,
        currency: booking.currency.code
      },
      expected: {
        amount: discountedFinalBill,
        currency: booking.currency.code,
        rate: 1,
        source: null,
        calculatedAt: new Date()
      },
      actual: {
        amount: discountedFinalBill,
        currency: booking.currency.code,
        gateway: 'testing',
        fees: 0,
        tax: 0,
        gatewayTransactionId: `TEST_FINAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayOrderId: `FINAL_BILL_${Date.now()}`,
        processedAt: new Date()
      },
      status: 'success'
    });

    await payment.save({ session });

    // Update table booking
    booking.finalBillPaymentId = payment._id;
    booking.finalBillPaidBreakdown = {
      originalFinalBill: originalFinalBill,
      restaurantDiscount: discountBreakup.restaurantDiscount,
      adminDiscount: discountBreakup.adminDiscount,
      coverChargesDeducted: coverChargesDeducted,
      discountedFinalBill: calculatedDiscountedBill
    };
    booking.status = 'completed';

    await booking.save({ session });

    // Handle final bill payment and settlement
    await handleFinalBillPayment(booking, payment, session);

    // Decrement online guests count from the slot
    await TableBookingSlot.updateOne(
      { 
        restaurantId: booking.restaurantId,
        'timeSlots._id': booking.bookingTimings.slotId 
      },
      { 
        $inc: { 'timeSlots.$.onlineGuests': -booking.numberOfGuests } 
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Final bill paid successfully and booking completed',
      data: {
        tableBookingId: booking._id,
        paymentId: payment._id,
        status: booking.status,
        finalBillPaidBreakdown: booking.finalBillPaidBreakdown,
        currency: booking.currency
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing final bill payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing final bill payment',
      error: error.message
    });
  }
});

// POST route to cancel table booking
router.post('/cancel', verifyToken, async (req, res) => {
  const session = await TableBooking.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { tableBookingId, reason } = req.body;

    if (!tableBookingId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'tableBookingId is required'
      });
    }

    const booking = await TableBooking.findOne({
      _id: tableBookingId,
      userId,
      status: { $nin: ['cancelled', 'completed'] }
    }).populate('restaurantId', 'tableReservationBookingConfig.minBufferTimeBeforeCancel').session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already cancelled/completed'
      });
    }

    // Current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);

    // Create slot datetime in IST (date is in UTC, slot time is in IST)
    const bookingDate = new Date(booking.bookingTimings.date); // UTC date
    const [hours, minutes] = booking.bookingTimings.slotTime.split(':');
    
    // Create IST date by adding IST offset to UTC date
    const istDate = new Date(bookingDate.getTime() + istOffset);
    istDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const timeDifferenceMinutes = (istDate - istNow) / (1000 * 60);
    const minBufferTime = booking.restaurantId.tableReservationBookingConfig?.minBufferTimeBeforeCancel || 0;

    let coverChargesRefundable = true;
    let refundStatus = 'refunded';

    // Determine refund eligibility
    if (booking.status === 'pending') {
      coverChargesRefundable = true;
      refundStatus = 'refunded';
    } else if (timeDifferenceMinutes < minBufferTime) {
      coverChargesRefundable = false;
      refundStatus = 'not_refunded';
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.lastStatusUpdatedBy = 'User';
    booking.cancellation = {
      cancelledBy: 'User',
      reason: reason || 'Cancelled by user'
    };
    
    if (coverChargesRefundable) {
      booking.coverChargePaymentStatus = 'refunded';
      booking.coverChargesRefundedAmount = booking.coverCharges;
    } else {
      booking.coverChargesRefundedAmount = 0;
    }

    await booking.save({ session });

    // Handle user cancellation refund (if applicable)
    await handleUserCancellation(booking, coverChargesRefundable, session);

    // Decrement online guests count from the slot
    await TableBookingSlot.updateOne(
      { 
        restaurantId: booking.restaurantId,
        'timeSlots._id': booking.bookingTimings.slotId 
      },
      { 
        $inc: { 'timeSlots.$.onlineGuests': -booking.numberOfGuests } 
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        tableBookingId: booking._id,
        status: booking.status,
        coverChargesRefunded: coverChargesRefundable,
        refundAmount: coverChargesRefundable ? booking.coverCharges : 0,
        currency: booking.currency,
        refundStatus,
        message: coverChargesRefundable 
          ? `Booking cancelled. Cover charges of ${booking.currency?.symbol || '₹'}${booking.coverCharges} will be refunded.`
          : `Booking cancelled. Cover charges of ${booking.currency?.symbol || '₹'}${booking.coverCharges} will not be refunded due to insufficient buffer time.`
      }
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