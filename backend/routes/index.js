/**
 * Routes Index
 * Central router that combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const tripRoutes = require('./tripRoutes');
const matchRoutes = require('./matchRoutes');
const messageRoutes = require('./messageRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const ratingRoutes = require('./ratingRoutes');
const verificationRoutes = require('./verificationRoutes');
const trekRoutes = require('./trekRoutes');
const bookingRoutes = require('./bookingRoutes');
const serviceRoutes = require('./serviceRoutes');
const contactRoutes = require('./contactRoutes');

// API health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Travel Buddy API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/matches', matchRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ratings', ratingRoutes);
router.use('/verification', verificationRoutes);
router.use('/treks', trekRoutes);
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/contacts', contactRoutes);

module.exports = router;
