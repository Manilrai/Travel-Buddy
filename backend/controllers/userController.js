/**
 * User Controller
 * Handles user management operations
 */

const { User, Profile, Interest, UserInterest, Trip, Rating, Report } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get all users (with filters)
 * @route   GET /api/users
 * @access  Private
 */
const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, nationality, gender, travelStyle } = req.query;
    const offset = (page - 1) * limit;

    // Build profile filter
    const profileWhere = {};
    if (nationality) profileWhere.nationality = nationality;
    if (gender) profileWhere.gender = gender;
    if (travelStyle) profileWhere.travelStyle = travelStyle;

    // Build user filter
    const userWhere = {
        id: { [Op.ne]: req.user.id },  // Exclude current user
        isSuspended: false
    };

    const { count, rows: users } = await User.findAndCountAll({
        where: userWhere,
        include: [
            {
                model: Profile,
                as: 'profile',
                where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
                required: true
            },
            {
                model: Interest,
                as: 'interests',
                through: { attributes: [] }
            }
        ],
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
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
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ],
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const {
        fullName, age, gender, nationality, travelStyle,
        preferredDestinations, availabilityStart, availabilityEnd,
        groupSizePreference, bio
    } = req.body;

    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
        // Create profile if doesn't exist
        profile = await Profile.create({
            userId: req.user.id,
            fullName: fullName || 'User'
        });
    }

    // Update profile fields
    await profile.update({
        fullName: fullName || profile.fullName,
        age: age || profile.age,
        gender: gender || profile.gender,
        nationality: nationality || profile.nationality,
        travelStyle: travelStyle || profile.travelStyle,
        preferredDestinations: preferredDestinations || profile.preferredDestinations,
        availabilityStart: availabilityStart || profile.availabilityStart,
        availabilityEnd: availabilityEnd || profile.availabilityEnd,
        groupSizePreference: groupSizePreference || profile.groupSizePreference,
        bio: bio !== undefined ? bio : profile.bio
    });

    // Fetch updated profile
    const updatedProfile = await Profile.findOne({
        where: { userId: req.user.id }
    });

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
    });
});

/**
 * @desc    Upload profile picture
 * @route   POST /api/users/profile/picture
 * @access  Private
 */
const uploadProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError('Please upload an image file', 400);
    }

    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
        throw new ApiError('Profile not found', 404);
    }

    // Update profile picture path
    const picturePath = `/uploads/profiles/${req.file.filename}`;
    await profile.update({ profilePicture: picturePath });

    res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { profilePicture: picturePath }
    });
});

/**
 * @desc    Update user interests
 * @route   PUT /api/users/interests
 * @access  Private
 */
const updateInterests = asyncHandler(async (req, res) => {
    const { interestIds } = req.body;

    if (!Array.isArray(interestIds)) {
        throw new ApiError('Please provide an array of interest IDs', 400);
    }

    // Remove existing interests
    await UserInterest.destroy({ where: { userId: req.user.id } });

    // Add new interests
    const userInterests = interestIds.map(interestId => ({
        userId: req.user.id,
        interestId
    }));

    await UserInterest.bulkCreate(userInterests, { ignoreDuplicates: true });

    // Fetch updated interests
    const user = await User.findByPk(req.user.id, {
        include: [{ model: Interest, as: 'interests', through: { attributes: [] } }]
    });

    res.json({
        success: true,
        message: 'Interests updated successfully',
        data: user.interests
    });
});

/**
 * @desc    Get all available interests
 * @route   GET /api/users/interests/all
 * @access  Public
 */
const getAllInterests = asyncHandler(async (req, res) => {
    const interests = await Interest.findAll({
        order: [['category', 'ASC'], ['name', 'ASC']]
    });

    res.json({
        success: true,
        data: interests
    });
});

/**
 * @desc    Get user's ratings
 * @route   GET /api/users/:id/ratings
 * @access  Private
 */
const getUserRatings = asyncHandler(async (req, res) => {
    const ratings = await Rating.findAll({
        where: { ratedUserId: req.params.id },
        include: [
            {
                model: User,
                as: 'rater',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }]
            },
            { model: Trip, attributes: ['id', 'title', 'destination'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: ratings
    });
});

/**
 * @desc    Block a user
 * @route   POST /api/users/:id/block
 * @access  Private
 */
const blockUser = asyncHandler(async (req, res) => {
    // In a full implementation, you would have a blocked_users table
    // For now, this is a placeholder that would create a report
    const { Report } = require('../models');

    await Report.create({
        reporterId: req.user.id,
        reportedUserId: req.params.id,
        reportType: 'other',
        description: 'User blocked'
    });

    res.json({
        success: true,
        message: 'User blocked successfully'
    });
});

const rateUser = asyncHandler(async (req, res) => {
    const { rating, review, tripId } = req.body;
    
    // Check if user exists
    const ratedUser = await User.findByPk(req.params.id);
    if (!ratedUser) throw new ApiError('User not found', 404);
    if (ratedUser.id === req.user.id) throw new ApiError('Cannot rate yourself', 400);

    const newRating = await Rating.create({
        raterId: req.user.id,
        ratedUserId: req.params.id,
        tripId: tripId || null,
        rating,
        review
    });

    // Update user average rating
    const allRatings = await Rating.findAll({ where: { ratedUserId: req.params.id } });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await Profile.update(
        { averageRating: avgRating.toFixed(1), totalRatings: allRatings.length },
        { where: { userId: req.params.id } }
    );

    res.status(201).json({ success: true, message: 'Rating submitted', data: newRating });
});

const reportUser = asyncHandler(async (req, res) => {
    const { reportType, description } = req.body;
    
    if (req.params.id == req.user.id) throw new ApiError('Cannot report yourself', 400);

    const report = await Report.create({
        reporterId: req.user.id,
        reportedUserId: req.params.id,
        reportType: reportType || 'other',
        description
    });

    res.status(201).json({ success: true, message: 'User reported successfully', data: report });
});

module.exports = {
    getUsers,
    getUser,
    updateProfile,
    uploadProfilePicture,
    updateInterests,
    getAllInterests,
    getUserRatings,
    blockUser,
    rateUser,
    reportUser
};
