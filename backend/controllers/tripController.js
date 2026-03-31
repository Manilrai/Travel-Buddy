/**
 * Trip Controller
 * Handles trip creation, management, and membership
 */

const { Trip, TripMember, User, Profile, Notification } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Create a new trip
 * @route   POST /api/trips
 * @access  Private
 */
const createTrip = asyncHandler(async (req, res) => {
    const {
        title, destination, startDate, endDate,
        budget, budgetType, maxGroupSize, description, isPublic
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
        throw new ApiError('End date must be after start date', 400);
    }

    // Create trip
    const coverImage = req.file ? `/uploads/trips/${req.file.filename}` : undefined;

    const trip = await Trip.create({
        creatorId: req.user.id,
        title,
        destination,
        startDate,
        endDate,
        budget: budget || null,
        budgetType: budgetType || 'moderate',
        maxGroupSize: maxGroupSize || 5,
        description,
        isPublic: isPublic !== undefined ? isPublic : true,
        currentMembers: 1,
        ...(coverImage && { coverImage })
    });

    // Add creator as trip member
    await TripMember.create({
        tripId: trip.id,
        userId: req.user.id,
        role: 'creator',
        status: 'active'
    });

    res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        data: trip
    });
});

/**
 * @desc    Get all trips (with filters)
 * @route   GET /api/trips
 * @access  Private
 */
const getTrips = asyncHandler(async (req, res) => {
    const {
        page = 1, limit = 10, destination,
        status = 'open', budgetType, startDate, endDate
    } = req.query;
    const offset = (page - 1) * limit;

    // Build filter
    const where = { isPublic: true };
    if (destination) where.destination = { [Op.like]: `%${destination}%` };
    if (status) where.status = status;
    if (budgetType) where.budgetType = budgetType;
    if (startDate) where.startDate = { [Op.gte]: startDate };
    if (endDate) where.endDate = { [Op.lte]: endDate };

    const { count, rows: trips } = await Trip.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'creator',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id', 'email']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['startDate', 'ASC']]
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
 * @desc    Get single trip by ID
 * @route   GET /api/trips/:id
 * @access  Private
 */
const getTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findByPk(req.params.id, {
        include: [
            {
                model: User,
                as: 'creator',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture', 'nationality'] }],
                attributes: ['id', 'email', 'isVerified']
            },
            {
                model: TripMember,
                as: 'tripMembers',
                where: { status: 'active' },
                required: false,
                include: [{
                    model: User,
                    as: 'user',
                    include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                    attributes: ['id']
                }]
            }
        ]
    });

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    // Check if current user is a member
    const isMember = await TripMember.findOne({
        where: { tripId: trip.id, userId: req.user.id, status: 'active' }
    });

    res.json({
        success: true,
        data: {
            ...trip.toJSON(),
            isCreator: trip.creatorId === req.user.id,
            isMember: !!isMember
        }
    });
});

/**
 * @desc    Update trip
 * @route   PUT /api/trips/:id
 * @access  Private (Creator only)
 */
const updateTrip = asyncHandler(async (req, res) => {
    let trip = await Trip.findByPk(req.params.id);

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    // Verify ownership
    if (trip.creatorId !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to update this trip', 403);
    }

    const {
        title, destination, startDate, endDate,
        budget, budgetType, maxGroupSize, description, status, isPublic
    } = req.body;

    await trip.update({
        title: title || trip.title,
        destination: destination || trip.destination,
        startDate: startDate || trip.startDate,
        endDate: endDate || trip.endDate,
        budget: budget !== undefined ? budget : trip.budget,
        budgetType: budgetType || trip.budgetType,
        maxGroupSize: maxGroupSize || trip.maxGroupSize,
        description: description !== undefined ? description : trip.description,
        status: status || trip.status,
        isPublic: isPublic !== undefined ? isPublic : trip.isPublic
    });

    res.json({
        success: true,
        message: 'Trip updated successfully',
        data: trip
    });
});

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private (Creator only)
 */
const deleteTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    if (trip.creatorId !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to delete this trip', 403);
    }

    // Delete associated trip members
    await TripMember.destroy({ where: { tripId: trip.id } });

    await trip.destroy();

    res.json({
        success: true,
        message: 'Trip deleted successfully'
    });
});

/**
 * @desc    Join a trip
 * @route   POST /api/trips/:id/join
 * @access  Private
 */
const joinTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    // Check if trip is open
    if (trip.status !== 'open') {
        throw new ApiError('This trip is not accepting new members', 400);
    }

    // Admins cannot join trips
    if (req.user.role === 'admin') {
        throw new ApiError('Admins cannot join trips', 403);
    }

    // Check if trip is full
    if (trip.currentMembers >= trip.maxGroupSize) {
        throw new ApiError('This trip is full', 400);
    }

    // Check if already a member
    const existingMember = await TripMember.findOne({
        where: { tripId: trip.id, userId: req.user.id }
    });

    if (existingMember) {
        if (existingMember.status === 'active') {
            throw new ApiError('You are already a member of this trip', 400);
        } else {
            // Rejoin the trip
            await existingMember.update({ status: 'active', joinedAt: new Date() });
        }
    } else {
        // Create new membership
        await TripMember.create({
            tripId: trip.id,
            userId: req.user.id,
            role: 'member',
            status: 'active'
        });
    }

    // Update member count
    trip.currentMembers += 1;
    if (trip.currentMembers >= trip.maxGroupSize) {
        trip.status = 'full';
    }
    await trip.save();

    // Create notification for trip creator
    await Notification.create({
        userId: trip.creatorId,
        type: 'trip_request',
        title: 'New Trip Member',
        message: `A new member has joined your trip: ${trip.title}`,
        link: `/trips/${trip.id}`
    });

    res.json({
        success: true,
        message: 'Successfully joined the trip'
    });
});

/**
 * @desc    Leave a trip
 * @route   POST /api/trips/:id/leave
 * @access  Private
 */
const leaveTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    // Can't leave if you're the creator
    if (trip.creatorId === req.user.id) {
        throw new ApiError('Trip creator cannot leave. Please delete the trip instead.', 400);
    }

    const membership = await TripMember.findOne({
        where: { tripId: trip.id, userId: req.user.id, status: 'active' }
    });

    if (!membership) {
        throw new ApiError('You are not a member of this trip', 400);
    }

    await membership.update({ status: 'left' });

    // Update member count
    trip.currentMembers = Math.max(1, trip.currentMembers - 1);
    if (trip.status === 'full') {
        trip.status = 'open';
    }
    await trip.save();

    res.json({
        success: true,
        message: 'Successfully left the trip'
    });
});

/**
 * @desc    Get my trips (created + joined)
 * @route   GET /api/trips/my
 * @access  Private
 */
const getMyTrips = asyncHandler(async (req, res) => {
    // Get trips I created
    const createdTrips = await Trip.findAll({
        where: { creatorId: req.user.id },
        include: [{
            model: User,
            as: 'creator',
            include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
            attributes: ['id']
        }],
        order: [['startDate', 'ASC']]
    });

    // Get trips I joined (but didn't create)
    const memberships = await TripMember.findAll({
        where: { userId: req.user.id, status: 'active' },
        include: [{
            model: Trip,
            where: { creatorId: { [Op.ne]: req.user.id } },
            include: [{
                model: User,
                as: 'creator',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                attributes: ['id']
            }]
        }]
    });

    const joinedTrips = memberships.map(m => m.Trip);

    res.json({
        success: true,
        data: {
            created: createdTrips,
            joined: joinedTrips
        }
    });
});

/**
 * @desc    Remove member from trip
 * @route   DELETE /api/trips/:id/members/:userId
 * @access  Private (Creator only)
 */
const removeMember = asyncHandler(async (req, res) => {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    if (trip.creatorId !== req.user.id) {
        throw new ApiError('Only the trip creator can remove members', 403);
    }

    if (parseInt(req.params.userId) === trip.creatorId) {
        throw new ApiError('Cannot remove the trip creator', 400);
    }

    const membership = await TripMember.findOne({
        where: { tripId: trip.id, userId: req.params.userId, status: 'active' }
    });

    if (!membership) {
        throw new ApiError('User is not a member of this trip', 400);
    }

    await membership.update({ status: 'removed' });

    // Update member count
    trip.currentMembers = Math.max(1, trip.currentMembers - 1);
    if (trip.status === 'full') {
        trip.status = 'open';
    }
    await trip.save();

    res.json({
        success: true,
        message: 'Member removed successfully'
    });
});

module.exports = {
    createTrip,
    getTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    joinTrip,
    leaveTrip,
    getMyTrips,
    removeMember
};
