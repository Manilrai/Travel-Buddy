/**
 * Trek Routes
 */

const express = require('express');
const router = express.Router();
const {
    getTreks,
    getTrekById,
    createTrek,
    updateTrek,
    deleteTrek
} = require('../controllers/trekController');
const { protect } = require('../middleware/auth');

// Public read routes
router.get('/', getTreks);
router.get('/:id', getTrekById);

// Protected write routes
router.post('/', protect, createTrek);
router.put('/:id', protect, updateTrek);
router.delete('/:id', protect, deleteTrek);

module.exports = router;
