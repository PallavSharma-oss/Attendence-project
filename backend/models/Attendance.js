import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent'],
    default: 'Present'
  },
  location: {
    type: String,
    default: 'Office'
  },
  verifiedBy: {
    type: String,
    enum: ['face-recognition', 'manual', 'auto-network', 'qr-scan'],
    default: 'manual'
  },
  matchScore: {
    type: Number,
    default: null
  },
  networkVerified: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    default: null
  },
  checkInMethod: {
    type: String,
    default: 'manual'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ department: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
