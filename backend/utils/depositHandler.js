const TableBooking = require('../usersModels/TableBooking');
const TableBookingCheckAvailability = require('../usersModels/TableBookingCheckAvailability');
const TableBookingSlot = require('../restaurantModels/TableBookingSlot');

/**
 * Simple Deposit Handler Utility
 * Routes payments to appropriate handlers based on entity type from notes
 */

class DepositHandler {
  
  /**
   * Main handler that routes to specific entity handlers
   * @param {Object} paymentData - Razorpay payment data
   * @param {Object} orderData - Razorpay order data
   * @returns {Object} - Processing result
   */
  static async handleDeposit(paymentData, orderData) {
    try {
      const notes = orderData.notes || {};
      const paymentType = notes.type;

      console.log('Processing payment for type:', paymentType);

      switch (paymentType) {
        case 'table_booking_cover_charge':
          return await this.handleTableBookingPayment(paymentData, orderData);
        
        case 'driver_deposit':
          return await this.handleDriverDeposit(paymentData, orderData);
        
        case 'restaurant_security_deposit':
          return await this.handleRestaurantDeposit(paymentData, orderData);
        
        default:
          throw new Error(`Unknown payment type: ${paymentType}`);
      }
    } catch (error) {
      console.error('Deposit handler error:', error);
      throw error;
    }
  }

  /**
   * Handle table booking cover charge payments
   */
  static async handleTableBookingPayment(paymentData, orderData) {
    try {
      const notes = orderData.notes;
      const checkAvailabilityId = notes.checkAvailabilityId;
      const userId = notes.userId;
      const paymentId = paymentData.id;

      // Find availability check
      const availabilityCheck = await TableBookingCheckAvailability.findById(checkAvailabilityId);
      if (!availabilityCheck) {
        throw new Error('Availability check not found');
      }

      // Find existing booking (should exist from create-order)
      const existingBooking = await TableBooking.findOne({
        userId,
        restaurantId: availabilityCheck.restaurantId,
        'bookingTimings.date': availabilityCheck.bookingTimings.date,
        'bookingTimings.slotTime': availabilityCheck.bookingTimings.slotTime,
        status: 'pending'
      });

      if (!existingBooking) {
        throw new Error('No pending booking found. Booking should be created via create-order endpoint first.');
      }

      // Update existing pending booking to confirmed
      existingBooking.coverChargePaymentId = paymentId; // Update with actual payment ID
      existingBooking.coverChargePaymentStatus = 'paid';
      existingBooking.status = 'confirmed';
      await existingBooking.save();

      // Mark availability check as completed
      availabilityCheck.status = 'completed';
      await availabilityCheck.save();

      return {
        success: true,
        action: 'confirmed_pending_booking',
        bookingId: existingBooking._id
      };

    } catch (error) {
      console.error('Table booking payment handler error:', error);
      throw error;
    }
  }

  /**
   * Handle driver deposit payments (placeholder for future)
   */
  static async handleDriverDeposit(paymentData, orderData) {
    try {
      console.log('Driver deposit handler - To be implemented');
      
      return {
        success: true,
        action: 'driver_deposit_processed'
      };
    } catch (error) {
      console.error('Driver deposit handler error:', error);
      throw error;
    }
  }

  /**
   * Handle restaurant security deposit payments (placeholder for future)
   */
  static async handleRestaurantDeposit(paymentData, orderData) {
    try {
      console.log('Restaurant deposit handler - To be implemented');
      
      return {
        success: true,
        action: 'restaurant_deposit_processed'
      };
    } catch (error) {
      console.error('Restaurant deposit handler error:', error);
      throw error;
    }
  }
}

module.exports = DepositHandler;