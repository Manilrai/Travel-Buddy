/**
 * Admin Controller
 * Handles admin-only operations like user management and statistics
 */

const { User, Profile, Trip, Message, Report, Rating, Notification, Booking, sequelize } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        suspendedUsers,
        totalTrips,
        activeTrips,
        totalMessages,
        pendingReports
    ] = await Promise.all([
        User.count(),
        User.count({ where: { isSuspended: false } }),
        User.count({ where: { isVerified: true } }),
        User.count({ where: { isSuspended: true } }),
        Trip.count(),
        Trip.count({ where: { status: { [Op.in]: ['open', 'in_progress'] } } }),
        Message.count(),
        Report.count({ where: { status: 'pending' } })
    ]);

    // Get registrations over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.count({
        where: {
            createdAt: { [Op.gte]: thirtyDaysAgo }
        }
    });

    res.json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                active: activeUsers,
                verified: verifiedUsers,
                suspended: suspendedUsers,
                recentRegistrations
            },
            trips: {
                total: totalTrips,
                active: activeTrips
            },
            messages: {
                total: totalMessages
            },
            reports: {
                pending: pendingReports
            }
        }
    });
});

/**
 * @desc    Get all users (admin view)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status === 'suspended') where.isSuspended = true;
    if (status === 'active') where.isSuspended = false;
    if (status === 'verified') where.isVerified = true;
    if (role) where.role = role;

    // Search by email
    if (search) {
        where.email = { [Op.like]: `%${search}%` };
    }

    const { count, rows: users } = await User.findAndCountAll({
        where,
        include: [
            { model: Profile, as: 'profile', attributes: ['fullName', 'nationality', 'profilePicture'] }
        ],
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Update user status (verify/suspend)
 * @route   PUT /api/admin/users/:id/status
 * @access  Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
    const { isVerified, isSuspended, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // Prevent modifying other admins
    if (user.role === 'admin' && req.user.id !== user.id) {
        throw new ApiError('Cannot modify other admin accounts', 403);
    }

    await user.update({
        isVerified: isVerified !== undefined ? isVerified : user.isVerified,
        isSuspended: isSuspended !== undefined ? isSuspended : user.isSuspended,
        role: role || user.role
    });

    // Send notification if verified
    if (isVerified === true) {
        await Notification.create({
            userId: user.id,
            type: 'system',
            title: 'Account Verified',
            message: 'Congratulations! Your account has been verified.',
            link: '/profile'
        });
    }

    // Send notification if suspended
    if (isSuspended === true) {
        await Notification.create({
            userId: user.id,
            type: 'system',
            title: 'Account Suspended',
            message: 'Your account has been suspended. Please contact support for more information.',
            link: '/support'
        });
    }

    res.json({
        success: true,
        message: 'User status updated',
        data: user.toSafeObject()
    });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    if (user.role === 'admin') {
        throw new ApiError('Cannot delete admin accounts', 403);
    }

    // Delete associated data (cascade should handle most)
    await Profile.destroy({ where: { userId: user.id } });
    await user.destroy();

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

/**
 * @desc    Get all reports
 * @route   GET /api/admin/reports
 * @access  Admin
 */
const getReports = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status !== 'all') where.status = status;

    const { count, rows: reports } = await Report.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'reporter',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                attributes: ['id', 'email']
            },
            {
                model: User,
                as: 'reportedUser',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                attributes: ['id', 'email']
            },
            {
                model: Message,
                as: 'reportedMessage',
                attributes: ['id', 'content']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            reports,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Resolve a report
 * @route   PUT /api/admin/reports/:id
 * @access  Admin
 */
const resolveReport = asyncHandler(async (req, res) => {
    const { status, adminNotes, actionTaken } = req.body;
    const report = await Report.findByPk(req.params.id);

    if (!report) {
        throw new ApiError('Report not found', 404);
    }

    await report.update({
        status: status || 'resolved',
        adminNotes,
        resolvedBy: req.user.id,
        resolvedAt: new Date()
    });

    // Take action if specified
    if (actionTaken === 'suspend' && report.reportedUserId) {
        await User.update(
            { isSuspended: true },
            { where: { id: report.reportedUserId } }
        );
    }

    res.json({
        success: true,
        message: 'Report resolved',
        data: report
    });
});

/**
 * @desc    Get all trips (admin view)
 * @route   GET /api/admin/trips
 * @access  Admin
 */
const getAllTrips = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: trips } = await Trip.findAndCountAll({
        where,
        include: [{
            model: User,
            as: 'creator',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
            attributes: ['id', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            trips,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Get all bookings (admin view)
 * @route   GET /api/admin/bookings
 * @access  Admin
 */
const getAllBookings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, paymentStatus, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (status) where.status = status;

    const { count, rows: bookings } = await Booking.findAndCountAll({
        where,
        include: [{
            model: User,
            as: 'user',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
            attributes: ['id', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            bookings,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * @desc    Update booking payment status
 * @route   PUT /api/admin/bookings/:id/payment
 * @access  Admin
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { paymentStatus } = req.body; // 'completed' or 'failed'
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        throw new ApiError('Booking not found', 404);
    }

    if (!['completed', 'failed'].includes(paymentStatus)) {
        throw new ApiError('Invalid payment status update', 400);
    }

    booking.paymentStatus = paymentStatus;
    
    // Auto-confirm booking if payment is completed
    if (paymentStatus === 'completed') {
        booking.status = 'active'; // In our schema 'active' acts as confirmed/ongoing
    }

    await booking.save();

    // Send notification to user
    await Notification.create({
        userId: booking.userId,
        type: 'booking',
        title: paymentStatus === 'completed' ? 'Payment Approved' : 'Payment Rejected',
        message: paymentStatus === 'completed' 
            ? `Your payment for ${booking.serviceTitle} was approved and your booking is confirmed.` 
            : `Your payment for ${booking.serviceTitle} could not be verified. Please try again or contact support.`,
        link: '/my-activity'
    });

    res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: booking
    });
});

module.exports = {
    getStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getReports,
    resolveReport,
    getAllTrips,
    getAllBookings,
    updatePaymentStatus
};
