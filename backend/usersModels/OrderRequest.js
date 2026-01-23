const mongoose = require('mongoose');

const orderRequestSchema = new mongoose.Schema(
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

    orderRequestNo: {
      type: Number,
      unique: true
    },

    // Cart items snapshot
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

    // dine-in OR takeaway
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      required: true,
    },

    // DINE-IN fields
    numberOfGuests: { type: Number },
    eatTimings: {
      startTime: { type: String }, // ex: 8:00 PM
      endTime: { type: String }    // ex: 9:00 PM
    },
    dineInstructions: { type: String },

    // TAKEAWAY fields
    takeawayTimings: {
      startTime: { type: String }, // ex: 7:00 PM
      endTime: { type: String }    // ex: 8:00 PM
    },
    takeawayInstructions: { type: String },

    // restaurant response
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'waiting', 'completed'],
      default: 'pending',
    },

    // if waiting
    waitingTime: {
      type: Number // minutes
    },

    // reason for rejection or waiting
    orderReqReasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderStatusReason'
    },

    // user selected payment option after acceptance/waiting
    paymentMethod: {
      type: String,
      enum: ['online', 'pay_at_restaurant'],
    },

    // final order id after payment success
    finalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate orderRequestNo
orderRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const OrderReqCounter = require('../models/OrderReqCounter');
    
    const counter = await OrderReqCounter.findOneAndUpdate(
      { restaurantId: this.restaurantId },
      { $inc: { orderRequestCount: 1 } },
      { new: true, upsert: true }
    );
    
    this.orderRequestNo = counter.orderRequestCount;
  }
  next();
});

module.exports = mongoose.model('OrderRequest', orderRequestSchema);