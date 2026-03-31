/**
 * Trips Page
 * Browse and filter available trips
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { HiPlus, HiSearch, HiLocationMarker, HiCalendar, HiUsers, HiRefresh } from 'react-icons/hi';

const TripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const defaultFilters = {
        destination: '',
        budgetType: '',
        status: 'all'
    };

    const [draftFilters, setDraftFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 50 };
            const response = await tripAPI.getTrips(params);
            setTrips(response.data.data.trips || []);
            setPagination(response.data.data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDraftChange = (e) => {
        setDraftFilters({ ...draftFilters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        setAppliedFilters(draftFilters);
    };

    const handleResetFilters = () => {
        setDraftFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
    };

    const isDirty = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => {
            const matchesDest = appliedFilters.destination
                ? trip.destination?.toLowerCase().includes(appliedFilters.destination.toLowerCase())
                : true;
            const matchesBudget = appliedFilters.budgetType
                ? trip.budgetType?.toLowerCase() === appliedFilters.budgetType.toLowerCase()
                : true;
            const matchesStatus = appliedFilters.status && appliedFilters.status !== 'all'
                ? trip.status?.toLowerCase() === appliedFilters.status.toLowerCase()
                : true;

            return matchesDest && matchesBudget && matchesStatus;
        });
    }, [trips, appliedFilters]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Explore Trips</h1>
                    <p className="text-gray-600">Find and join exciting group adventures</p>
                </div>
                <Link to="/trips/create" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
                    <HiPlus className="w-5 h-5 mr-2" />
                    Create Trip
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-8">
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="destination"
                            value={draftFilters.destination}
                            onChange={handleDraftChange}
                            placeholder="Search destination..."
                            className="input pl-10"
                        />
                    </div>
                    <select name="budgetType" value={draftFilters.budgetType} onChange={handleDraftChange} className="input">
                        <option value="">All Budgets</option>
                        <option value="budget">Budget</option>
                        <option value="moderate">Moderate</option>
                        <option value="luxury">Luxury</option>
                    </select>
                    <select name="status" value={draftFilters.status} onChange={handleDraftChange} className="input">
                        <option value="all">All Statuses</option>
                        <option value="open">Open for Joining</option>
                        <option value="planning">Planning</option>
                        <option value="full">Full</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            disabled={!isDirty}
                            className={`flex-1 ${isDirty ? 'btn-primary' : 'btn-secondary opacity-70'} whitespace-nowrap`}
                            title={!isDirty ? 'No changes to apply' : 'Apply selected filters'}
                        >
                            {isDirty ? 'Apply Filters *' : 'Apply Filters'}
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="btn-secondary flex items-center justify-center px-3"
                            title="Reset Filters"
                        >
                            <HiRefresh className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
                {isDirty && (
                    <p className="text-xs text-orange-500 mt-2 ml-1 animate-pulse">
                        * Filters modified. Click Apply to view results.
                    </p>
                )}
            </div>

            {/* Trips Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredTrips.length > 0 ? (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrips.map((trip) => (
                            <Link
                                key={trip.id}
                                to={`/trips/${trip.id}`}
                                className="card hover:shadow-lg transition-shadow group"
                            >
                                {/* Cover Image */}
                                <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                    {trip.coverImage && trip.coverImage !== '/uploads/default-trip.jpg' ? (
                                        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/images/himalayas/everestbasecamp.avif" alt="Default Trip Cover" className="w-full h-full object-cover" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                            {trip.title}
                                        </h3>
                                        <span className={`badge ${trip.status === 'open' ? 'badge-success' : 'badge-warning'} capitalize`}>
                                            {trip.status}
                                        </span>
                                    </div>

                                    <p className="flex items-center text-gray-600 text-sm">
                                        <HiLocationMarker className="w-4 h-4 mr-1 flex-shrink-0" />
                                        {trip.destination}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <HiCalendar className="w-4 h-4 mr-1" />
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="flex items-center text-sm text-gray-600">
                                            <HiUsers className="w-4 h-4 mr-1" />
                                            {trip.currentMembers}/{trip.maxGroupSize}
                                        </span>
                                        <span className="flex items-center text-sm text-gray-600">
                                            <span className="font-semibold mr-1">Rs.</span>
                                            <span className="capitalize">{trip.budgetType}</span>
                                        </span>
                                    </div>

                                    {/* Creator */}
                                    <div className="flex items-center pt-2">
                                        <img
                                            src={trip.creator?.profile?.profilePicture || '/default-avatar.svg'}
                                            alt=""
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span className="text-xs text-gray-500">
                                            by {trip.creator?.profile?.fullName}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => fetchTrips(i + 1)}
                                    className={`px-4 py-2 rounded-lg ${pagination.page === i + 1
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <HiLocationMarker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
                    <p className="text-gray-600 mb-6">Be the first to create a trip to this destination!</p>
                    <Link to="/trips/create" className="btn-primary inline-flex items-center">
                        <HiPlus className="w-5 h-5 mr-2" />
                        Create a Trip
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TripsPage;
