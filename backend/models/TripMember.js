/**
 * TripMember Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripMember = sequelize.define('TripMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'trip_id',
        references: {
            model: 'trips',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('creator', 'member'),
        defaultValue: 'member'
    },
    status: {
        type: DataTypes.ENUM('active', 'left', 'removed'),
        defaultValue: 'active'
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'joined_at'
    }
}, {
    tableName: 'trip_members',
    timestamps: true,
    underscored: true
});

module.exports = TripMember;
