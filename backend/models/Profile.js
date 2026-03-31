/**
 * Profile Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'User',
        field: 'full_name'
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: true
    },
    travelStyle: {
        type: DataTypes.ENUM('budget', 'moderate', 'luxury', 'adventure', 'backpacker'),
        allowNull: true,
        field: 'travel_style'
    },
    preferredDestinations: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_destinations'
    },
    availabilityStart: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'availability_start'
    },
    availabilityEnd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'availability_end'
    },
    groupSizePreference: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'group_size_preference'
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_picture'
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        field: 'average_rating'
    },
    totalRatings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_ratings'
    }
}, {
    tableName: 'profiles',
    timestamps: true,
    underscored: true
});

module.exports = Profile;
