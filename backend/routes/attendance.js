import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper to calculate status
const calculateStatus = (checkInTime) => {
  const checkIn = new Date(checkInTime);
  const hours = checkIn.getHours();
  const minutes = checkIn.getMinutes();
  
  // Late if after 9:30 AM
  if (hours > 9 || (hours === 9 && minutes > 30)) {
    return 'Late';
  }
  return 'Present';
};

// @route   POST /api/attendance/checkin
// @desc    Check in
// @access  Private
router.post('/checkin', protect, async (req, res) => {
  try {
    const today = getTodayDate();
    const { verification, networkData, userId } = req.body;
    let targetUser = req.user;

    if (userId && userId !== req.user._id.toString()) {
      const isAdmin = req.user.role === 'admin';
      const hasFaceVerification = Boolean(verification);

      // Backward-compatible: allow either admin kiosk session or explicit face verification.
      if (!isAdmin && !hasFaceVerification) {
        return res.status(400).json({ success: false, error: 'Face verification required for kiosk check-in' });
      }
      const matchedUser = await User.findById(userId).select('-password');
      if (!matchedUser) {
        return res.status(404).json({ success: false, error: 'Matched user not found' });
      }
      targetUser = matchedUser;
    }

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: targetUser._id,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in today',
        data: {
          userName: targetUser.name
        }
      });
    }

    const checkInTime = new Date();
    const status = calculateStatus(checkInTime);

    // Create attendance record
    const attendanceData = {
      userId: targetUser._id,
      userName: targetUser.name,
      department: targetUser.department,
      date: today,
      checkIn: checkInTime,
      status,
      location: 'Office'
    };

    if (verification) {
      attendanceData.verifiedBy = 'face-recognition';
      attendanceData.matchScore = verification.matchScore;
      if (userId && userId !== req.user._id.toString()) {
        attendanceData.checkInMethod = 'kiosk-face';
      }
    }

    if (networkData) {
      attendanceData.networkVerified = networkData.networkVerified;
      attendanceData.ipAddress = networkData.ipAddress;
      attendanceData.checkInMethod = 'auto-network';
    }

    const attendance = await Attendance.create(attendanceData);

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/attendance/qr-checkin
// @desc    Check in via QR scan
// @access  Private
router.post('/qr-checkin', protect, async (req, res) => {
  try {
    const today = getTodayDate();
    const { qrData } = req.body;

    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid QR data' });
    }

    const [employeeIdRaw, emailRaw] = qrData.split('|');
    const employeeId = employeeIdRaw?.trim();
    const email = emailRaw?.trim()?.toLowerCase();

    if (!employeeId || !email) {
      return res.status(400).json({ success: false, error: 'QR data missing fields' });
    }

    const targetUser = await User.findOne({
      $or: [{ employeeId }, { email }]
    }).select('-password');

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found for QR data' });
    }

    const existingAttendance = await Attendance.findOne({
      userId: targetUser._id,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in today',
        data: {
          userName: targetUser.name
        }
      });
    }

    const checkInTime = new Date();
    const status = calculateStatus(checkInTime);

    const attendanceData = {
      userId: targetUser._id,
      userName: targetUser.name,
      department: targetUser.department,
      date: today,
      checkIn: checkInTime,
      status,
      location: 'Office',
      verifiedBy: 'qr-scan',
      checkInMethod: 'qr-scan'
    };

    const attendance = await Attendance.create(attendanceData);

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/attendance/checkout
// @desc    Check out
// @access  Private
router.put('/checkout', protect, async (req, res) => {
  try {
    const today = getTodayDate();

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ success: false, error: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, error: 'Already checked out' });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance for current user
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const today = getTodayDate();
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/attendance/history
// @desc    Get attendance history for current user
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { month } = req.query;
    let query = { userId: req.user._id };

    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all attendance records (admin)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const { userId, date, department, startDate, endDate } = req.query;
    let query = {};

    if (userId) query.userId = userId;
    if (date) query.date = date;
    if (department) query.department = department;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email department')
      .sort({ date: -1, checkIn: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const today = getTodayDate();
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Today's stats
    const todayAttendance = await Attendance.countDocuments({ date: today });
    const todayLate = await Attendance.countDocuments({ date: today, status: 'Late' });

    // This month's stats
    const monthAttendance = await Attendance.countDocuments({
      date: { $regex: `^${currentMonth}` }
    });

    // Department-wise breakdown
    const departmentStats = await Attendance.aggregate([
      { $match: { date: today } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        today: {
          total: todayAttendance,
          late: todayLate,
          onTime: todayAttendance - todayLate
        },
        thisMonth: monthAttendance,
        departments: departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
