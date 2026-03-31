import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Receipt Modal State
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllBookings();
            // Optional: sort so 'processing' mappings are at top
            const sortedBookings = res.data.data.bookings.sort((a, b) => {
                if (a.paymentStatus === 'processing' && b.paymentStatus !== 'processing') return -1;
                if (a.paymentStatus !== 'processing' && b.paymentStatus === 'processing') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setBookings(sortedBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (bookingId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) return;
        
        setProcessingAction(true);
        try {
            await adminAPI.updateBookingPaymentStatus(bookingId, { paymentStatus: newStatus });
            toast.success(`Payment marked as ${newStatus}`);
            setReceiptModalOpen(false);
            fetchBookings();
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error(error.response?.data?.message || 'Failed to update payment status');
        } finally {
            setProcessingAction(false);
        }
    };

    const openReceiptModal = (booking) => {
        setSelectedBooking(booking);
        setReceiptModalOpen(true);
    };

    const getStatusBadge = (paymentStatus, bookingStatus) => {
        if (bookingStatus === 'cancelled') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Cancelled</span>;
        
        switch(paymentStatus) {
            case 'completed': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Completed</span>;
            case 'processing': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 animate-pulse">Needs Review</span>;
            case 'failed': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Failed</span>;
            default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Pending</span>;
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold border-b-4 border-primary-500 pb-2 inline-block">Bookings Management</h1>
                    <p className="text-gray-600 mt-2">View user bookings and approve their payment receipts here.</p>
                </div>
                <button onClick={fetchBookings} className="btn-secondary">Refresh</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading bookings...</td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No bookings found.</td>
                                </tr>
                            ) : bookings.map((booking) => (
                                <tr key={booking.id} className={booking.paymentStatus === 'processing' ? 'bg-yellow-50/30' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{booking.user?.profile?.fullName || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{booking.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{booking.serviceTitle}</div>
                                        <div className="text-xs text-gray-500 uppercase">{booking.serviceType}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        Rs. {booking.price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(booking.paymentStatus, booking.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {booking.paymentStatus === 'processing' && booking.paymentReceipt ? (
                                            <button 
                                                onClick={() => openReceiptModal(booking)}
                                                className="text-primary-600 hover:text-primary-900 font-semibold"
                                            >
                                                Review Payment
                                            </button>
                                        ) : booking.paymentReceipt ? (
                                            <button 
                                                onClick={() => openReceiptModal(booking)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                View Receipt
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">No receipt</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Receipt Review Modal */}
            {receiptModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Review Payment Receipt</h3>
                                <p className="text-sm text-gray-500">Booking #{selectedBooking.id} • Rs. {selectedBooking.price}</p>
                            </div>
                            <button onClick={() => setReceiptModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 flex justify-center items-center" style={{ minHeight: '300px', maxHeight: '600px' }}>
                                <img 
                                    src={`http://localhost:5000${selectedBooking.paymentReceipt}`} 
                                    alt="Payment Receipt" 
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Receipt+Image+Not+Found' }}
                                />
                            </div>

                            {selectedBooking.paymentStatus === 'processing' ? (
                                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleAction(selectedBooking.id, 'failed')}
                                        disabled={processingAction}
                                        className="btn-secondary flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    >
                                        Reject Payment
                                    </button>
                                    <button 
                                        onClick={() => handleAction(selectedBooking.id, 'completed')}
                                        disabled={processingAction}
                                        className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        Approve &amp; Confirm Booking
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center pt-4 border-t border-gray-100">
                                    <p className="text-gray-500 mb-4">This payment was already marked as {selectedBooking.paymentStatus}.</p>
                                    <button onClick={() => setReceiptModalOpen(false)} className="btn-secondary px-8">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookingsPage;
