const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
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
  
  // Cart level totals for security
  cartTotal: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

cartSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);