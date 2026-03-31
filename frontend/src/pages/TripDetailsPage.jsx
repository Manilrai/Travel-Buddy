/**
 * Trip Details Page
 * View single trip with members and join/leave functionality
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI, messageAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiLocationMarker, HiCalendar, HiUsers,
    HiArrowLeft, HiChat, HiLogout, HiTrash, HiPencil
} from 'react-icons/hi';

const TripDetailsPage = () => {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const response = await tripAPI.getTrip(id);
            setTrip(response.data.data);
        } catch (error) {
            toast.error('Trip not found');
            navigate('/trips');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/trips/${id}` } });
            return;
        }

        if (isAdmin) {
            toast.error('Admins cannot join trips.');
            return;
        }
        
        if (user.verificationStatus !== 'approved') {
            toast.error('You must be KYC Verified to join a trip.');
            navigate('/verify');
            return;
        }

        setActionLoading(true);
        try {
            await tripAPI.joinTrip(id);
            toast.success('Successfully joined the trip!');
            fetchTrip();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join trip');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this trip?')) return;
        setActionLoading(true);
        try {
            await tripAPI.leaveTrip(id);
            toast.success('You have left the trip');
            fetchTrip();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave trip');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
        try {
            await tripAPI.deleteTrip(id);
            toast.success('Trip deleted');
            navigate('/trips');
        } catch (error) {
            toast.error('Failed to delete trip');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!trip) return null;

    const isCreator = trip.isCreator;
    const isMember = trip.isMember;
    const canJoin = !isMember && trip.status === 'open' && trip.currentMembers < trip.maxGroupSize && !isAdmin;

    return (
        <div className="container-custom py-8">
            {/* Back button */}
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <HiArrowLeft className="w-5 h-5 mr-2" />
                Back to trips
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="card">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className={`badge ${trip.status === 'open' ? 'badge-success' : 'badge-warning'} capitalize mb-2`}>
                                    {trip.status}
                                </span>
                                <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
                            </div>
                            {isCreator && (
                                <div className="flex space-x-2">
                                    <Link to={`/trips/${id}/edit`} className="btn-ghost p-2">
                                        <HiPencil className="w-5 h-5" />
                                    </Link>
                                    <button onClick={handleDelete} className="btn-ghost p-2 text-red-600 hover:bg-red-50">
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Trip Info */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center text-gray-600">
                                <HiLocationMarker className="w-5 h-5 mr-2 text-primary-500" />
                                <span>{trip.destination}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <HiCalendar className="w-5 h-5 mr-2 text-primary-500" />
                                <span>{formatDate(trip.startDate)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <HiUsers className="w-5 h-5 mr-2 text-primary-500" />
                                <span>{trip.currentMembers} / {trip.maxGroupSize} members</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="text-primary-500 font-bold mr-2 text-lg">Rs.</span>
                                <span className="capitalize">{trip.budgetType} budget</span>
                                {trip.budget && <span className="ml-1">(~Rs. {trip.budget})</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">About this trip</h3>
                            <p className="text-gray-600 whitespace-pre-line">
                                {trip.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Group Chat (if member) */}
                    {isMember && (
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-4">Group Chat</h3>
                            <Link
                                to={`/messages/trip/${id}`}
                                className="btn-secondary w-full flex items-center justify-center"
                            >
                                <HiChat className="w-5 h-5 mr-2" />
                                Open Group Chat
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="card">
                        {canJoin && (
                            <button
                                onClick={handleJoin}
                                disabled={actionLoading}
                                className="btn-primary w-full py-3 text-lg mb-4"
                            >
                                {actionLoading ? 'Joining...' : 'Join This Trip'}
                            </button>
                        )}

                        {isMember && !isCreator && (
                            <button
                                onClick={handleLeave}
                                disabled={actionLoading}
                                className="btn-danger w-full flex items-center justify-center"
                            >
                                <HiLogout className="w-5 h-5 mr-2" />
                                Leave Trip
                            </button>
                        )}

                        {trip.status === 'full' && !isMember && (
                            <div className="text-center text-gray-600">
                                <p className="font-medium">This trip is full</p>
                                <p className="text-sm">Check back later or create your own!</p>
                            </div>
                        )}

                        {isMember && (
                            <p className="text-center text-green-600 font-medium mt-2">
                                ✓ You're a member of this trip
                            </p>
                        )}
                    </div>

                    {/* Creator Card */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">Trip Organizer</h3>
                        <Link
                            to={`/users/${trip.creator?.id}`}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src={trip.creator?.profile?.profilePicture || '/default-avatar.svg'}
                                alt={trip.creator?.profile?.fullName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-medium text-gray-900">{trip.creator?.profile?.fullName}</p>
                                <p className="text-sm text-gray-500">{trip.creator?.profile?.nationality}</p>
                            </div>
                        </Link>
                    </div>

                    {/* Members Card */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Trip Members ({trip.tripMembers?.length || 0})
                        </h3>
                        <div className="space-y-3">
                            {trip.tripMembers?.map((member) => (
                                <Link
                                    key={member.id}
                                    to={`/users/${member.user?.id}`}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                                >
                                    <img
                                        src={member.user?.profile?.profilePicture || '/default-avatar.svg'}
                                        alt=""
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">
                                            {member.user?.profile?.fullName}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDetailsPage;
