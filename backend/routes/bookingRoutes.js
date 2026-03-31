const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
    createBooking,
    getMyBookings,
    cancelBooking,
    uploadPayment
} = require('../controllers/bookingController');

// All booking routes require authentication
router.use(protect);

router.route('/')
    .post(createBooking);

router.route('/me')
    .get(getMyBookings);

router.route('/:id/cancel')
    .put(cancelBooking);

router.route('/:id/pay')
    .post(upload.single('receipt'), uploadPayment);

module.exports = router;
