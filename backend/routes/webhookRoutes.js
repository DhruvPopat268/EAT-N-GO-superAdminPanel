const express = require('express');
const crypto = require('crypto');
const DepositHandler = require('../utils/depositHandler');
const router = express.Router();

/**
 * Razorpay Webhook Handler
 * Processes payment confirmations and routes to appropriate handlers
 */

// Middleware to verify Razorpay webhook signature
const verifyRazorpaySignature = (req, res, next) => {
  try {
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

    next();
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return res.status(400).json({
      success: false,
      message: 'Signature verification failed'
    });
  }
};

// Main webhook endpoint
router.post('/razorpay', verifyRazorpaySignature, async (req, res) => {
  try {
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
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

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
    
    // Still return 200 to prevent Razorpay retries for application errors
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Webhook for payment failures (optional)
router.post('/razorpay-failed', verifyRazorpaySignature, async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log('Received Razorpay failure webhook:', {
      event,
      paymentId: payload.payment?.entity?.id,
      orderId: payload.payment?.entity?.order_id
    });

    // Handle payment failures
    if (event === 'payment.failed') {
      const paymentData = payload.payment.entity;
      // TODO: Handle payment failure logic
      console.log('Payment failed:', paymentData.id);
    }

    res.status(200).json({
      success: true,
      message: 'Failure webhook processed'
    });

  } catch (error) {
    console.error('Failure webhook processing error:', error);
    res.status(200).json({
      success: false,
      message: 'Failure webhook processing failed'
    });
  }
});

module.exports = router;