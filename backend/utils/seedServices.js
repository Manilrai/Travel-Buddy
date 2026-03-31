/**
 * Seed services into the database
 * Run once: node utils/seedServices.js
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const Service = require('../models/Service');

const services = [
    // ==================== BUS SERVICES ====================
    {
        type: 'bus',
        title: 'Tourist Bus: Kathmandu → Pokhara',
        image: '/images/Bus/pokhara.webp',
        price: 1200,
        duration: '6-7 hours',
        location: 'Kathmandu',
        rating: 4.5,
        reviewCount: 234,
        description: 'Comfortable tourist bus with scenic highway views, rest stops at Riverside Spring Resort, and professional drivers.',
        overview: 'Travel in comfort from the capital city to the lakeside paradise of Pokhara. Our tourist deluxe buses feature spacious seating, onboard entertainment, and scheduled rest stops with meals at scenic riverside locations along the Prithvi Highway.',
        metadata: {
            route: { from: 'Kathmandu', to: 'Pokhara' },
            busType: 'Tourist Deluxe',
            seatsAvailable: 12,
            departureTime: ['7:00 AM', '7:30 AM', '8:00 AM'],
            amenities: ['Air Conditioning', 'WiFi', 'Charging Ports', 'Refreshments', 'Reclining Seats'],
            cancellation: 'Free cancellation up to 24 hours before departure. 50% refund within 24 hours.',
            pickup: ['Kalanki Bus Park', 'Sorakhutte', 'Balaju'],
            drop: ['Prithvi Chowk Pokhara', 'Lakeside Pokhara', 'Tourist Bus Park']
        }
    },
    {
        type: 'bus',
        title: 'AC Deluxe: Kathmandu → Chitwan',
        image: '/images/Bus/chitwan.jpg',
        price: 1000,
        duration: '5-6 hours',
        location: 'Kathmandu',
        rating: 4.3,
        reviewCount: 189,
        description: 'Direct AC bus service to Chitwan National Park area. Perfect for wildlife safari trips.',
        overview: 'Our AC Deluxe service takes you straight to the gateway of Chitwan National Park. Enjoy the comfortable ride through the scenic Trishuli river valley, with stops at Mugling for refreshments.',
        metadata: {
            route: { from: 'Kathmandu', to: 'Chitwan (Sauraha)' },
            busType: 'AC Deluxe',
            seatsAvailable: 8,
            departureTime: ['7:00 AM', '7:30 AM'],
            amenities: ['Air Conditioning', 'WiFi', 'Charging Ports', 'Water Bottle'],
            cancellation: 'Free cancellation up to 24 hours before departure.',
            pickup: ['Kalanki Bus Park', 'Koteshwor'],
            drop: ['Sauraha Bus Stand', 'Bharatpur']
        }
    },
    {
        type: 'bus',
        title: 'Express Bus: Pokhara → Lumbini',
        image: '/images/Bus/lumbini.jpg',
        price: 1500,
        duration: '8-9 hours',
        location: 'Pokhara',
        rating: 4.1,
        reviewCount: 98,
        description: 'Connect from the adventure capital to the birthplace of Buddha. Long but scenic journey through the Terai plains.',
        overview: 'Journey from the Annapurna region to the sacred birthplace of Lord Buddha. The route passes through diverse landscapes — from green hills to flat Terai plains. Bus stops for breakfast and lunch are included.',
        metadata: {
            route: { from: 'Pokhara', to: 'Lumbini' },
            busType: 'Tourist',
            seatsAvailable: 15,
            departureTime: ['6:30 AM', '7:00 AM'],
            amenities: ['Reclining Seats', 'Water Bottle', 'Charging Ports'],
            cancellation: 'Free cancellation up to 48 hours before departure.',
            pickup: ['Tourist Bus Park Pokhara', 'Prithvi Chowk'],
            drop: ['Lumbini Bus Park', 'Maya Devi Gate']
        }
    },
    {
        type: 'bus',
        title: 'Night Bus: Kathmandu → Janakpur',
        image: '/images/Bus/janakpur.jpg',
        price: 1100,
        duration: '8-9 hours (overnight)',
        location: 'Kathmandu',
        rating: 4.0,
        reviewCount: 65,
        description: 'Overnight deluxe service to the historical city of Janakpur. Save a night\'s hotel cost.',
        overview: 'Take the overnight route and wake up in the historic city of Janakpur, home of the famous Janaki Temple. Semi-sleeper seats ensure a comfortable rest during the journey.',
        metadata: {
            route: { from: 'Kathmandu', to: 'Janakpur' },
            busType: 'Deluxe Sleeper',
            seatsAvailable: 20,
            departureTime: ['7:00 PM', '8:00 PM'],
            amenities: ['Semi-Sleeper Seats', 'Blanket', 'Charging Ports', 'Water'],
            cancellation: 'Free cancellation up to 24 hours. No refund after.',
            pickup: ['Koteshwor', 'Kalanki'],
            drop: ['Janakpur Bus Park']
        }
    },

    // ==================== HOTEL SERVICES ====================
    {
        type: 'hotel',
        title: 'Hotel Barahi',
        image: '/images/hotel/barahi.jpg',
        price: 3500,
        location: 'Lakeside, Pokhara',
        rating: 4.6,
        reviewCount: 412,
        description: 'A premier lakeside hotel in the heart of Pokhara with stunning views of Phewa Lake and the Annapurna range.',
        overview: 'Hotel Barahi is one of Pokhara\'s finest lakeside hotels, offering luxurious comfort with breathtaking views. Located on the banks of Phewa Lake, guests enjoy world-class hospitality, rooftop dining, and easy access to Pokhara\'s best attractions.',
        metadata: {
            city: 'Lakeside, Pokhara',
            starRating: 4,
            checkIn: '2:00 PM',
            checkOut: '12:00 PM',
            amenities: ['Free Breakfast', 'WiFi', 'Hot Shower', 'Mountain View', 'Room Heater', 'Restaurant', 'Laundry', 'Airport Pickup'],
            roomTypes: [
                { name: 'Standard Room', price: 3500, description: 'Comfortable room with garden view' },
                { name: 'Deluxe Room', price: 5500, description: 'Spacious room with lake view balcony' },
                { name: 'Suite', price: 9000, description: 'Premium suite with panoramic mountain & lake view' }
            ]
        }
    },
    {
        type: 'hotel',
        title: 'Kathmandu Guest House',
        image: '/images/hotel/ktmguest.jpg',
        price: 2500,
        location: 'Thamel, Kathmandu',
        rating: 4.3,
        reviewCount: 856,
        description: 'The legendary heritage hotel in the heart of Thamel — a Kathmandu institution since 1968.',
        overview: 'Kathmandu Guest House is a historic landmark in the Thamel district, beloved by generations of travelers. With its tranquil garden courtyard amid the vibrant streets of Thamel, it offers the perfect base for exploring the Kathmandu Valley\'s UNESCO World Heritage Sites.',
        metadata: {
            city: 'Thamel, Kathmandu',
            starRating: 3,
            checkIn: '1:00 PM',
            checkOut: '11:00 AM',
            amenities: ['Free Breakfast', 'WiFi', 'Hot Shower', 'Garden Courtyard', 'Restaurant & Bar', 'Tour Desk', '24hr Reception'],
            roomTypes: [
                { name: 'Standard Room', price: 2500, description: 'Cozy room in the heritage wing' },
                { name: 'Deluxe Room', price: 4000, description: 'Modern room with garden courtyard view' },
                { name: 'Heritage Suite', price: 7500, description: 'Historic suite with traditional Nepali décor' }
            ]
        }
    },
    {
        type: 'hotel',
        title: 'Temple Tree Resort & Spa',
        image: '/images/hotel/templetree.jpg',
        price: 8000,
        location: 'Lakeside, Pokhara',
        rating: 4.8,
        reviewCount: 324,
        description: 'A luxury 5-star resort with pool, spa, and unmatched mountain views in Pokhara.',
        overview: 'Temple Tree Resort & Spa redefines luxury in the heart of Pokhara. With an infinity pool overlooking the Annapurna range, world-class spa treatments, and exquisite Nepali-fusion cuisine, it\'s the ultimate retreat after a Himalayan adventure.',
        metadata: {
            city: 'Lakeside, Pokhara',
            starRating: 5,
            checkIn: '2:00 PM',
            checkOut: '12:00 PM',
            amenities: ['Free Breakfast', 'Swimming Pool', 'Spa & Wellness', 'WiFi', 'Hot Shower', 'Mountain View', 'Fitness Center', 'Bar & Restaurant', 'Airport Shuttle'],
            roomTypes: [
                { name: 'Deluxe Room', price: 8000, description: 'Elegant room with private balcony' },
                { name: 'Pool Suite', price: 12000, description: 'Suite with direct pool access' },
                { name: 'Presidential Suite', price: 18000, description: 'Top-floor suite with 360° views' }
            ]
        }
    },
    {
        type: 'hotel',
        title: 'Himalayan Hillside Resort',
        image: '/images/hotel/hill.jpg',
        price: 3000,
        location: 'Nagarkot',
        rating: 4.4,
        reviewCount: 178,
        description: 'A hilltop escape at 2,175m with panoramic sunrise views over eight Himalayan ranges.',
        overview: 'Perched atop Nagarkot hill, this intimate resort offers some of the most spectacular sunrise views over the Himalayas — from Dhaulagiri to Everest. The warm, rustic rooms and evening bonfires make it the perfect romantic or solo retreat.',
        metadata: {
            city: 'Nagarkot',
            starRating: 3,
            checkIn: '1:00 PM',
            checkOut: '11:00 AM',
            amenities: ['Free Breakfast', 'WiFi', 'Hot Shower', 'Himalayan Panorama', 'Room Heater', 'Bonfire Area', 'Sunrise Terrace'],
            roomTypes: [
                { name: 'Standard Room', price: 3000, description: 'Warm room with valley view' },
                { name: 'Deluxe Mountain View', price: 5000, description: 'Floor-to-ceiling windows facing the Himalayas' }
            ]
        }
    },

    // ==================== TREK SERVICES ====================
    {
        type: 'trek',
        title: 'Everest Base Camp Trek',
        image: '/images/himalayas/everestbasecamp.avif',
        price: 45000,
        duration: '14 Days',
        location: 'Solukhumbu, Khumbu',
        rating: 4.9,
        reviewCount: 512,
        description: 'Trek to the foot of the world\'s highest peak through legendary Sherpa villages and ancient monasteries.',
        overview: 'The Everest Base Camp trek is the ultimate Himalayan adventure. Walk through rhododendron forests, cross suspension bridges over roaring rivers, and experience the warmth of Sherpa hospitality.',
        metadata: {
            region: 'Solukhumbu, Khumbu',
            difficulty: 'Challenging',
            maxAltitude: '5,364m (Everest Base Camp)',
            bestSeason: 'March–May, September–November',
            groupSize: '2–12'
        }
    },
    {
        type: 'trek',
        title: 'Annapurna Circuit Trek',
        image: '/images/himalayas/Annapurna.jpg',
        price: 55000,
        duration: '18 Days',
        location: 'Annapurna Conservation Area',
        rating: 4.8,
        reviewCount: 389,
        description: 'Circle the entire Annapurna massif through diverse landscapes — from subtropical jungle to high-altitude desert.',
        overview: 'The Annapurna Circuit is one of the world\'s classic long-distance treks. Cross the Thorong La pass at 5,416m, visit the sacred Muktinath temple, and experience five climate zones in a single journey.',
        metadata: {
            region: 'Annapurna Conservation Area',
            difficulty: 'Moderate–Challenging',
            maxAltitude: '5,416m (Thorong La Pass)',
            bestSeason: 'March–May, October–November',
            groupSize: '2–14'
        }
    },
    {
        type: 'trek',
        title: 'Langtang Valley Trek',
        image: '/images/himalayas/Langtang-Valley-Trek-1.jpg',
        price: 30000,
        duration: '10 Days',
        location: 'Langtang National Park',
        rating: 4.7,
        reviewCount: 245,
        description: 'A shorter yet stunning trek through the "Valley of Glaciers" with rich Tamang culture and cheese factory visits.',
        overview: 'The Langtang Valley trek is the nearest Himalayan trek from Kathmandu, yet feels a world away. Trek through dense rhododendron and bamboo forests, cross glacial moraines, and summit Kyanjin Ri for panoramic views.',
        metadata: {
            region: 'Langtang National Park',
            difficulty: 'Moderate',
            maxAltitude: '4,984m (Kyanjin Ri)',
            bestSeason: 'March–May, October–December',
            groupSize: '2–10'
        }
    },
    {
        type: 'trek',
        title: 'Upper Mustang Trek',
        image: '/images/himalayas/uppermustang.jpg',
        price: 85000,
        duration: '12 Days',
        location: 'Upper Mustang (Lo Manthang)',
        rating: 4.9,
        reviewCount: 156,
        description: 'Explore the ancient forbidden kingdom of Lo — a high-desert landscape of wind caves, monasteries, and Tibetan culture.',
        overview: 'Upper Mustang is a restricted area that remained closed to outsiders until 1992. The arid, high-desert landscape resembles Tibet, with red and ochre cliffs, ancient cave monasteries, and the walled city of Lo Manthang.',
        metadata: {
            region: 'Upper Mustang (Lo Manthang)',
            difficulty: 'Moderate–Challenging',
            maxAltitude: '3,810m (Lo Manthang)',
            bestSeason: 'June–September, March–November',
            groupSize: '2–8'
        }
    }
];

const seedServices = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        let created = 0;
        let skipped = 0;

        for (const svc of services) {
            // Check if service with same title and type already exists
            const existing = await Service.findOne({
                where: { title: svc.title, type: svc.type }
            });

            if (existing) {
                skipped++;
                continue;
            }

            await Service.create(svc);
            created++;
            console.log(`  ✅ Created: [${svc.type}] ${svc.title}`);
        }

        console.log(`\n✅ Service seeding complete! Created: ${created}, Skipped: ${skipped}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedServices();
