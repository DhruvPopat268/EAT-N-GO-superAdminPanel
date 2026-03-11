const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }, // optional (reverse geocoding result)
  },
  { _id: false }
);

const travelSchema = new mongoose.Schema(
  {
    from: locationSchema,
    to: locationSchema,
    travelledAt: { type: Date, default: Date.now },
    distanceKm: { type: Number },
    durationMin: { type: Number },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
  
      trim: true,
    },

    email: {
      type: String,
    
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
   
      minlength: 6,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    // 🔥 Live tracking fields for Eat N Go
    currentLocation: locationSchema,
    destinationLocation: locationSchema,

    // ⭐ Store user's previous travel routes
    travelHistory: [travelSchema],

    // ⭐ Recent searches (for quick re-selection)
    recentSearches: [
      {
        from: locationSchema,
        to: locationSchema,
        searchedAt: { type: Date, default: Date.now },
      },
    ],

    // ⭐ User favorite restaurants
    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);