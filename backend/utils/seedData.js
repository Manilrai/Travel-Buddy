/**
 * Seed Data
 * Populates the database with initial data for testing
 */

const bcrypt = require('bcryptjs');
const {
    User, Profile, Interest, UserInterest,
    Trip, TripMember, Notification
} = require('../models');

// Predefined travel interests
const interestsData = [
    { name: 'Beach & Relaxation', category: 'nature', icon: '🏖️' },
    { name: 'Mountain Hiking', category: 'adventure', icon: '🏔️' },
    { name: 'Cultural Tours', category: 'culture', icon: '🏛️' },
    { name: 'Food & Cuisine', category: 'food', icon: '🍜' },
    { name: 'Photography', category: 'hobby', icon: '📷' },
    { name: 'Nightlife', category: 'entertainment', icon: '🎉' },
    { name: 'Historical Sites', category: 'culture', icon: '🏰' },
    { name: 'Wildlife & Safari', category: 'nature', icon: '🦁' },
    { name: 'Water Sports', category: 'adventure', icon: '🏄' },
    { name: 'Backpacking', category: 'adventure', icon: '🎒' },
    { name: 'Luxury Travel', category: 'style', icon: '✨' },
    { name: 'Road Trips', category: 'adventure', icon: '🚗' },
    { name: 'Camping', category: 'nature', icon: '⛺' },
    { name: 'City Exploration', category: 'culture', icon: '🌆' },
    { name: 'Spiritual & Wellness', category: 'wellness', icon: '🧘' },
    { name: 'Art & Museums', category: 'culture', icon: '🎨' },
    { name: 'Music Festivals', category: 'entertainment', icon: '🎵' },
    { name: 'Scuba Diving', category: 'adventure', icon: '🤿' },
    { name: 'Winter Sports', category: 'adventure', icon: '⛷️' },
    { name: 'Volunteer Travel', category: 'social', icon: '🤝' }
];

// Sample users data
const usersData = [
    {
        email: 'admin@travelbuddy.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        profile: {
            fullName: 'Admin User',
            age: 30,
            gender: 'prefer_not_to_say',
            nationality: 'United States',
            travelStyle: 'moderate',
            bio: 'Platform administrator',
            preferredDestinations: ['New York', 'Los Angeles']
        }
    },
    {
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        profile: {
            fullName: 'Ram Shrestha',
            age: 28,
            gender: 'male',
            nationality: 'Nepal',
            travelStyle: 'adventure',
            bio: 'Adventure seeker looking for hiking buddies! Love exploring new trails and experiencing different cultures.',
            preferredDestinations: ['Nepal', 'Switzerland', 'New Zealand'],
            availabilityStart: '2024-03-01',
            availabilityEnd: '2024-06-30',
            groupSizePreference: 4
        },
        interests: ['Mountain Hiking', 'Photography', 'Camping', 'Backpacking']
    },
    {
        email: 'sarah@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        profile: {
            fullName: 'Sita Karki',
            age: 25,
            gender: 'female',
            nationality: 'Nepal',
            travelStyle: 'budget',
            bio: 'Budget traveler and food enthusiast. Always looking for authentic local experiences!',
            preferredDestinations: ['Thailand', 'Vietnam', 'Japan'],
            availabilityStart: '2024-02-15',
            availabilityEnd: '2024-05-15',
            groupSizePreference: 3
        },
        interests: ['Food & Cuisine', 'Cultural Tours', 'Photography', 'City Exploration']
    },
    {
        email: 'mike@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        profile: {
            fullName: 'Hari Thapa',
            age: 32,
            gender: 'male',
            nationality: 'Nepal',
            travelStyle: 'luxury',
            bio: 'Tech entrepreneur who loves luxury travel and unique experiences around the world.',
            preferredDestinations: ['Maldives', 'Dubai', 'Switzerland'],
            availabilityStart: '2024-04-01',
            availabilityEnd: '2024-04-30',
            groupSizePreference: 2
        },
        interests: ['Luxury Travel', 'Beach & Relaxation', 'Food & Cuisine', 'Nightlife']
    },
    {
        email: 'emma@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        profile: {
            fullName: 'Gita Gurung',
            age: 27,
            gender: 'female',
            nationality: 'Nepal',
            travelStyle: 'backpacker',
            bio: 'Solo female traveler documenting my journeys. Looking for travel buddies for Southeast Asia!',
            preferredDestinations: ['Indonesia', 'Thailand', 'Vietnam', 'Cambodia'],
            availabilityStart: '2024-01-01',
            availabilityEnd: '2024-12-31',
            groupSizePreference: 6
        },
        interests: ['Backpacking', 'Beach & Relaxation', 'Scuba Diving', 'Photography', 'Cultural Tours']
    }
];

// Sample trips data
const tripsData = [
    {
        creatorEmail: 'john@example.com',
        title: 'Himalayan Adventure Trek',
        destination: 'Nepal',
        startDate: '2024-04-15',
        endDate: '2024-04-30',
        budget: 2500.00,
        budgetType: 'moderate',
        maxGroupSize: 6,
        description: 'Join me for an unforgettable trek through the Himalayas! We will explore ancient monasteries, stunning mountain views, and experience local Nepali culture.',
        status: 'open',
        coverImage: '/images/himalayas/hero.jpg'
    },
    {
        creatorEmail: 'sarah@example.com',
        title: 'Kathmandu Food Tour',
        destination: 'Kathmandu, Nepal',
        startDate: '2024-03-01',
        endDate: '2024-03-15',
        budget: 1500.00,
        budgetType: 'budget',
        maxGroupSize: 4,
        description: 'A culinary adventure through Kathmandu! Street food, cooking classes, and local market tours.',
        status: 'open',
        coverImage: '/images/himalayas/trek.jpg'
    },
    {
        creatorEmail: 'emma@example.com',
        title: 'Map of Pokhara Valley Tour',
        destination: 'Pokhara, Nepal',
        startDate: '2024-05-01',
        endDate: '2024-05-20',
        budget: 2000.00,
        budgetType: 'moderate',
        maxGroupSize: 5,
        description: 'Explore the beautiful valley of Pokhara. Lakes, mountains, and epic sunsets!',
        status: 'open',
        coverImage: '/images/himalayas/scenery.jpg'
    }
];

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Seed Interests
        console.log('  → Seeding interests...');
        for (const interest of interestsData) {
            await Interest.findOrCreate({
                where: { name: interest.name },
                defaults: interest
            });
        }
        console.log('  ✓ Interests seeded');

        // Seed Users with Profiles
        console.log('  → Seeding users and profiles...');
        for (const userData of usersData) {
            // Check if user already exists
            let user = await User.findOne({ where: { email: userData.email } });

            if (!user) {
                // Create user (password will be hashed by hook)
                user = await User.create({
                    email: userData.email,
                    password: userData.password,
                    role: userData.role,
                    isVerified: userData.isVerified
                });

                // Create profile
                await Profile.create({
                    userId: user.id,
                    ...userData.profile,
                    preferredDestinations: userData.profile.preferredDestinations
                });

                // Add interests if provided
                if (userData.interests) {
                    for (const interestName of userData.interests) {
                        const interest = await Interest.findOne({ where: { name: interestName } });
                        if (interest) {
                            await UserInterest.findOrCreate({
                                where: { userId: user.id, interestId: interest.id }
                            });
                        }
                    }
                }
            }
        }
        console.log('  ✓ Users and profiles seeded');

        // Seed Trips
        console.log('  → Seeding trips...');
        for (const tripData of tripsData) {
            const creator = await User.findOne({ where: { email: tripData.creatorEmail } });
            if (creator) {
                const [trip, created] = await Trip.findOrCreate({
                    where: {
                        title: tripData.title,
                        creatorId: creator.id
                    },
                    defaults: {
                        creatorId: creator.id,
                        title: tripData.title,
                        destination: tripData.destination,
                        startDate: tripData.startDate,
                        endDate: tripData.endDate,
                        budget: tripData.budget,
                        budgetType: tripData.budgetType,
                        maxGroupSize: tripData.maxGroupSize,
                        description: tripData.description,
                        status: tripData.status,
                        coverImage: tripData.coverImage
                    }
                });

                // Add creator as trip member
                if (created) {
                    await TripMember.findOrCreate({
                        where: { tripId: trip.id, userId: creator.id },
                        defaults: { role: 'creator', status: 'active' }
                    });
                }
            }
        }
        console.log('  ✓ Trips seeded');

        console.log('✅ Database seeding completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

module.exports = { seedDatabase, interestsData };
