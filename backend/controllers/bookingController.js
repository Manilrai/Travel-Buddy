/**
 * Booking Controller
 * Manages service bookings (bus, hotel, trek) and generates notifications
 */

const { Booking, Notification } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = asyncHandler(async (req, res) => {
    const { serviceId, serviceType, serviceTitle, price } = req.body;

    if (!serviceId || !serviceType || !serviceTitle || price === undefined) {
        throw new ApiError('Please provide all booking details', 400);
    }

    // Admins cannot book services
    if (req.user.role === 'admin') {
        throw new ApiError('Admins cannot book services', 403);
    }

    // Check if user already booked this service active
    const existing = await Booking.findOne({
        where: { userId: req.user.id, serviceId, status: 'active' }
    });

    if (existing) {
        throw new ApiError('You have already booked this service. Check your bookings.', 400);
    }

    const booking = await Booking.create({
        userId: req.user.id,
        serviceId,
        serviceType,
        serviceTitle,
        price
    });

    // Generate Notification for successful booking
    await Notification.create({
        userId: req.user.id,
        type: 'booking',
        title: 'Booking Confirmed',
        message: `Your booking for ${serviceTitle} has been confirmed.`,
        link: `/services/${serviceType}/${serviceId}`
    });

    res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
    });
});

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/me
 * @access  Private
 */
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: bookings
    });
});

/**
 * @desc    Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        throw new ApiError('Booking not found', 404);
    }

    if (booking.userId !== req.user.id) {
        throw new ApiError('Not authorized to cancel this booking', 403);
    }

    if (booking.status === 'cancelled') {
        throw new ApiError('Booking is already cancelled', 400);
    }

    booking.status = 'cancelled';
    await booking.save();

    // Generate Notification for cancellation
    await Notification.create({
        userId: req.user.id,
        type: 'booking',
        title: 'Booking Cancelled',
        message: `Your booking for ${booking.serviceTitle} has been cancelled.`,
        link: `/services/${booking.serviceType}/${booking.serviceId}`
    });

    res.json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully'
    });
});

/**
 * @desc    Upload payment receipt for a booking
 * @route   POST /api/bookings/:id/pay
 * @access  Private
 */
const uploadPayment = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError('Please upload a payment receipt screenshot', 400);
    }

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        throw new ApiError('Booking not found', 404);
    }

    if (booking.userId !== req.user.id) {
        throw new ApiError('Not authorized to modify this booking', 403);
    }

    if (booking.paymentStatus === 'completed') {
        throw new ApiError('Payment is already completed', 400);
    }

    // Save receipt path
    const receiptPath = `/uploads/receipts/${req.file.filename}`;
    
    booking.paymentReceipt = receiptPath;
    booking.paymentStatus = 'processing';
    await booking.save();

    res.json({
        success: true,
        data: booking,
        message: 'Payment receipt uploaded successfully'
    });
});

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    uploadPayment
};
