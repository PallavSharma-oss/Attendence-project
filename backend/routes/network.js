import express from 'express';
import NetworkWhitelist from '../models/NetworkWhitelist.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/network/whitelist
// @desc    Get network whitelist
// @access  Private
router.get('/whitelist', protect, async (req, res) => {
  try {
    const whitelist = await NetworkWhitelist.find({ enabled: true });
    
    res.json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/network/whitelist
// @desc    Add IP to whitelist
// @access  Private/Admin
router.post('/whitelist', protect, admin, async (req, res) => {
  try {
    const { ipRange, description } = req.body;

    if (!ipRange) {
      return res.status(400).json({ success: false, error: 'IP range is required' });
    }

    const whitelist = await NetworkWhitelist.create({
      ipRange,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'IP range already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/network/whitelist/:id
// @desc    Remove IP from whitelist
// @access  Private/Admin
router.delete('/whitelist/:id', protect, admin, async (req, res) => {
  try {
    const whitelist = await NetworkWhitelist.findById(req.params.id);
    
    if (!whitelist) {
      return res.status(404).json({ success: false, error: 'Whitelist entry not found' });
    }

    await whitelist.deleteOne();

    res.json({
      success: true,
      message: 'Whitelist entry removed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
