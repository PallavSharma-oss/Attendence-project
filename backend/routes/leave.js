import express from 'express';
import Leave from '../models/Leave.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/leave
// @desc    Submit a leave request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const leave = await Leave.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/leave/my-requests
// @desc    Get leave requests for current user
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user._id })
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/leave/all
// @desc    Get all leave requests (admin)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('userId', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/leave/:id/approve
// @desc    Approve a leave request
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const { comments } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    leave.status = 'approved';
    leave.reviewedAt = new Date();
    leave.reviewedBy = req.user._id;
    leave.reviewerName = req.user.name;
    leave.comments = comments || '';

    await leave.save();

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/leave/:id/decline
// @desc    Decline a leave request
// @access  Private/Admin
router.put('/:id/decline', protect, admin, async (req, res) => {
  try {
    const { comments } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    leave.status = 'declined';
    leave.reviewedAt = new Date();
    leave.reviewedBy = req.user._id;
    leave.reviewerName = req.user.name;
    leave.comments = comments || '';

    await leave.save();

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/leave/:id
// @desc    Delete a leave request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    // Only owner can delete their own leave request
    if (leave.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: 'Leave request deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
