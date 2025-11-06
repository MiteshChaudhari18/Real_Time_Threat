const mongoose = require('mongoose');

const lookupHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ip', 'domain', 'hash']
  },
  riskLevel: {
    type: String,
    enum: ['Clean', 'Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sources: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
lookupHistorySchema.index({ query: 1, type: 1 });
lookupHistorySchema.index({ timestamp: -1 });

module.exports = mongoose.models.LookupHistory || mongoose.model('LookupHistory', lookupHistorySchema);

