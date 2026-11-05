const express = require('express');
const router = express.Router();
const Position = require('../models/Position');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/positions
// @desc    Get all positions (optionally filter by committeeLevel)
router.get('/', async (req, res) => {
  try {
    const { level } = req.query;
    const query = { isActive: true };
    if (level) {
      query.committeeLevel = level;
    }

    const positions = await Position.find(query).sort({ order: 1, committeeLevel: 1 });
    
    // Also provide grouped representation
    const grouped = positions.reduce((acc, pos) => {
      acc[pos.committeeLevel] = acc[pos.committeeLevel] || [];
      acc[pos.committeeLevel].push(pos);
      return acc;
    }, {});

    res.json({
      success: true,
      count: positions.length,
      positions,
      grouped,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/positions
// @desc    Add a new position (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, committeeLevel, committeeName, maxSeats, order, description } = req.body;
    if (!title || !committeeLevel || !committeeName) {
      return res.status(400).json({ success: false, message: 'Title, committee level, and committee name are required' });
    }

    const position = await Position.create({
      title,
      committeeLevel,
      committeeName,
      maxSeats: maxSeats || '1',
      order: Number(order) || 0,
      description: description || '',
    });

    res.status(201).json({ success: true, message: 'Position created successfully', position });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/positions/:id
// @desc    Update position (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const position = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!position) return res.status(404).json({ success: false, message: 'Position not found' });
    res.json({ success: true, message: 'Position updated successfully', position });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/positions/:id
// @desc    Delete position (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    if (!position) return res.status(404).json({ success: false, message: 'Position not found' });
    res.json({ success: true, message: 'Position deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/positions/reset-defaults
// @desc    List default positions from database (Admin)
router.post('/reset-defaults', protect, authorize('admin'), async (req, res) => {
  try {
    const positions = await Position.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, message: 'Current committee positions retrieved successfully', positions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
