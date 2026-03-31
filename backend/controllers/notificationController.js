/**
 * Notification Controller
 * Handles user notifications
 */

const { Notification } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.json({
        success: true,
        data: {
            notifications,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification || notification.userId !== req.user.id) {
        throw new ApiError('Notification not found', 404);
    }

    await notification.update({ isRead: true });

    res.json({
        success: true,
        message: 'Notification marked as read'
    });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.update(
        { isRead: true },
        { where: { userId: req.user.id, isRead: false } }
    );

    res.json({
        success: true,
        message: 'All notifications marked as read'
    });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread/count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.count({
        where: { userId: req.user.id, isRead: false }
    });

    res.json({
        success: true,
        data: { count }
    });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification || notification.userId !== req.user.id) {
        throw new ApiError('Notification not found', 404);
    }

    await notification.destroy();

    res.json({
        success: true,
        message: 'Notification deleted'
    });
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification
};
