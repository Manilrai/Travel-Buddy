/**
 * ServiceCard - Reusable card for service listings
 */

import { Link } from 'react-router-dom';
import { HiStar, HiLocationMarker, HiClock, HiArrowRight, HiCheckCircle, HiXCircle } from 'react-icons/hi';

const ServiceCard = ({ service, type, onBookNow, userBooking, onCancelBooking, isAdmin }) => {
    const detailPath = `/services/${type}/${service.id}`;

    const typeExtra = () => {
        switch (type) {
            case 'bus':
                return (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <HiLocationMarker className="w-4 h-4 text-primary-500" />
                        <span>{service.route?.from} → {service.route?.to}</span>
                    </div>
                );
            case 'hotel':
                return (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <HiLocationMarker className="w-4 h-4 text-primary-500" />
                        <span>{service.city}</span>
                        {service.starRating && (
                            <span className="ml-2 text-xs text-yellow-600 font-medium">
                                {'★'.repeat(service.starRating)}
                            </span>
                        )}
                    </div>
                );
            case 'trek':
                return (
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <HiClock className="w-4 h-4 text-primary-500" />
                            {service.duration}
                        </span>
                        <span className="badge-primary text-xs">{service.difficulty}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="group bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-600 shadow-sm">
                    NPR {service.price?.toLocaleString()}
                </div>
                {type === 'bus' && service.seatsAvailable && (
                    <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white">
                        {service.seatsAvailable} seats left
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {service.title}
                </h3>

                <div className="mb-3">{typeExtra()}</div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                    {service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                    <HiStar className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-gray-800">
                        {service.rating || service.reviewScore}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({service.reviewCount} reviews)
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        to={detailPath}
                        className={`btn-secondary text-center text-sm py-2 ${isAdmin ? 'w-full' : 'flex-1'}`}
                    >
                        View Details
                    </Link>
                    {!isAdmin && (
                        <>
                            {userBooking?.paymentStatus === 'completed' ? (
                                <button
                                    disabled
                                    className="bg-green-50 text-green-700 font-semibold border border-green-200 rounded-lg flex-1 text-sm py-2 flex items-center justify-center gap-1 cursor-default"
                                >
                                    <HiCheckCircle className="w-4 h-4" />
                                    Payment Completed
                                </button>
                            ) : userBooking?.paymentStatus === 'failed' ? (
                                <button
                                    disabled
                                    className="bg-orange-50 text-orange-700 font-semibold border border-orange-200 rounded-lg flex-1 text-sm py-2 flex items-center justify-center gap-1 cursor-default"
                                >
                                    <HiXCircle className="w-4 h-4" />
                                    Payment Rejected
                                </button>
                            ) : userBooking ? (
                                <button
                                    onClick={onCancelBooking}
                                    className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold border border-red-200 rounded-lg flex-1 text-sm py-2 flex items-center justify-center gap-1 transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            ) : (
                                <button
                                    onClick={() => onBookNow(service, type)}
                                    className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1"
                                >
                                    Book Now
                                    <HiArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
