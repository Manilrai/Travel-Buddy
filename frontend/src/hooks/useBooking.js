/**
 * useBooking Hook
 * Handles the "Book Now" action — checks auth, redirects to login or opens booking modal
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const useBooking = () => {
    const { isAuthenticated, isVerified, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [bookingItem, setBookingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    /**
     * Call this when the user clicks "Book Now"
     * @param {Object} service - The service object
     * @param {string} type - 'bus' | 'hotel' | 'trek'
     */
    const handleBookNow = (service, type) => {
        if (!isAuthenticated) {
            // Save return path in both location.state and localStorage (fallback)
            const returnTo = location.pathname;
            localStorage.setItem(
                'bookingRedirect',
                JSON.stringify({ from: returnTo, serviceType: type, serviceId: service.id })
            );
            navigate('/login', { state: { from: returnTo } });
            return;
        }

        if (isAdmin) {
            toast.error('Admins cannot book services.');
            return;
        }

        if (!isVerified) {
            toast.error('You must be KYC Verified to book services. Please complete your verification.');
            navigate('/verify');
            return;
        }

        // User is authenticated and verified — open booking modal
        setBookingItem({ ...service, serviceType: type });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setBookingItem(null);
    };

    const confirmBooking = async () => {
        if (!bookingItem) return null;

        try {
            const response = await bookingAPI.createBooking({
                serviceId: bookingItem.id,
                serviceType: bookingItem.serviceType,
                serviceTitle: bookingItem.title,
                price: bookingItem.price
            });
            closeModal();

            // Dispatch a global event so the Navbar can update notifications instantly
            window.dispatchEvent(new Event('bookingConfirmed'));

            return response.data.data;
        } catch (error) {
            console.error('Booking failed:', error);
            throw error;
        }
    };

    const cancelBooking = async (bookingId) => {
        try {
            const response = await bookingAPI.cancelBooking(bookingId);
            return response.data.data;
        } catch (error) {
            console.error('Cancellation failed:', error);
            throw error;
        }
    };

    return { handleBookNow, bookingItem, showModal, closeModal, confirmBooking, cancelBooking };
};

export default useBooking;
