/**
 * Auth Middleware
 * JWT authentication and role-based authorization
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'travel_buddy_secret_key_change_in_production');
        req.user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token invalid'
        });
    }
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

module.exports = { protect, adminOnly };
