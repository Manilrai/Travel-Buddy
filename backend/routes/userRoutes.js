/**
 * User Routes
 * Handles user profile and interest management
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
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
} = require('../controllers/userController');

// Profile validation
const profileValidation = [
    body('fullName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('age')
        .optional()
        .isInt({ min: 18, max: 120 })
        .withMessage('Age must be between 18 and 120'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
        .withMessage('Invalid gender value'),
    body('travelStyle')
        .optional()
        .isIn(['budget', 'moderate', 'luxury', 'adventure', 'backpacker'])
        .withMessage('Invalid travel style'),
    body('groupSizePreference')
        .optional()
        .isInt({ min: 2, max: 20 })
        .withMessage('Group size must be between 2 and 20')
];

// Routes
router.get('/interests/all', getAllInterests);  // Public route for interests list

// Protected routes
router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUser);
router.get('/:id/ratings', getUserRatings);
router.put('/profile', profileValidation, validate, updateProfile);
router.post('/profile/picture', upload.single('profilePicture'), uploadProfilePicture);
router.put('/interests', updateInterests);
router.post('/:id/block', blockUser);
router.post('/:id/rate', rateUser);
router.post('/:id/report', reportUser);

module.exports = router;
