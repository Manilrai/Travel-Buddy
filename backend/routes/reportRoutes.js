/**
 * Report Routes
 * Handles user reporting functionality
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    createReport,
    getMyReports
} = require('../controllers/reportController');

// Report validation
const reportValidation = [
    body('reportType')
        .isIn(['spam', 'harassment', 'inappropriate', 'fake_profile', 'scam', 'other'])
        .withMessage('Invalid report type'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be under 1000 characters')
];

// All routes are protected
router.use(protect);

router.post('/', reportValidation, validate, createReport);
router.get('/my', getMyReports);

module.exports = router;
