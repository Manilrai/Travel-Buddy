const express = require('express');
const router = express.Router();
const { getAllServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/services
// @desc    Get all services (supports ?type=bus|hotel|trek)
// @access  Public
router.get('/', getAllServices);

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', getService);

// @route   POST /api/services
// @desc    Create a new service
// @access  Admin only
router.post('/', protect, adminOnly, createService);

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Admin only
router.put('/:id', protect, adminOnly, updateService);

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Admin only
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
