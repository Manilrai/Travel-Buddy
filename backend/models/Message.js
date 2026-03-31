/**
 * Message Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'receiver_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'trip_id',
        references: {
            model: 'trips',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    },
    messageType: {
        type: DataTypes.ENUM('direct', 'group'),
        defaultValue: 'direct',
        field: 'message_type'
    },
    replyToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reply_to_id',
        references: {
            model: 'messages',
            key: 'id'
        }
    }
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true
});

module.exports = Message;
