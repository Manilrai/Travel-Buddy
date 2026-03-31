const express = require('express');
const router = express.Router();
const {
    submitContact,
    getContacts,
    updateContactStatus,
    deleteContact
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route for submitting contact form
router.post('/', submitContact);

// Protected Admin routes
router.use(protect);
router.use(adminOnly);

router.get('/', getContacts);
router.put('/:id/status', updateContactStatus);
router.delete('/:id', deleteContact);

module.exports = router;
