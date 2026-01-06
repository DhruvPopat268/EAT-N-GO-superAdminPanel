const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  // Basic Information
  basicInfo: {
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodCategory: { type: String, enum: ['Veg', 'Non-Veg', 'Mixed'], required: true },
    cuisineTypes: [{ type: String, required: true }],
    otherCuisine: { type: String },
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
    description: { type: String }
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
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  
  // Rejection Details
  rejectionReason: { type: String },
  rejectedFormFields: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);