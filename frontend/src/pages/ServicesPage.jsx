/**
 * Services Page
 * Browse Bus, Hotel, Trekking services and Recommended Tours with category tabs
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiTruck, HiOfficeBuilding, HiFlag, HiGlobe, HiMap } from 'react-icons/hi';
import ServiceCard from '../components/ServiceCard';
import BookingModal from '../components/BookingModal';
import useBooking from '../hooks/useBooking';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, serviceAPI } from '../services/api';
import toast from 'react-hot-toast';

const recommendedTours = [
    {
        title: 'Himalayan Adventure Trek',
        location: 'Mount Everest Base Camp',
        days: '14 Days',
        price: 'Rs. 45,000',
        image: '/images/recommend/himalyas.jpg'
    },
    {
        title: 'Kathmandu Cultural Tour',
        location: 'Kathmandu Valley',
        days: '5 Days',
        price: 'Rs. 15,000',
        image: '/images/recommend/culture.jpg'
    },
    {
        title: 'Pokhara Lakeside Retreat',
        location: 'Phewa Lake, Pokhara',
        days: '7 Days',
        price: 'Rs. 25,000',
        image: '/images/recommend/ppokhara.jpg'
    },
    {
        title: 'Chitwan Jungle Safari',
        location: 'Chitwan National Park',
        days: '3 Days',
        price: 'Rs. 18,000',
        image: '/images/recommend/jungle.jpg'
    },
    {
        title: 'Annapurna Base Camp',
        location: 'Annapurna Conservation',
        days: '10 Days',
        price: 'Rs. 35,000',
        image: '/images/himalayas/Annapurna.jpg'
    }
];

const tabs = [
    { key: 'bus', label: 'Bus & Transport', icon: HiTruck },
    { key: 'hotel', label: 'Hotels & Stays', icon: HiOfficeBuilding },
    { key: 'trek', label: 'Trekking Packages', icon: HiFlag },
    { key: 'recommended', label: 'Recommended Tours', icon: HiGlobe },
];

const ServicesPage = () => {
    const [activeTab, setActiveTab] = useState('bus');
    const { handleBookNow, bookingItem, showModal, closeModal, confirmBooking, cancelBooking } = useBooking();
    const { isAuthenticated, isAdmin } = useAuth();
    const [userBookings, setUserBookings] = useState([]);
    const [apiServices, setApiServices] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchBookings();
        }
    }, [isAuthenticated]);

    // Fetch services from backend API when tab changes
    useEffect(() => {
        if (activeTab !== 'recommended') {
            fetchApiServices(activeTab);
        }
    }, [activeTab]);

    const fetchApiServices = async (type) => {
        try {
            const res = await serviceAPI.getAll(type);
            setApiServices(res.data.data || []);
        } catch (err) {
            console.error('Error fetching API services:', err);
            setApiServices([]);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await bookingAPI.getMyBookings();
            setUserBookings(res.data.data.filter(b => b.status === 'active'));
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleConfirmBooking = async () => {
        try {
            await confirmBooking();
            toast.success('Booking confirmed successfully!');
            fetchBookings();
        } catch (error) {
            toast.error(error.message || 'Failed to book service');
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(bookingId);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const currentTab = tabs.find((t) => t.key === activeTab);

    // Map API services to ServiceCard-compatible format (flatten metadata)
    const displayServices = apiServices.map(s => ({
        ...s,
        route: s.metadata?.route || { from: s.metadata?.routeFrom, to: s.metadata?.routeTo },
        city: s.metadata?.city || s.location,
        starRating: s.metadata?.starRating,
        reviewScore: s.rating,
        difficulty: s.metadata?.difficulty,
        region: s.metadata?.region,
        busType: s.metadata?.busType,
        seatsAvailable: s.metadata?.seatsAvailable,
        amenities: s.metadata?.amenities || [],
        departureTime: s.metadata?.departureTime || [],
        roomTypes: s.metadata?.roomTypes || [],
        maxAltitude: s.metadata?.maxAltitude,
        bestSeason: s.metadata?.bestSeason,
        groupSize: s.metadata?.groupSize,
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-dark py-16 lg:py-24">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />

                <div className="container-custom relative z-10 text-center">
                    <p className="inline-block text-sm font-semibold tracking-wider text-primary-200 uppercase mb-4 bg-white/10 px-4 py-1.5 rounded-full">
                        Everything you need
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                        Our Services
                    </h1>
                    <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
                        Book buses, find the best hotels, choose from curated trekking
                        packages, and explore our recommended tours — all in one place.
                    </p>
                </div>
            </section>

            {/* Tabs + Content */}
            <section className="py-12 lg:py-16">
                <div className="container-custom">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all
                                        ${isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    {activeTab === 'recommended' ? (
                        /* Recommended Tours Grid */
                        <div className="grid md:grid-cols-3 gap-8">
                            {recommendedTours.map((tour, index) => (
                                <div key={index} className="card hover:shadow-lg transition-shadow group p-0 overflow-hidden">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-sm">
                                            {tour.price}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{tour.title}</h3>
                                        <div className="flex items-center justify-between text-gray-600 mb-4">
                                            <span className="flex items-center">
                                                <HiMap className="w-4 h-4 mr-1 text-primary-500" />
                                                <span className="text-sm">{tour.location}</span>
                                            </span>
                                            <span className="text-sm font-medium">{tour.days}</span>
                                        </div>
                                        <Link to="/trips" className="btn-secondary w-full flex items-center justify-center">
                                            Explore Trips
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayServices.length > 0 ? (
                        /* Service Cards Grid */
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayServices.map((service) => {
                                const userBooking = userBookings.find(b => b.serviceId === service.id && b.serviceType === activeTab);
                                return (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        type={activeTab}
                                        onBookNow={handleBookNow}
                                        userBooking={userBooking}
                                        onCancelBooking={() => handleCancelBooking(userBooking.id)}
                                        isAdmin={isAdmin}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">No services available in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Booking Modal */}
            {showModal && (
                <BookingModal
                    item={bookingItem}
                    onClose={closeModal}
                    onConfirm={handleConfirmBooking}
                />
            )}
        </div>
    );
};

export default ServicesPage;
