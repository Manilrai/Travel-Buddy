/**
 * Service Controller
 * Admin-managed services (bus, hotel, trek)
 */

const { Service } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
const getAllServices = asyncHandler(async (req, res) => {
    const { type, search } = req.query;
    const where = {};
    if (type) where.type = type;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const services = await Service.findAll({
        where,
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: services
    });
});

/**
 * @desc    Get single service
 * @route   GET /api/services/:id
 * @access  Public
 */
const getService = asyncHandler(async (req, res) => {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        throw new ApiError('Service not found', 404);
    }

    res.json({
        success: true,
        data: service
    });
});

/**
 * Build metadata from type-specific fields in req.body
 */
const buildMetadata = (body) => {
    const { type } = body;
    const metadata = {};

    if (type === 'bus') {
        if (body.route) metadata.route = body.route;
        if (body.routeFrom || body.routeTo) {
            metadata.routeFrom = body.routeFrom || '';
            metadata.routeTo = body.routeTo || '';
        }
        if (body.busType) metadata.busType = body.busType;
        if (body.seatsAvailable !== undefined) metadata.seatsAvailable = body.seatsAvailable;
    } else if (type === 'hotel') {
        if (body.city) metadata.city = body.city;
        if (body.starRating) metadata.starRating = body.starRating;
        if (body.checkIn) metadata.checkIn = body.checkIn;
        if (body.checkOut) metadata.checkOut = body.checkOut;
    } else if (type === 'trek') {
        if (body.region) metadata.region = body.region;
        if (body.difficulty) metadata.difficulty = body.difficulty;
        if (body.maxAltitude) metadata.maxAltitude = body.maxAltitude;
        if (body.bestSeason) metadata.bestSeason = body.bestSeason;
        if (body.groupSize) metadata.groupSize = body.groupSize;
    }

    return Object.keys(metadata).length > 0 ? metadata : null;
};

/**
 * @desc    Create a service
 * @route   POST /api/services
 * @access  Admin
 */
const createService = asyncHandler(async (req, res) => {
    const { type, title, description, overview, price, location, image, duration } = req.body;

    const service = await Service.create({
        type,
        title,
        description,
        overview,
        price,
        location,
        image,
        duration,
        metadata: buildMetadata(req.body)
    });

    res.status(201).json({
        success: true,
        data: service
    });
});

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Admin
 */
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        throw new ApiError('Service not found', 404);
    }

    const { type, title, description, overview, price, location, image, duration } = req.body;

    await service.update({
        type: type || service.type,
        title: title || service.title,
        description: description !== undefined ? description : service.description,
        overview: overview !== undefined ? overview : service.overview,
        price: price !== undefined ? price : service.price,
        location: location !== undefined ? location : service.location,
        image: image !== undefined ? image : service.image,
        duration: duration !== undefined ? duration : service.duration,
        metadata: buildMetadata(req.body) || service.metadata
    });

    res.json({
        success: true,
        data: service
    });
});

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Admin
 */
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        throw new ApiError('Service not found', 404);
    }

    await service.destroy();

    res.json({
        success: true,
        message: 'Service deleted'
    });
});

module.exports = {
    getAllServices,
    getService,
    createService,
    updateService,
    deleteService
};
