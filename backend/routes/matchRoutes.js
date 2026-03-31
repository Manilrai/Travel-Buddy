/**
 * Match Routes
 * Handles travel buddy matching functionality
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMatches,
    getMatchWithUser,
    getSuggestions
} = require('../controllers/matchController');

// All routes are protected
router.use(protect);

router.get('/', getMatches);
router.get('/suggestions', getSuggestions);
router.get('/:userId', getMatchWithUser);

module.exports = router;
