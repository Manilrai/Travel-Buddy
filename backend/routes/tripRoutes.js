/**
 * Trip Routes
 * Handles trip creation, management, and membership
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
    createTrip,
    getTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    joinTrip,
    leaveTrip,
    getMyTrips,
    removeMember
} = require('../controllers/tripController');

// Trip validation
const tripValidation = [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('destination')
        .notEmpty()
        .withMessage('Destination is required'),
    body('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('maxGroupSize')
        .optional()
        .isInt({ min: 2, max: 50 })
        .withMessage('Group size must be between 2 and 50'),
    body('budgetType')
        .optional()
        .isIn(['budget', 'moderate', 'luxury'])
        .withMessage('Invalid budget type')
];

// All routes are protected
router.use(protect);

// Routes
router.route('/')
    .get(getTrips)
    .post(upload.single('coverImage'), tripValidation, validate, createTrip);

router.get('/my', getMyTrips);

router.route('/:id')
    .get(getTrip)
    .put(updateTrip)
    .delete(deleteTrip);

router.post('/:id/join', joinTrip);
router.post('/:id/leave', leaveTrip);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
