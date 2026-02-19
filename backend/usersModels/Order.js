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
      type: Number
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
      selectedAttributePrice: {
        type: Number,
        default: 0
      },
      selectedFoodType: {
        type: String,
        enum: ['Regular', 'Jain', 'Swaminarayan'],
        default: 'Regular'
      },
      selectedCustomizations: [{
        customizationId: String,
        customizationName: String,
        customizationType: String,
        isRequired: Boolean,
        selectedOptions: [{
          optionId: String,
          optionName: String,
          optionQuantity: Number,
          unit: String,
          price: Number,
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
        selectedAttributePrice: {
          type: Number,
          default: 0
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        },
        _id: false
      }],
      
      // Calculated totals for security
      itemTotal: {
        type: Number,
        default: 0
      },
      customizationTotal: {
        type: Number,
        default: 0
      },
      addonTotal: {
        type: Number,
        default: 0
      }
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

    baseTotalAmount: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    appliedCoupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
      },
      savedAmount: {
        type: Number
      }
    },

    // Order status
    status: {
      type: String,
      enum: ['confirmed', 'waiting', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'refunded'],
      default: 'confirmed',
    },

    // Waiting time
    waitingTime: {
      startTime: String,
      endTime: String
    },

    // Timestamps for status changes
    waitingAt: { type: Date },
    preparedAt: { type: Date },
    readyAt: { type: Date },
    servedAt: { type: Date },
    completedAt: { type: Date },

    // Cancellation/refund info
    cancelledBy: {
      type: String,
      enum: ['Restaurant', 'User']
    },
    cancellationReasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderActionReason'
    },
    cancellationReason: { type: String },
    refundAmount: { type: Number },

    userRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userRating'
    },
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

// Compound unique index for per-restaurant order numbering
orderSchema.index({ restaurantId: 1, orderNo: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);