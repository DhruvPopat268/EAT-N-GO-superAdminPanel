const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    orderRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderRequest',
      required: true,
    },

    orderNo: {
      type: Number,
      unique: true
    },

    // Copy items from order request
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      selectedAttribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute'
      },
      selectedFoodType: {
        type: String,
        enum: ['Regular', 'Jain', 'Swaminarayan'],
        default: 'Regular'
      },
      selectedCustomizations: [{
        customizationId: String,
        selectedOptions: [{
          optionId: String,
          quantity: Number,
          _id: false
        }],
        _id: false
      }],
      selectedAddons: [{
        addonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'AddonItem'
        },
        selectedAttribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attribute'
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        },
        _id: false
      }]
    }],

    // Copy from order request
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      required: true,
    },

    numberOfGuests: { type: Number },
    eatTimings: {
      startTime: { type: String },
      endTime: { type: String }
    },
    dineInstructions: { type: String },

    takeawayTimings: {
      startTime: { type: String },
      endTime: { type: String }
    },
    takeawayInstructions: { type: String },

    // Payment info
    paymentMethod: {
      type: String,
      enum: ['online', 'pay_at_restaurant'],
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    // Order status
    status: {
      type: String,
      enum: ['confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'refunded'],
      default: 'confirmed',
    },

    // Timestamps for status changes
    preparedAt: { type: Date },
    readyAt: { type: Date },
    servedAt: { type: Date },
    completedAt: { type: Date },

    // Cancellation/refund info
    cancellationReason: { type: String },
    refundAmount: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate orderNo
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const OrderCounter = require('../models/OrderCounter');
    
    const counter = await OrderCounter.findOneAndUpdate(
      { restaurantId: this.restaurantId },
      { $inc: { orderCount: 1 } },
      { new: true, upsert: true }
    );
    
    this.orderNo = counter.orderCount;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);