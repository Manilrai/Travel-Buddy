/**
 * Rating Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    raterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rater_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    ratedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rated_user_id',
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ratings',
    timestamps: true,
    underscored: true
});

module.exports = Rating;
