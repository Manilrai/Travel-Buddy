/**
 * VerificationRequest Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationRequest = sequelize.define('VerificationRequest', {
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
    personalDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'personal_details'
    },
    idDocType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'id_doc_type'
    },
    idDocNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'id_doc_number'
    },
    idFrontUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'id_front_url'
    },
    idBackUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'id_back_url'
    },
    selfieUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'selfie_url'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at'
    }
}, {
    tableName: 'verification_requests',
    timestamps: true,
    underscored: true
});

module.exports = VerificationRequest;
