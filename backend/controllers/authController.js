/**
 * Auth Controller
 * Handles user registration, login, and session management
 */

const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'travel_buddy_secret_key_change_in_production', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError('User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({ email, password });

    // Create profile with the full name
    await Profile.create({
        userId: user.id,
        fullName: fullName || 'User'
    });

    const token = generateToken(user.id);

    // Fetch user with profile so fullName is included in response
    const userWithProfile = await User.findByPk(user.id, {
        include: [{ model: Profile, as: 'profile' }],
        attributes: { exclude: ['password'] }
    });

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: userWithProfile,
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new ApiError('Invalid email or password', 401);
    }

    if (user.isSuspended) {
        throw new ApiError('Your account has been suspended. Please contact support.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ApiError('Invalid email or password', 401);
    }

    const token = generateToken(user.id);

    // Fetch user with profile so fullName is included in response
    const userWithProfile = await User.findByPk(user.id, {
        include: [{ model: Profile, as: 'profile' }],
        attributes: { exclude: ['password'] }
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: userWithProfile,
            token
        }
    });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: [
            { model: Profile, as: 'profile' }
        ],
        attributes: { exclude: ['password'] }
    });

    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        throw new ApiError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = {
    register,
    login,
    getMe,
    updatePassword,
    logout
};
