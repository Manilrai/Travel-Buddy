/**
 * My Activity Page
 * Displays user's booked services (buses, hotels, treks) and published trips
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, tripAPI } from '../services/api';
import { HiMap, HiTruck, HiOfficeBuilding, HiFlag } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MyActivityPage = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, tripsRes] = await Promise.all([
                bookingAPI.getMyBookings(),
                tripAPI.getMyTrips()
            ]);
            
            // Only show active/completed bookings
            setBookings(bookingsRes.data.data.filter(b => b.status !== 'cancelled') || []);
            setTrips(tripsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching activity data:', error);
            toast.error('Failed to load your activity data');
        } finally {
            setLoading(false);
        }
    };

    const getServiceIcon = (type) => {
        switch(type) {
            case 'bus': return <HiTruck className="w-5 h-5 text-blue-500" />;
            case 'hotel': return <HiOfficeBuilding className="w-5 h-5 text-indigo-500" />;
            case 'trek': return <HiFlag className="w-5 h-5 text-green-500" />;
            default: return <HiMap className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const openPaymentModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setReceiptFile(null);
        setReceiptPreview(null);
        setPaymentModalOpen(true);
    };

    const handleUploadReceipt = async (e) => {
        e.preventDefault();
        if (!receiptFile) {
            return toast.error('Please select a receipt image to upload');
        }

        setSubmittingPayment(true);
        try {
            const formData = new FormData();
            formData.append('receipt', receiptFile);
            
            await bookingAPI.uploadPaymentReceipt(selectedBookingId, formData);
            toast.success('Payment receipt uploaded successfully!');
            setPaymentModalOpen(false);
            fetchData(); // Refresh bookings
        } catch (error) {
            console.error('Error uploading receipt:', error);
            toast.error(error.response?.data?.message || 'Failed to upload receipt');
        } finally {
            setSubmittingPayment(false);
        }
    };

    return (
        <div className="container-custom py-8 min-h-[70vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Activity</h1>
                <p className="text-gray-600 mt-1">Manage your bookings and view your trips</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-8 bg-gray-100/50 p-1.5 rounded-xl w-max">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'bookings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    Booked Services ({bookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('trips')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'trips' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    My Trips ({trips.length})
                </button>
            </div>

            {/* Content area */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="card animate-pulse h-48 bg-gray-100"></div>)}
                </div>
            ) : (
                <>
                    {/* Bookings View */}
                    {activeTab === 'bookings' && (
                        bookings.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="card hover:shadow-lg transition-shadow border border-gray-100">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                    {getServiceIcon(booking.serviceType)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 capitalize">{booking.serviceType}</p>
                                                    <h3 className="font-bold text-gray-900 text-lg">Booking #{booking.id.toString().slice(-4)}</h3>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Service:</span>
                                                <span className="font-medium text-gray-900">{booking.serviceTitle || 'Unknown Details'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Date:</span>
                                                <span className="font-medium text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {booking.price && (
                                                <div className="flex justify-between text-sm bg-gray-50 p-2 rounded mt-2">
                                                    <span className="text-gray-500">Total:</span>
                                                    <span className="font-bold text-gray-900">Rs. {booking.price}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Link to={`/services/${booking.serviceType}/${booking.serviceId}`} className="btn-secondary w-full text-center py-2 block">
                                                View Service Details
                                            </Link>
                                            
                                            {booking.paymentStatus === 'pending' && (
                                                <button 
                                                    onClick={() => openPaymentModal(booking.id)}
                                                    className="w-full text-center py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium cursor-pointer"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {booking.paymentStatus === 'processing' && (
                                                <div className="w-full text-center py-2 bg-yellow-100 text-yellow-800 rounded-xl font-medium">
                                                    Processing Payment...
                                                </div>
                                            )}
                                            {booking.paymentStatus === 'completed' && (
                                                <div className="w-full text-center py-2 bg-green-100 text-green-800 rounded-xl font-medium">
                                                    Payment Completed
                                                </div>
                                            )}
                                            {booking.paymentStatus === 'failed' && (
                                                <button 
                                                    onClick={() => openPaymentModal(booking.id)}
                                                    className="w-full text-center py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium cursor-pointer"
                                                >
                                                    Payment Failed - Try Again
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                <HiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Bookings Found</h3>
                                <p className="text-gray-500">You haven't booked any buses, hotels, or trekking guides yet.</p>
                                <Link to="/services" className="btn-primary mt-6 inline-block">Browse Services</Link>
                            </div>
                        )
                    )}

                    {/* Trips View */}
                    {activeTab === 'trips' && (
                        trips.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trips.map(trip => (
                                    <div key={trip.id} className="card p-0 overflow-hidden hover:shadow-lg transition-all group border border-gray-100">
                                        <div className="h-40 bg-gray-200 relative">
                                            {trip.coverImage ? (
                                                <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center text-white/50">
                                                    <HiMap className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                                                {trip.budgetType === 'budget' ? '$' : trip.budgetType === 'moderate' ? '$$' : '$$$'}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">{trip.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4 flex items-center">
                                                <HiMap className="w-4 h-4 mr-1 text-primary-400" /> {trip.destination}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                                                    {new Date(trip.startDate).toLocaleDateString()}
                                                </div>
                                                <Link to={`/trips/${trip.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                                                    View Details 
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                <HiMap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Trips Yet</h3>
                                <p className="text-gray-500">You haven't posted any travel plans yet.</p>
                                <Link to="/trips/create" className="btn-primary mt-6 inline-block">Plan a Trip</Link>
                            </div>
                        )
                    )}
                </>
            )}

            {/* Payment Modal */}
            {paymentModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Upload Payment Receipt</h3>
                            <button onClick={() => setPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
                                <p className="font-bold mb-2">Payment Instructions (Nepal):</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>eSewa / Khalti:</strong> Send to 98XXXXXXXX</li>
                                    <li><strong>Bank Transfer:</strong> NIC Asia Bank<br/>A/C Name: Travel Buddy<br/>A/C No: 1234567890123456</li>
                                </ul>
                                <p className="mt-3 text-xs italic">Please upload a clear screenshot of your successful transaction.</p>
                            </div>

                            <form onSubmit={handleUploadReceipt}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                                    />
                                </div>

                                {receiptPreview && (
                                    <div className="mb-6 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-48 flex justify-center items-center">
                                        <img src={receiptPreview} alt="Receipt Preview" className="max-h-full max-w-full object-contain" />
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setPaymentModalOpen(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={!receiptFile || submittingPayment}
                                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submittingPayment ? 'Uploading...' : 'Submit Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyActivityPage;
