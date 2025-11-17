const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  restroName: {
    type: String
  },
  module: {
    type: String,
    required: true
  },
  subModule: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  name: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);