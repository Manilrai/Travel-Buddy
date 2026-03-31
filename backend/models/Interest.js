/**
 * Interest Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interest = sequelize.define('Interest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'interests',
    timestamps: true,
    underscored: true
});

module.exports = Interest;
