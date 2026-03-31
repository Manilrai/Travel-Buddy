/**
 * Rating Controller
 * Handles user ratings after trips
 */

const { Rating, User, Profile, Trip } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Rate a user
 * @route   POST /api/ratings
 * @access  Private
 */
const rateUser = asyncHandler(async (req, res) => {
    const { ratedUserId, tripId, rating, review } = req.body;

    if (ratedUserId === req.user.id) {
        throw new ApiError('Cannot rate yourself', 400);
    }

    const ratedUser = await User.findByPk(ratedUserId);
    if (!ratedUser) {
        throw new ApiError('User not found', 404);
    }

    // Check for existing rating
    const existing = await Rating.findOne({
        where: { raterId: req.user.id, ratedUserId, tripId }
    });

    if (existing) {
        throw new ApiError('You have already rated this user for this trip', 400);
    }

    const newRating = await Rating.create({
        raterId: req.user.id,
        ratedUserId,
        tripId,
        rating,
        review
    });

    // Update user average rating
    const allRatings = await Rating.findAll({ where: { ratedUserId } });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await Profile.update(
        { averageRating: avgRating.toFixed(1), totalRatings: allRatings.length },
        { where: { userId: ratedUserId } }
    );

    res.status(201).json({
        success: true,
        message: 'Rating submitted',
        data: newRating
    });
});

/**
 * @desc    Get ratings for a user
 * @route   GET /api/ratings/user/:userId
 * @access  Private
 */
const getUserRatings = asyncHandler(async (req, res) => {
    const ratings = await Rating.findAll({
        where: { ratedUserId: req.params.userId },
        include: [
            {
                model: User,
                as: 'rater',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
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
 * @desc    Get my ratings
 * @route   GET /api/ratings/my
 * @access  Private
 */
const getMyRatings = asyncHandler(async (req, res) => {
    const ratings = await Rating.findAll({
        where: { ratedUserId: req.user.id },
        include: [
            {
                model: User,
                as: 'rater',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
            },
            { model: Trip, attributes: ['id', 'title'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: ratings
    });
});

module.exports = {
    rateUser,
    getUserRatings,
    getMyRatings
};
