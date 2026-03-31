/**
 * Trek Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trek = sequelize.define('Trek', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'moderate', 'hard', 'expert'),
        defaultValue: 'moderate'
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    maxGroupSize: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        field: 'max_group_size'
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'treks',
    timestamps: true,
    underscored: true
});

module.exports = Trek;
