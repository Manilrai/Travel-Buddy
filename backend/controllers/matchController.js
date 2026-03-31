/**
 * Match Controller
 * Handles travel buddy matching functionality
 */

const { User, Profile, Interest, UserInterest, Trip, TripMember } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get travel buddy matches for current user
 * @route   GET /api/matches
 * @access  Private
 */
const getMatches = asyncHandler(async (req, res) => {
    const currentUser = await User.findByPk(req.user.id, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ]
    });

    // Get all other active users with profiles
    const users = await User.findAll({
        where: {
            id: { [Op.ne]: req.user.id },
            isSuspended: false,
            role: 'user'
        },
        include: [
            { model: Profile, as: 'profile', required: true },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ],
        attributes: { exclude: ['password'] }
    });

    const { minScore, destination, travelStyle } = req.query;

    const currentUserInterestIds = currentUser.interests.map(i => i.id);

    let matches = users.map(user => {
        const userInterestIds = user.interests.map(i => i.id);
        const sharedInterests = currentUserInterestIds.filter(id => userInterestIds.includes(id));
        const matchScore = currentUserInterestIds.length > 0
            ? Math.round((sharedInterests.length / currentUserInterestIds.length) * 100)
            : 0;

        return {
            user: user.toJSON(),
            matchScore,
            sharedInterests: sharedInterests.length
        };
    });

    // Apply filters from query params
    if (minScore) {
        const scoreLimit = parseInt(minScore, 10);
        matches = matches.filter(m => m.matchScore >= scoreLimit);
    }

    if (destination) {
        matches = matches.filter(m => {
            const dest = m.user.profile?.destination || '';
            return dest.toLowerCase().includes(destination.toLowerCase());
        });
    }

    if (travelStyle) {
        matches = matches.filter(m => {
            const style = m.user.profile?.travelStyle || '';
            return style.toLowerCase() === travelStyle.toLowerCase();
        });
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
        success: true,
        data: matches
    });
});

/**
 * @desc    Get match compatibility with a specific user
 * @route   GET /api/matches/:userId
 * @access  Private
 */
const getMatchWithUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.userId, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ],
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    const currentUser = await User.findByPk(req.user.id, {
        include: [{ model: Interest, as: 'interests', through: { attributes: [] } }]
    });

    const currentUserInterestIds = currentUser.interests.map(i => i.id);
    const userInterestIds = user.interests.map(i => i.id);
    const sharedInterests = currentUserInterestIds.filter(id => userInterestIds.includes(id));

    const matchScore = currentUserInterestIds.length > 0
        ? Math.round((sharedInterests.length / currentUserInterestIds.length) * 100)
        : 0;

    res.json({
        success: true,
        data: {
            user,
            matchScore,
            sharedInterests: sharedInterests.length
        }
    });
});

/**
 * @desc    Get trip buddy suggestions
 * @route   GET /api/matches/suggestions
 * @access  Private
 */
const getSuggestions = asyncHandler(async (req, res) => {
    const currentUser = await User.findByPk(req.user.id, {
        include: [
            { model: Profile, as: 'profile' },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ]
    });

    const users = await User.findAll({
        where: {
            id: { [Op.ne]: req.user.id },
            isSuspended: false,
            role: 'user'
        },
        include: [
            { model: Profile, as: 'profile', required: true },
            { model: Interest, as: 'interests', through: { attributes: [] } }
        ],
        attributes: { exclude: ['password'] },
        limit: 10
    });

    const currentUserInterestIds = currentUser.interests.map(i => i.id);

    const suggestions = users
        .map(user => {
            const userInterestIds = user.interests.map(i => i.id);
            const sharedInterests = currentUserInterestIds.filter(id => userInterestIds.includes(id));
            const matchScore = currentUserInterestIds.length > 0
                ? Math.round((sharedInterests.length / currentUserInterestIds.length) * 100)
                : 0;
            return { user: user.toJSON(), matchScore, sharedInterests: sharedInterests.length };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

    res.json({
        success: true,
        data: suggestions
    });
});

module.exports = {
    getMatches,
    getMatchWithUser,
    getSuggestions
};
