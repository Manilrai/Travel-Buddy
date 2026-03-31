/**
 * Admin Routes
 * Handles admin-only operations
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getReports,
    resolveReport,
    getAllTrips,
    getAllBookings,
    updatePaymentStatus
} = require('../controllers/adminController');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Report management
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

// Trip management
router.get('/trips', getAllTrips);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/payment', updatePaymentStatus);

module.exports = router;
