/**
 * Notification Routes
 * Handles user notifications
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification
} = require('../controllers/notificationController');

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
