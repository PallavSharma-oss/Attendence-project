import express from 'express';
import { body } from 'express-validator';
import Office from '../models/Office.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/offices
// @desc    Get all offices
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const offices = await Office.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: offices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/offices/:id
// @desc    Get office by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({ success: false, error: 'Office not found' });
    }
    res.json({ success: true, data: office });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/offices
// @desc    Create new office
// @access  Private/Admin
router.post('/', protect, admin, [
  body('name').notEmpty().withMessage('Office name is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const { name, city, state, country, address, zipCode, latitude, longitude, radius } = req.body;

    const office = await Office.create({
      name,
      city,
      state,
      country,
      address,
      zipCode: zipCode || '',
      latitude: latitude || null,
      longitude: longitude || null,
      radius: radius || 100
    });

    res.status(201).json({
      success: true,
      data: office
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Office already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/offices/:id
// @desc    Update office
// @access  Private/Admin
router.put('/:id', protect, admin, [
  body('name').optional().notEmpty().withMessage('Office name cannot be empty'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('country').optional().notEmpty().withMessage('Country cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty')
], async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!office) {
      return res.status(404).json({ success: false, error: 'Office not found' });
    }

    res.json({
      success: true,
      data: office
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/offices/:id
// @desc    Delete office (soft delete)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!office) {
      return res.status(404).json({ success: false, error: 'Office not found' });
    }

    res.json({
      success: true,
      message: 'Office deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
