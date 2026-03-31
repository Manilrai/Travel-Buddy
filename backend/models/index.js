/**
 * Models Index
 * Sets up all model associations and exports them
 */

const { sequelize } = require('../config/database');
const User = require('./User');
const Profile = require('./Profile');
const Interest = require('./Interest');
const UserInterest = require('./UserInterest');
const Trip = require('./Trip');
const TripMember = require('./TripMember');
const Message = require('./Message');
const Report = require('./Report');
const Rating = require('./Rating');
const Notification = require('./Notification');
const VerificationRequest = require('./VerificationRequest');
const Trek = require('./Trek');
const Booking = require('./Booking');
const Service = require('./Service');
const Contact = require('./Contact');

// ==========================================
// Define Model Associations
// ==========================================

// User - Profile (One to One)
User.hasOne(Profile, {
    foreignKey: 'userId',
    as: 'profile',
    onDelete: 'CASCADE'
});
Profile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User - Interest (Many to Many through UserInterest)
User.belongsToMany(Interest, {
    through: UserInterest,
    foreignKey: 'userId',
    as: 'interests'
});
Interest.belongsToMany(User, {
    through: UserInterest,
    foreignKey: 'interestId',
    as: 'users'
});

// User & Bookings
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Trip (One to Many - creator)
User.hasMany(Trip, {
    foreignKey: 'creatorId',
    as: 'createdTrips'
});
Trip.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator'
});

// User - Trip (Many to Many through TripMember)
User.belongsToMany(Trip, {
    through: TripMember,
    foreignKey: 'userId',
    as: 'joinedTrips'
});
Trip.belongsToMany(User, {
    through: TripMember,
    foreignKey: 'tripId',
    as: 'members'
});

// Trip - TripMember (for direct access)
Trip.hasMany(TripMember, {
    foreignKey: 'tripId',
    as: 'tripMembers'
});
TripMember.belongsTo(Trip, {
    foreignKey: 'tripId'
});
TripMember.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User - Message (Sender)
User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'sentMessages'
});
Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender'
});

// User - Message (Receiver)
User.hasMany(Message, {
    foreignKey: 'receiverId',
    as: 'receivedMessages'
});
Message.belongsTo(User, {
    foreignKey: 'receiverId',
    as: 'receiver'
});

// Trip - Message (Group Messages)
Trip.hasMany(Message, {
    foreignKey: 'tripId',
    as: 'tripMessages'
});
Message.belongsTo(Trip, {
    foreignKey: 'tripId',
    as: 'trip'
});

// Message - Message (Reply)
Message.belongsTo(Message, {
    foreignKey: 'replyToId',
    as: 'replyTo',
    onDelete: 'SET NULL'
});
Message.hasMany(Message, {
    foreignKey: 'replyToId',
    as: 'replies'
});

// User - Report (Reporter)
User.hasMany(Report, {
    foreignKey: 'reporterId',
    as: 'reportsMade'
});
Report.belongsTo(User, {
    foreignKey: 'reporterId',
    as: 'reporter'
});

// User - Report (Reported User)
User.hasMany(Report, {
    foreignKey: 'reportedUserId',
    as: 'reportsReceived'
});
Report.belongsTo(User, {
    foreignKey: 'reportedUserId',
    as: 'reportedUser'
});

// Message - Report
Message.hasMany(Report, {
    foreignKey: 'reportedMessageId',
    as: 'reports'
});
Report.belongsTo(Message, {
    foreignKey: 'reportedMessageId',
    as: 'reportedMessage'
});

// User - Rating (Rater)
User.hasMany(Rating, {
    foreignKey: 'raterId',
    as: 'ratingsGiven'
});
Rating.belongsTo(User, {
    foreignKey: 'raterId',
    as: 'rater'
});

// User - Rating (Rated User)
User.hasMany(Rating, {
    foreignKey: 'ratedUserId',
    as: 'ratingsReceived'
});
Rating.belongsTo(User, {
    foreignKey: 'ratedUserId',
    as: 'ratedUser'
});

// Trip - Rating
Trip.hasMany(Rating, {
    foreignKey: 'tripId',
    as: 'ratings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Rating.belongsTo(Trip, {
    foreignKey: 'tripId'
});

// User - Notification
User.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications'
});
Notification.belongsTo(User, {
    foreignKey: 'userId'
});

// User - VerificationRequest
User.hasMany(VerificationRequest, {
    foreignKey: 'userId',
    as: 'verificationRequests'
});
VerificationRequest.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Admin Reviewer - VerificationRequest
User.hasMany(VerificationRequest, {
    foreignKey: 'reviewedBy',
    as: 'reviewedVerifications'
});
VerificationRequest.belongsTo(User, {
    foreignKey: 'reviewedBy',
    as: 'reviewer'
});

// User - Trek (Poster)
User.hasMany(Trek, {
    foreignKey: 'userId',
    as: 'treks'
});
Trek.belongsTo(User, {
    foreignKey: 'userId',
    as: 'poster'
});

// ==========================================
// Export everything
// ==========================================
module.exports = {
    sequelize,
    User,
    Profile,
    Interest,
    UserInterest,
    Trip,
    TripMember,
    Message,
    Report,
    Rating,
    Notification,
    VerificationRequest,
    Trek,
    Booking,
    Service,
    Contact
};
