/**
 * Dashboard Page
 * Main user dashboard with overview and quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI, tripAPI, messageAPI } from '../services/api';
import {
    HiUsers, HiMap, HiChat, HiPlus, HiArrowRight,
    HiStar, HiCalendar, HiLocationMarker
} from 'react-icons/hi';

const DashboardPage = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [myTrips, setMyTrips] = useState({ created: [], joined: [] });
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [matchesRes, tripsRes, unreadRes] = await Promise.all([
                matchAPI.getMatches({ limit: 4 }),
                tripAPI.getMyTrips(),
                messageAPI.getUnreadCount()
            ]);

            setMatches(Array.isArray(matchesRes.data.data) ? matchesRes.data.data : []);
            setMyTrips(tripsRes.data.data || { created: [], joined: [] });
            setUnreadMessages(unreadRes.data.data.count || 0);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const profileCompletion = user?.profile?.fullName ?
        (user.profile.bio ? 80 : 50) : 20;

    const quickStats = [
        {
            icon: HiUsers,
            label: 'Matches',
            value: matches.length,
            color: 'bg-blue-500',
            link: '/matches'
        },
        {
            icon: HiMap,
            label: 'My Trips',
            value: (myTrips.created?.length || 0) + (myTrips.joined?.length || 0),
            color: 'bg-green-500',
            link: '/trips'
        },
        {
            icon: HiChat,
            label: 'Messages',
            value: unreadMessages,
            color: 'bg-purple-500',
            link: '/messages'
        },
        {
            icon: HiStar,
            label: 'Rating',
            value: user?.profile?.averageRating || '—',
            color: 'bg-yellow-500',
            link: '/profile'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.profile?.fullName?.split(' ')[0] || 'Traveler'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">Ready to find your next travel buddy?</p>
            </div>

            {/* Profile Completion Alert */}
            {profileCompletion < 80 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold">{profileCompletion}%</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Complete your profile</p>
                            <p className="text-sm text-gray-600">A complete profile gets 3x more matches!</p>
                        </div>
                    </div>
                    <Link to="/profile/edit" className="btn-primary">
                        Complete Profile
                    </Link>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {quickStats.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="card hover:border-primary-200 border border-transparent transition-all"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Suggested Matches */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Suggested Travel Buddies</h2>
                        <Link to="/matches" className="text-primary-600 hover:text-primary-700 flex items-center text-sm">
                            View all <HiArrowRight className="ml-1" />
                        </Link>
                    </div>

                    {matches.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {matches.slice(0, 4).map((match) => (
                                <Link
                                    key={match.user.id}
                                    to={`/users/${match.user.id}`}
                                    className="card hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={match.user.profile?.profilePicture || '/default-avatar.svg'}
                                            alt={match.user.profile?.fullName}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">
                                                    {match.user.profile?.fullName}
                                                </h3>
                                                <span className="match-score text-sm w-10 h-10">
                                                    {match.matchScore}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {match.user.profile?.nationality || 'Unknown location'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                {match.user.profile?.bio || 'No bio yet'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <HiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                                {profileCompletion < 80 
                                    ? "Complete your profile to get matched with travel buddies" 
                                    : "No travel buddies found for your current interests."}
                            </p>
                            <Link to="/profile/edit" className="btn-primary">
                                Update Profile
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                to="/trips/create"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <HiPlus className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-medium text-gray-700">Create a Trip</span>
                            </Link>
                            <Link
                                to="/matches"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <HiUsers className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-700">Find Buddies</span>
                            </Link>
                            <Link
                                to="/trips"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <HiMap className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-medium text-gray-700">Browse Trips</span>
                            </Link>
                        </div>
                    </div>

                    {/* My Upcoming Trips */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">My Trips</h3>
                        {[...myTrips.created, ...myTrips.joined].length > 0 ? (
                            <div className="space-y-3">
                                {[...myTrips.created, ...myTrips.joined].slice(0, 3).map((trip) => (
                                    <Link
                                        key={trip.id}
                                        to={`/trips/${trip.id}`}
                                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                            <HiLocationMarker className="w-4 h-4" />
                                            <span>{trip.destination}</span>
                                        </div>
                                        <p className="font-medium text-gray-900">{trip.title}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                            <HiCalendar className="w-3 h-3" />
                                            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-sm">No trips yet. Create or join one!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
