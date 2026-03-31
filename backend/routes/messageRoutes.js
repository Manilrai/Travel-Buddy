/**
 * Message Routes
 * Handles messaging between users and group chats
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    sendMessage,
    getConversation,
    getTripMessages,
    getInbox,
    getGroups,
    searchUsers,
    deleteMessage,
    getUnreadCount
} = require('../controllers/messageController');

// Message validation
const messageValidation = [
    body('content')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message must be between 1 and 5000 characters')
];

// All routes are protected
router.use(protect);

router.get('/inbox', getInbox);
router.get('/groups', getGroups);
router.get('/search-users', searchUsers);
router.get('/unread/count', getUnreadCount);
router.get('/conversation/:userId', getConversation);
router.get('/trip/:tripId', getTripMessages);

router.post('/', messageValidation, validate, sendMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
