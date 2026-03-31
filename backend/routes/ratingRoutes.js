/**
 * Rating Routes
 * Handles user ratings after trips
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    rateUser,
    getUserRatings,
    getMyRatings
} = require('../controllers/ratingController');

// Rating validation
const ratingValidation = [
    body('ratedUserId')
        .isInt()
        .withMessage('Rated user ID is required'),
    body('tripId')
        .isInt()
        .withMessage('Trip ID is required'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('review')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Review must be under 500 characters')
];

// All routes are protected
router.use(protect);

router.post('/', ratingValidation, validate, rateUser);
router.get('/my', getMyRatings);
router.get('/user/:userId', getUserRatings);

module.exports = router;
