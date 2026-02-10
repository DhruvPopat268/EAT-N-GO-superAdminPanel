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

    orderRequestNo: Number,

    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        quantity: { type: Number, required: true, min: 1 },

        selectedAttribute: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' },
        selectedAttributePrice: { type: Number, default: 0 },

        selectedFoodType: {
          type: String,
          enum: ['Regular', 'Jain', 'Swaminarayan'],
          default: 'Regular'
        },

        selectedCustomizations: [
          {
            customizationId: String,
            customizationName: String,
            customizationType: String,
            isRequired: Boolean,
            selectedOptions: [
              {
                optionId: String,
                optionName: String,
                optionQuantity: Number,
                unit: String,
                price: Number,
                quantity: Number,
                _id: false
              }
            ],
            _id: false
          }
        ],

        selectedAddons: [
          {
            addonId: { type: mongoose.Schema.Types.ObjectId, ref: 'AddonItem' },
            selectedAttribute: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' },
            selectedAttributePrice: { type: Number, default: 0 },
            quantity: { type: Number, default: 1, min: 1 },
            _id: false
          }
        ],

        itemTotal: { type: Number, default: 0 },
        customizationTotal: { type: Number, default: 0 },
        addonTotal: { type: Number, default: 0 }
      }
    ],

    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      required: true
    },

    numberOfGuests: Number,
    eatTimings: { startTime: String, endTime: String },
    dineInstructions: String,

    takeawayTimings: { startTime: String, endTime: String },
    takeawayInstructions: String,

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'waiting', 'completed', 'cancelled'],
      default: 'pending'
    },

    cancelledBy: {
      type: String,
      enum: ['User', 'Restaurant', 'System']
    },

    waitingTime: {
      startTime: String,
      endTime: String
    },

    orderReqReasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderActionReason'
    },

    paymentMethod: {
      type: String,
      enum: ['online', 'pay_at_restaurant']
    },

    finalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },

    cartTotal: { type: Number, default: 0 },

    expireAt: { type: Date }
  },

  { timestamps: true }
);

orderRequestSchema.pre('save', async function (next) {
  if (this.isNew) {
    const OrderReqCounter = require('../models/OrderReqCounter');

    const counter = await OrderReqCounter.findOneAndUpdate(
      { restaurantId: this.restaurantId },
      { $inc: { orderRequestCount: 1 } },
      { new: true, upsert: true }
    );

    this.orderRequestNo = counter.orderRequestCount;

    if (this.status === 'pending') {
      this.expireAt = new Date(Date.now() + 5 * 60 * 1000);
    }
  }

  next();
});

orderRequestSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const newStatus = update.$set?.status;

  if (newStatus && newStatus !== 'pending') {
    this.setUpdate({
      ...update,
      $unset: { expireAt: "" }
    });
  }

  next();
});

orderRequestSchema.index({ restaurantId: 1, orderRequestNo: 1 }, { unique: true });
orderRequestSchema.index({ expireAt: 1, status: 1 });

module.exports = mongoose.model('OrderRequest', orderRequestSchema);