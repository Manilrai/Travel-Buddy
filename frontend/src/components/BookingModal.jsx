/**
 * BookingModal - Confirmation modal for service bookings
 */

import { useState } from 'react';
import { HiX, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const BookingModal = ({ item, onClose, onConfirm, loading }) => {
    const [confirmed, setConfirmed] = useState(false);

    if (!item) return null;

    const typeLabels = { bus: 'Bus Ticket', hotel: 'Hotel Stay', trek: 'Trekking Package' };

    const handleConfirm = async () => {
        try {
            await onConfirm();
            setConfirmed(true);
            toast.success(`Booking request sent!`);
            // The parent page will close the modal via checkBookingStatus refresh and state reset
            setTimeout(() => onClose(), 2000);
        } catch (error) {
            // error handled by parent
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {confirmed ? 'Booking Confirmed!' : 'Confirm Booking'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    {confirmed ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiCheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                                You're all set!
                            </p>
                            <p className="text-sm text-gray-500">
                                Your booking has been saved. We'll contact you shortly.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 mb-5">
                                <span className="badge-primary mb-2">
                                    {typeLabels[item.serviceType] || 'Service'}
                                </span>
                                <h4 className="font-semibold text-gray-900 mt-2">
                                    {item.title}
                                </h4>
                                {item.city && (
                                    <p className="text-sm text-gray-500 mt-1">{item.city}</p>
                                )}
                                {item.route && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {item.route.from} → {item.route.to}
                                    </p>
                                )}
                                {item.duration && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Duration: {item.duration}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-5 px-1">
                                <span className="text-gray-600">Total Price</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    NPR {item.price?.toLocaleString()}
                                </span>
                            </div>

                            <p className="text-xs text-gray-400 mb-5">
                                This is a simulated booking. No real payment will be processed.
                            </p>

                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm & Book Now'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
