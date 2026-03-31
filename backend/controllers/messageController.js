/**
 * Message Controller
 * Handles messaging between users and group chats
 */

const { Message, User, Profile, Trip, TripMember } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Send a message (direct or group)
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { content, receiverId, tripId, replyToId } = req.body;

    if (!receiverId && !tripId) {
        throw new ApiError('Please provide receiverId or tripId', 400);
    }

    const messageData = {
        senderId: req.user.id,
        content,
        messageType: tripId ? 'group' : 'direct',
        replyToId: replyToId || null
    };

    if (receiverId) messageData.receiverId = receiverId;
    if (tripId) messageData.tripId = tripId;

    const message = await Message.create(messageData);

    const fullMessage = await Message.findByPk(message.id, {
        include: [
            {
                model: User,
                as: 'sender',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id', 'email']
            },
            {
                model: Message,
                as: 'replyTo',
                include: [{
                    model: User,
                    as: 'sender',
                    include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                    attributes: ['id']
                }],
                attributes: ['id', 'content', 'messageType']
            }
        ]
    });

    // Emit real-time event via Socket.IO
    const io = req.app.get('io');
    if (io) {
        const payload = fullMessage.toJSON ? fullMessage.toJSON() : fullMessage;
        if (tripId) {
            // Group message — send to all in the trip room
            io.to(`room_${tripId}`).emit('newMessage', payload);
        } else if (receiverId) {
            // Direct message — send to receiver's personal room
            io.to(`user_${receiverId}`).emit('newMessage', payload);
            // Also send back to sender's room so other tabs update
            io.to(`user_${req.user.id}`).emit('newMessage', payload);
        }
    }

    res.status(201).json({
        success: true,
        data: fullMessage
    });
});

/**
 * @desc    Get conversation with a user
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
const getConversation = asyncHandler(async (req, res) => {
    const messages = await Message.findAll({
        where: {
            messageType: 'direct',
            [Op.or]: [
                { senderId: req.user.id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user.id }
            ]
        },
        include: [
            {
                model: User,
                as: 'sender',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
            },
            {
                model: Message,
                as: 'replyTo',
                include: [{
                    model: User,
                    as: 'sender',
                    include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                    attributes: ['id']
                }],
                attributes: ['id', 'content', 'messageType']
            }
        ],
        order: [['createdAt', 'ASC']]
    });

    // Mark messages as read
    const updated = await Message.update(
        { isRead: true },
        {
            where: {
                senderId: req.params.userId,
                receiverId: req.user.id,
                isRead: false
            }
        }
    );

    if (updated[0] > 0) {
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${req.params.userId}`).emit('messagesRead', { readerId: req.user.id });
        }
    }

    // Fetch the other user's info
    const otherUser = await User.findByPk(req.params.userId, {
        attributes: ['id', 'email'],
        include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }]
    });

    res.json({
        success: true,
        data: { messages, otherUser }
    });
});

/**
 * @desc    Get trip group messages
 * @route   GET /api/messages/trip/:tripId
 * @access  Private
 */
const getTripMessages = asyncHandler(async (req, res) => {
    const messages = await Message.findAll({
        where: {
            tripId: req.params.tripId,
            messageType: 'group'
        },
        include: [
            {
                model: User,
                as: 'sender',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id']
            },
            {
                model: Message,
                as: 'replyTo',
                include: [{
                    model: User,
                    as: 'sender',
                    include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }],
                    attributes: ['id']
                }],
                attributes: ['id', 'content', 'messageType']
            }
        ],
        order: [['createdAt', 'ASC']]
    });

    // Fetch trip info
    const trip = await Trip.findByPk(req.params.tripId, {
        attributes: ['id', 'title', 'destination']
    });

    res.json({
        success: true,
        data: { messages, trip }
    });
});

/**
 * @desc    Get inbox (list of conversations)
 * @route   GET /api/messages/inbox
 * @access  Private
 */
const getInbox = asyncHandler(async (req, res) => {
    // Get all direct messages involving the current user
    const messages = await Message.findAll({
        where: {
            messageType: 'direct',
            [Op.or]: [
                { senderId: req.user.id },
                { receiverId: req.user.id }
            ]
        },
        include: [
            {
                model: User,
                as: 'sender',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id', 'email']
            },
            {
                model: User,
                as: 'receiver',
                include: [{ model: Profile, as: 'profile', attributes: ['fullName', 'profilePicture'] }],
                attributes: ['id', 'email']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Group by conversation partner: build { userId, user, lastMessage, unreadCount }
    const conversationsMap = {};
    messages.forEach(msg => {
        const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
        if (!conversationsMap[partnerId]) {
            const partnerUser = msg.senderId === req.user.id ? msg.receiver : msg.sender;
            conversationsMap[partnerId] = {
                userId: partnerId,
                user: partnerUser,
                lastMessage: { content: msg.content, createdAt: msg.createdAt },
                unreadCount: 0
            };
        }
        // Count unread messages sent TO the current user by this partner
        if (msg.senderId === partnerId && msg.receiverId === req.user.id && !msg.isRead) {
            conversationsMap[partnerId].unreadCount += 1;
        }
    });

    res.json({
        success: true,
        data: Object.values(conversationsMap)
    });
});

/**
 * @desc    Get group chats the user belongs to
 * @route   GET /api/messages/groups
 * @access  Private
 */
const getGroups = asyncHandler(async (req, res) => {
    // Find trips where user is a member (trip group chats)
    const tripMembers = await TripMember.findAll({
        where: { userId: req.user.id },
        attributes: ['tripId']
    });

    const tripIds = tripMembers.map(tm => tm.tripId);

    // Also include trips created by the user
    const trips = await Trip.findAll({
        where: {
            [Op.or]: [
                { id: { [Op.in]: tripIds } },
                { creatorId: req.user.id }
            ]
        },
        attributes: ['id', 'title', 'destination'],
        include: [{
            model: User,
            as: 'creator',
            attributes: ['id'],
            include: [{ model: Profile, as: 'profile', attributes: ['fullName'] }]
        }]
    });

    // Get last message and unread count for each trip group
    const groups = await Promise.all(trips.map(async (trip) => {
        const lastMsg = await Message.findOne({
            where: { tripId: trip.id, messageType: 'group' },
            order: [['createdAt', 'DESC']],
            attributes: ['content', 'createdAt']
        });

        const memberCount = await TripMember.count({ where: { tripId: trip.id } });

        return {
            tripId: trip.id,
            title: trip.title,
            destination: trip.destination,
            creator: trip.creator,
            memberCount: memberCount + 1, // +1 for creator
            lastMessage: lastMsg ? { content: lastMsg.content, createdAt: lastMsg.createdAt } : null
        };
    }));

    res.json({
        success: true,
        data: groups
    });
});

/**
 * @desc    Search users to start a conversation
 * @route   GET /api/messages/search-users
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.json({ success: true, data: [] });
    }

    const users = await User.findAll({
        where: {
            id: { [Op.ne]: req.user.id }
        },
        include: [{
            model: Profile,
            as: 'profile',
            where: {
                fullName: { [Op.like]: `%${q}%` }
            },
            attributes: ['fullName', 'profilePicture']
        }],
        attributes: ['id', 'email'],
        limit: 10
    });

    res.json({
        success: true,
        data: users
    });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
        throw new ApiError('Message not found', 404);
    }

    if (message.senderId !== req.user.id) {
        throw new ApiError('Not authorized to delete this message', 403);
    }

    await message.destroy();

    res.json({
        success: true,
        message: 'Message deleted'
    });
});

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread/count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Message.count({
        where: {
            receiverId: req.user.id,
            isRead: false
        }
    });

    res.json({
        success: true,
        data: { count }
    });
});

module.exports = {
    sendMessage,
    getConversation,
    getTripMessages,
    getInbox,
    getGroups,
    searchUsers,
    deleteMessage,
    getUnreadCount
};
