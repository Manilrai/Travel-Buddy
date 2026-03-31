/**
 * Report Controller
 * Handles user reporting functionality
 */

const { Report, User, Profile, Message } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Create a report
 * @route   POST /api/reports
 * @access  Private
 */
const createReport = asyncHandler(async (req, res) => {
    const { reportedUserId, reportedMessageId, reportType, description } = req.body;

    if (!reportedUserId && !reportedMessageId) {
        throw new ApiError('Please provide a user or message to report', 400);
    }

    if (reportedUserId && parseInt(reportedUserId) === req.user.id) {
        throw new ApiError('Cannot report yourself', 400);
    }

    const report = await Report.create({
        reporterId: req.user.id,
        reportedUserId: reportedUserId || null,
        reportedMessageId: reportedMessageId || null,
        reportType,
        description
    });

    res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: report
    });
});

/**
 * @desc    Get my reports
 * @route   GET /api/reports/my
 * @access  Private
 */
const getMyReports = asyncHandler(async (req, res) => {
    const reports = await Report.findAll({
        where: { reporterId: req.user.id },
        include: [
            {
                model: User,
                as: 'reportedUser',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                attributes: ['id', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: reports
    });
});

module.exports = {
    createReport,
    getMyReports
};
