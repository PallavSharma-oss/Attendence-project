import mongoose from 'mongoose';

const officeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Office name is required'],
    unique: true
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  zipCode: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  radius: {
    type: Number,
    default: 100,
    description: 'Geofencing radius in meters'
  },
  isActive: {
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

export default mongoose.model('Office', officeSchema);
