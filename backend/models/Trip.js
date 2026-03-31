/**
 * Trip Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'creator_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date'
    },
    budget: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    budgetType: {
        type: DataTypes.ENUM('budget', 'moderate', 'luxury'),
        defaultValue: 'moderate',
        field: 'budget_type'
    },
    maxGroupSize: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        field: 'max_group_size'
    },
    currentMembers: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'current_members'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('open', 'full', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'open'
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_public'
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cover_image'
    }
}, {
    tableName: 'trips',
    timestamps: true,
    underscored: true
});

module.exports = Trip;
