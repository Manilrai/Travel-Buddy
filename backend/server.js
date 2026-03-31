/**
 * Travel Buddy Backend Server
 * Main entry point for the Express application
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./config/database');
const { sequelize } = require('./models');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { seedDatabase } = require('./utils/seedData');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'travel-buddy-secret-key-2024');
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.userId} connected`);

    // Join personal room
    socket.join(`user_${socket.userId}`);

    // Join a chat room (trip group chat)
    socket.on('joinRoom', (roomId) => {
        socket.join(`room_${roomId}`);
        console.log(`User ${socket.userId} joined room_${roomId}`);
    });

    // Leave a chat room
    socket.on('leaveRoom', (roomId) => {
        socket.leave(`room_${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.userId} disconnected`);
    });
});

// Make io accessible in controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', routes);

// Error handler middleware (must be after routes)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Sync database models (creates missing tables without modifying existing ones)
        await sequelize.sync();
        console.log('✅ Database models synchronized');

        // Seed database with initial data
        if (process.env.NODE_ENV === 'development') {
            await seedDatabase();
        }

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`🔌 Socket.IO ready`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
