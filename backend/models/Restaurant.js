const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  // Basic Information
  basicInfo: {
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodCategory: { type: String, enum: ['Veg', 'Non-Veg', 'Mixed'], required: true },
    alcoholAvailable: { type: Boolean, default: false },
    cuisineTypes: [{ type: String, required: true }],
    otherCuisine: { type: String },
    facilities: [{ type: String }],
    operatingHours: {
      openTime: { type: String }, // Format: "09:00"
      closeTime: { type: String } // Format: "22:00"
    }
  },

  // Contact Details
  contactDetails: {
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: String },
    longitude: { type: String }
  },

  // Business Details
  businessDetails: {
    licenseNumber: { type: String, required: true },
    gstNumber: { type: String, required: true },
    bankAccount: { type: String, required: true },
    ifscCode: { type: String, required: true },
    description: { type: String },

    currency: {
      code: { type: String },     // e.g., "INR"
      name: { type: String },     // e.g., "Indian Rupee"
      symbol: { type: String }    // e.g., "₹"
    }
  },

  // Documents
  documents: {
    businessLicense: { type: String },
    gstCertificate: { type: String },
    panCard: { type: String },
    bankStatement: { type: String },
    foodLicense: { type: String },
    primaryImage: { type: String },
    restaurantImages: [{ type: String }]
  },

  // Login Credentials
  tempPassword: { type: String, required: true },

  // Status
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },

  // Table Reservation Booking
  tableReservationBooking: { type: Boolean, default: false },

  tableReservationBookingConfig: {
    adminOfferPercentageOnBill: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    coverChargePerPerson: {
      type: Number,
      min: 0,
      default: 0
    },
    minBufferTimeBeforeCancel: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  // Admin Commission
  adminCommission: {
    orderCommission: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tableBookingCommission: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    updatedAt: {
      type: Date,
      default: Date
    }
  },

  // Rejection Details
  rejectionReason: { type: String },
  rejectedFormFields: [{ type: String }],

  // Manual Closure
  isManuallyClosed: { type: Boolean, default: false },

  // Aggregated Rating Data
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);