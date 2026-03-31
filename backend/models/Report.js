/**
 * Report Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'reporter_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reported_user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reportedMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reported_message_id',
        references: {
            model: 'messages',
            key: 'id'
        }
    },
    reportType: {
        type: DataTypes.ENUM('spam', 'harassment', 'inappropriate', 'fake_profile', 'scam', 'other'),
        allowNull: false,
        field: 'report_type'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
        defaultValue: 'pending'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    },
    resolvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'resolved_by'
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'resolved_at'
    }
}, {
    tableName: 'reports',
    timestamps: true,
    underscored: true
});

module.exports = Report;
