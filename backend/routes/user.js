import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const FACE_DUPLICATE_THRESHOLD = 0.6;

const toNumberArray = (arr) =>
  Array.isArray(arr) ? arr.map((value) => Number(value)) : [];

const euclideanDistance = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

// @route   GET /api/users/face-profiles
// @desc    Get users with enrolled face profiles for kiosk matching
// @access  Private
router.get('/face-profiles', protect, async (req, res) => {
  try {
    const users = await User.find({
      faceDescriptor: { $exists: true, $ne: null }
    }).select('_id name faceDescriptor enrollmentPhoto');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin or Self
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { name, department, role, faceDescriptor } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (faceDescriptor) updateData.faceDescriptor = faceDescriptor;
    
    // Only admin can change role
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/users/:id/face-descriptor
// @desc    Save face descriptor for user
// @access  Private
router.post('/:id/face-descriptor', protect, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { faceDescriptor, enrollmentPhoto } = req.body;
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, error: 'Invalid face descriptor' });
    }

    const incomingDescriptor = toNumberArray(faceDescriptor);
    if (incomingDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        error: 'Invalid face descriptor'
      });
    }

    const existingUsers = await User.find({
      _id: { $ne: req.params.id },
      faceDescriptor: { $exists: true, $ne: null }
    }).select('faceDescriptor email name');

    const duplicateUser = existingUsers.find((candidate) => {
      const candidateDescriptor = toNumberArray(candidate.faceDescriptor);
      if (candidateDescriptor.length !== incomingDescriptor.length) return false;
      const distance = euclideanDistance(incomingDescriptor, candidateDescriptor);
      return distance < FACE_DUPLICATE_THRESHOLD;
    });

    if (duplicateUser) {
      return res.status(409).json({
        success: false,
        error: 'Face already registered. Please use a different face profile.'
      });
    }

    const updateData = { faceDescriptor };

    if (enrollmentPhoto) {
      if (typeof enrollmentPhoto !== 'string' || !enrollmentPhoto.startsWith('data:image/')) {
        return res.status(400).json({ success: false, error: 'Invalid enrollment photo format' });
      }
      updateData.enrollmentPhoto = enrollmentPhoto;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
