import mongoose from 'mongoose';

const networkWhitelistSchema = new mongoose.Schema({
  ipRange: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  enabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const NetworkWhitelist = mongoose.model('NetworkWhitelist', networkWhitelistSchema);

export default NetworkWhitelist;
