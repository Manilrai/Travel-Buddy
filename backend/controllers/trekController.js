/**
 * Trek Controller
 * Handles CRUD operations for treks
 */

const { Trek, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get all treks
 * @route   GET /api/treks
 * @access  Public
 */
const getTreks = asyncHandler(async (req, res) => {
    const { difficulty, location } = req.query;
    const where = { status: 'active' };
    if (difficulty) where.difficulty = difficulty;
    if (location) where.location = { [require('sequelize').Op.like]: `%${location}%` };

    const treks = await Trek.findAll({
        where,
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: treks
    });
});

/**
 * @desc    Get single trek
 * @route   GET /api/treks/:id
 * @access  Public
 */
const getTrekById = asyncHandler(async (req, res) => {
    const trek = await Trek.findByPk(req.params.id);

    if (!trek) {
        throw new ApiError('Trek not found', 404);
    }

    res.json({
        success: true,
        data: trek
    });
});

/**
 * @desc    Create a trek
 * @route   POST /api/treks
 * @access  Private
 */
const createTrek = asyncHandler(async (req, res) => {
    const { title, description, location, difficulty, duration, price, maxGroupSize, image } = req.body;

    const trek = await Trek.create({
        userId: req.user.id,
        title,
        description,
        location,
        difficulty,
        duration,
        price,
        maxGroupSize,
        image
    });

    res.status(201).json({
        success: true,
        data: trek
    });
});

/**
 * @desc    Update a trek
 * @route   PUT /api/treks/:id
 * @access  Private
 */
const updateTrek = asyncHandler(async (req, res) => {
    let trek = await Trek.findByPk(req.params.id);

    if (!trek) {
        throw new ApiError('Trek not found', 404);
    }

    if (trek.userId !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized', 403);
    }

    await trek.update(req.body);

    res.json({
        success: true,
        data: trek
    });
});

/**
 * @desc    Delete a trek
 * @route   DELETE /api/treks/:id
 * @access  Private
 */
const deleteTrek = asyncHandler(async (req, res) => {
    const trek = await Trek.findByPk(req.params.id);

    if (!trek) {
        throw new ApiError('Trek not found', 404);
    }

    if (trek.userId !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized', 403);
    }

    await trek.destroy();

    res.json({
        success: true,
        message: 'Trek deleted'
    });
});

module.exports = {
    getTreks,
    getTrekById,
    createTrek,
    updateTrek,
    deleteTrek
};
