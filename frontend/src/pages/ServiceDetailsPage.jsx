/**
 * Service Details Page
 * Shows full details for a bus, hotel, or trek service
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiArrowLeft, HiStar, HiClock, HiLocationMarker, HiCurrencyDollar,
    HiCheckCircle, HiXCircle, HiUsers, HiCalendar, HiShieldCheck,
    HiArrowRight, HiFlag,
} from 'react-icons/hi';
import { getServiceById } from '../data/servicesData';
import BookingModal from '../components/BookingModal';
import useBooking from '../hooks/useBooking';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, serviceAPI } from '../services/api';
import toast from 'react-hot-toast';

const TABS = {
    bus: ['Overview', 'Amenities', 'Policies', 'Reviews'],
    hotel: ['Overview', "What's Included", 'Room Types', 'Policies', 'Reviews'],
    trek: ['Overview', 'Itinerary', "What's Included", 'Packing List', 'Reviews'],
};

const ServiceDetailsPage = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const { handleBookNow, bookingItem, showModal, closeModal, confirmBooking, cancelBooking } = useBooking();
    const { isAuthenticated, isAdmin } = useAuth();
    const [userBooking, setUserBooking] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const loadService = async () => {
            setLoading(true);
            // Try static data first
            const found = getServiceById(type, id);
            if (found) {
                setService(found);
                setLoading(false);
                return;
            }
            // Fallback to API (for admin-created services)
            try {
                const res = await serviceAPI.getById(id);
                const svc = res.data.data;
                if (svc) {
                    // Flatten metadata for UI compatibility
                    setService({
                        ...svc,
                        route: svc.metadata?.route || { from: svc.metadata?.routeFrom, to: svc.metadata?.routeTo },
                        city: svc.metadata?.city || svc.location,
                        starRating: svc.metadata?.starRating,
                        reviewScore: svc.rating,
                        difficulty: svc.metadata?.difficulty,
                        region: svc.metadata?.region,
                        maxAltitude: svc.metadata?.maxAltitude,
                        bestSeason: svc.metadata?.bestSeason,
                        groupSize: svc.metadata?.groupSize,
                        busType: svc.metadata?.busType,
                        seatsAvailable: svc.metadata?.seatsAvailable,
                        amenities: svc.metadata?.amenities || [],
                        itinerary: svc.metadata?.itinerary || [],
                        inclusions: svc.metadata?.inclusions || [],
                        exclusions: svc.metadata?.exclusions || [],
                        packingList: svc.metadata?.packingList || [],
                        budgetBreakdown: svc.metadata?.budgetBreakdown || {},
                        roomTypes: svc.metadata?.roomTypes || [],
                        nearbyHighlights: svc.metadata?.nearbyHighlights || [],
                        policies: svc.metadata?.policies || [],
                        checkIn: svc.metadata?.checkIn,
                        checkOut: svc.metadata?.checkOut,
                        departureTime: svc.metadata?.departureTime || [],
                        pickup: svc.metadata?.pickup || [],
                        drop: svc.metadata?.drop || [],
                        cancellation: svc.metadata?.cancellation || '',
                    });
                }
            } catch (err) {
                console.error('Service not found:', err);
            } finally {
                setLoading(false);
            }
        };
        loadService();
    }, [type, id]);

    useEffect(() => {
        setActiveTab('Overview');
    }, [type, id]);

    // Check if user has already booked this service
    useEffect(() => {
        if (isAuthenticated && service) {
            checkBookingStatus();
        }
    }, [isAuthenticated, service]);

    const checkBookingStatus = async () => {
        try {
            const response = await bookingAPI.getMyBookings();
            const bookings = response.data.data;
            const activeBooking = bookings.find(b => 
                b.serviceId === service.id && b.serviceType === type && b.status === 'active'
            );
            setUserBooking(activeBooking || null);
        } catch (error) {
            console.error('Failed to fetch booking status', error);
        }
    };

    const handleConfirmBooking = async () => {
        setActionLoading(true);
        try {
            await confirmBooking();
            toast.success('Booking confirmed successfully!');
            await checkBookingStatus(); // refresh status
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!userBooking) return;
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        
        setActionLoading(true);
        try {
            await cancelBooking(userBooking.id);
            toast.success('Booking cancelled successfully');
            setUserBooking(null); // Clear active booking
        } catch (error) {
            toast.error('Failed to cancel booking');
        } finally {
            setActionLoading(false);
        }
    };

    /* ── Loading skeleton ──────────────────────── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="h-72 md:h-96 skeleton" />
                <div className="container-custom py-10 space-y-4">
                    <div className="h-8 w-64 skeleton rounded-lg" />
                    <div className="h-4 w-48 skeleton rounded-lg" />
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="h-24 skeleton rounded-xl" />
                        <div className="h-24 skeleton rounded-xl" />
                        <div className="h-24 skeleton rounded-xl" />
                    </div>
                    <div className="h-64 skeleton rounded-xl mt-6" />
                </div>
            </div>
        );
    }

    /* ── 404 ────────────────────────────────────── */
    if (!service) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary-600">404</h1>
                    <p className="text-xl text-gray-600 mt-4">Service not found</p>
                    <p className="text-gray-400 mt-2">
                        The {type} service you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate('/services')}
                        className="btn-primary mt-6 inline-flex items-center gap-2"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Services
                    </button>
                </div>
            </div>
        );
    }

    /* ── Helpers ────────────────────────────────── */
    const tabs = TABS[type] || ['Overview', 'Reviews'];
    const typeLabelMap = { bus: 'Bus & Transport', hotel: 'Hotels & Stays', trek: 'Trekking Package' };

    const renderBadges = () => {
        const badges = [];
        if (service.duration) badges.push({ icon: HiClock, text: service.duration });
        if (service.difficulty) badges.push({ icon: HiFlag, text: service.difficulty });
        if (service.maxAltitude) badges.push({ icon: HiLocationMarker, text: service.maxAltitude });
        if (service.groupSize) badges.push({ icon: HiUsers, text: `Group: ${service.groupSize}` });
        if (service.bestSeason) badges.push({ icon: HiCalendar, text: service.bestSeason });
        if (service.busType) badges.push({ icon: HiShieldCheck, text: service.busType });
        if (service.starRating) badges.push({ icon: HiStar, text: `${'★'.repeat(service.starRating)} Hotel` });
        if (service.city) badges.push({ icon: HiLocationMarker, text: service.city });
        if (service.route) badges.push({ icon: HiLocationMarker, text: `${service.route.from} → ${service.route.to}` });
        return badges;
    };

    /* ── Tab content ───────────────────────────── */
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <div className="prose max-w-none">
                        <p className="text-gray-600 leading-relaxed text-base">
                            {service.overview || service.description}
                        </p>
                        {type === 'bus' && (
                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Pickup Points</h4>
                                    <ul className="space-y-1">
                                        {service.pickup?.map((p, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <HiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Drop Points</h4>
                                    <ul className="space-y-1">
                                        {service.drop?.map((d, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <HiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {type === 'hotel' && service.nearbyHighlights && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Nearby Highlights</h4>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {service.nearbyHighlights.map((h, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                            <HiLocationMarker className="w-4 h-4 text-primary-500 shrink-0" />
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {type === 'trek' && service.budgetBreakdown && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Budget Breakdown</h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    {Object.entries(service.budgetBreakdown).map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-sm text-gray-600 capitalize">{key}</span>
                                            <span className="text-sm font-semibold text-gray-800">NPR {val.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-200">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-primary-600 text-lg">
                                            NPR {Object.values(service.budgetBreakdown).reduce((a, b) => a + b, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'Itinerary':
                return (
                    <div className="space-y-3">
                        {service.itinerary?.map((day, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-xs font-bold text-primary-700">
                                    {i + 1}
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 flex-grow">
                                    <p className="text-sm text-gray-700">{day}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "What's Included":
                return (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <HiCheckCircle className="w-5 h-5 text-green-500" /> Inclusions
                            </h4>
                            <ul className="space-y-2">
                                {(service.inclusions || service.amenities)?.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <HiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {service.exclusions && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <HiXCircle className="w-5 h-5 text-red-400" /> Exclusions
                                </h4>
                                <ul className="space-y-2">
                                    {service.exclusions.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                                            <HiXCircle className="w-4 h-4 text-red-400 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case 'Room Types':
                return (
                    <div className="space-y-4">
                        {service.roomTypes?.map((room, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-2xl font-bold text-primary-600">NPR {room.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">per night</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'Amenities':
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {service.amenities?.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                                <HiCheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                                <span className="text-sm text-gray-700">{a}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'Packing List':
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {service.packingList?.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                                <HiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                <span className="text-sm text-gray-700">{item}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'Policies':
                return (
                    <div className="space-y-3">
                        {service.cancellation && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-1">Cancellation Policy</h4>
                                <p className="text-sm text-gray-600">{service.cancellation}</p>
                            </div>
                        )}
                        {service.policies?.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                <HiShieldCheck className="w-4 h-4 text-primary-500 shrink-0" />
                                {p}
                            </div>
                        ))}
                        {service.checkIn && (
                            <div className="grid sm:grid-cols-2 gap-3 mt-2">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <span className="text-xs text-gray-400 uppercase font-medium">Check-in</span>
                                    <p className="text-lg font-semibold text-gray-900">{service.checkIn}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <span className="text-xs text-gray-400 uppercase font-medium">Check-out</span>
                                    <p className="text-lg font-semibold text-gray-900">{service.checkOut}</p>
                                </div>
                            </div>
                        )}
                        {service.departureTime && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Departure Times</h4>
                                <div className="flex flex-wrap gap-2">
                                    {service.departureTime.map((t, i) => (
                                        <span key={i} className="badge-primary">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'Reviews':
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-1">
                                <HiStar className="w-6 h-6 text-yellow-500" />
                                <span className="text-2xl font-bold text-gray-900">
                                    {service.rating || service.reviewScore}
                                </span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{service.reviewCount} reviews</span>
                        </div>
                        {/* Mock reviews */}
                        {[
                            { name: 'Rina S.', rating: 5, text: 'Absolutely incredible experience! Everything was well-organized and the service was top-notch. Would highly recommend to anyone.', date: '2 weeks ago' },
                            { name: 'Mark T.', rating: 4, text: 'Great value for money. The amenities were as described, and the staff was very friendly and helpful throughout.', date: '1 month ago' },
                            { name: 'Priya K.', rating: 5, text: 'Exceeded all expectations. The booking process was smooth and hassle-free. Will definitely book again!', date: '2 months ago' },
                        ].map((review, i) => (
                            <div key={i} className="border-b border-gray-100 last:border-0 py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${review.name}&background=3b82f6&color=fff&size=40`}
                                            alt={review.name}
                                            className="w-9 h-9 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: review.rating }).map((_, j) => (
                                                    <HiStar key={j} className="w-3.5 h-3.5 text-yellow-500" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{review.date}</span>
                                </div>
                                <p className="text-sm text-gray-600">{review.text}</p>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    /* ── Render ─────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Image */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Back button */}
                <Link
                    to="/services"
                    className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                    <HiArrowLeft className="w-4 h-4" />
                    All Services
                </Link>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="container-custom">
                        <span className="badge-primary mb-3 inline-block">{typeLabelMap[type]}</span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                            {service.title}
                        </h1>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <HiStar className="w-4 h-4 text-yellow-400" />
                            <span className="font-medium">{service.rating || service.reviewScore}</span>
                            <span>({service.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Badges */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom py-4 flex flex-wrap gap-3">
                    {renderBadges().map((badge, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3.5 py-1.5 text-sm text-gray-700">
                            <badge.icon className="w-4 h-4 text-primary-500" />
                            {badge.text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8 lg:py-12">
                <div className="lg:grid lg:grid-cols-3 lg:gap-10">
                    {/* Left: Tabs + Content */}
                    <div className="lg:col-span-2">
                        {/* Tab Bar */}
                        <div className="flex overflow-x-auto gap-1 mb-8 border-b border-gray-200 [&::-webkit-scrollbar]:hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab
                                            ? 'border-primary-600 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="animate-fade-in">{renderTabContent()}</div>
                    </div>

                    {/* Right: Sticky Booking Sidebar (desktop) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-20 bg-white rounded-xl shadow-card border border-gray-100 p-6">
                            <p className="text-sm text-gray-400 mb-1">Starting from</p>
                            <p className="text-3xl font-bold text-primary-600 mb-4">
                                NPR {service.price?.toLocaleString()}
                            </p>
                            {type === 'hotel' && (
                                <p className="text-xs text-gray-400 -mt-3 mb-4">per night</p>
                            )}
                            {type === 'bus' && (
                                <p className="text-xs text-gray-400 -mt-3 mb-4">per seat</p>
                            )}
                            {type === 'trek' && (
                                <p className="text-xs text-gray-400 -mt-3 mb-4">per person</p>
                            )}

                            {!isAdmin && (
                                <>
                                    {userBooking?.paymentStatus === 'completed' ? (
                                        <button
                                            disabled
                                            className="btn w-full py-3 text-base flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 cursor-default"
                                        >
                                            <HiCheckCircle className="w-5 h-5" />
                                            Payment Completed
                                        </button>
                                    ) : userBooking?.paymentStatus === 'failed' ? (
                                        <button
                                            disabled
                                            className="btn w-full py-3 text-base flex items-center justify-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 cursor-default"
                                        >
                                            <HiXCircle className="w-5 h-5" />
                                            Payment Rejected
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => userBooking ? handleCancelBooking() : handleBookNow(service, type)}
                                            disabled={actionLoading}
                                            className={`btn w-full py-3 text-base flex items-center justify-center gap-2 ${
                                                userBooking 
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                                : 'btn-primary'
                                            }`}
                                        >
                                            {actionLoading ? 'Processing...' : userBooking ? 'Cancel Booking' : 'Book Now'}
                                            {!userBooking && !actionLoading && <HiArrowRight className="w-4 h-4" />}
                                        </button>
                                    )}

                                    {userBooking?.paymentStatus === 'completed' ? (
                                        <p className="text-xs text-green-600 text-center mt-3 font-medium">
                                            Your payment has been verified. Enjoy your trip!
                                        </p>
                                    ) : userBooking?.paymentStatus === 'failed' ? (
                                        <p className="text-xs text-orange-600 text-center mt-3 font-medium">
                                            Your payment was rejected. Please contact support.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center mt-3">
                                            No payment required now. Secure your spot!
                                        </p>
                                    )}
                                </>
                            )}

                            {service.seatsAvailable && (
                                <p className="text-center mt-3 text-sm text-green-600 font-medium">
                                    🎫 {service.seatsAvailable} seats available
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400">From</p>
                    <p className="text-xl font-bold text-primary-600">NPR {service.price?.toLocaleString()}</p>
                </div>
                {userBooking?.paymentStatus === 'completed' ? (
                    <button
                        disabled
                        className="px-8 py-3 flex items-center gap-2 font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200 cursor-default"
                    >
                        <HiCheckCircle className="w-5 h-5" />
                        Paid ✓
                    </button>
                ) : userBooking?.paymentStatus === 'failed' ? (
                    <button
                        disabled
                        className="px-8 py-3 flex items-center gap-2 font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-200 cursor-default"
                    >
                        <HiXCircle className="w-5 h-5" />
                        Rejected
                    </button>
                ) : (
                    <button
                        onClick={() => userBooking ? handleCancelBooking() : handleBookNow(service, type)}
                        disabled={actionLoading}
                        className={`px-8 py-3 flex items-center gap-2 transition-colors font-semibold rounded-lg ${
                            userBooking 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                            : 'btn-primary'
                        }`}
                    >
                        {actionLoading ? 'Wait...' : userBooking ? 'Cancel' : 'Book Now'}
                        {!userBooking && !actionLoading && <HiArrowRight className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Spacer for mobile bottom bar */}
            <div className="lg:hidden h-20" />

            {/* Booking Modal */}
            {showModal && (
                <BookingModal
                    item={bookingItem}
                    onClose={closeModal}
                    onConfirm={handleConfirmBooking}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

export default ServiceDetailsPage;
