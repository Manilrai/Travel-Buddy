/**
 * Booking Model
 * Stores bookings for services (bus, hotel, trek)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    serviceId: {
        type: DataTypes.STRING, // Since service IDs from data are strings (e.g. 'bus-1')
        allowNull: false,
        field: 'service_id'
    },
    serviceType: {
        type: DataTypes.ENUM('bus', 'hotel', 'trek'),
        allowNull: false,
        field: 'service_type'
    },
    serviceTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'service_title'
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'cancelled'),
        defaultValue: 'active'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
        field: 'payment_status'
    },
    paymentReceipt: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'payment_receipt'
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    underscored: true
});

module.exports = Booking;
