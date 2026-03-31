/**
 * UserInterest Model (Junction table)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserInterest = sequelize.define('UserInterest', {
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
    interestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'interest_id',
        references: {
            model: 'interests',
            key: 'id'
        }
    }
}, {
    tableName: 'user_interests',
    timestamps: true,
    underscored: true
});

module.exports = UserInterest;
