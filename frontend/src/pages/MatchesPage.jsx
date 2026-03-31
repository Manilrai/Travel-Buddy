/**
 * Find Buddies Page — AI Buddy Matches
 * Displays travelers who match user interests
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { HiSearch, HiLocationMarker, HiFilter } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const MatchesPage = () => {
    const { isAuthenticated, isVerified } = useAuth();
    
    // Buddies State
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Buddy filters
    const [buddyFilters, setBuddyFilters] = useState({ minScore: 0, destination: '', travelStyle: '' });
    const [showBuddyFilters, setShowBuddyFilters] = useState(false);

    useEffect(() => { 
        fetchMatches(); 
    }, []);

    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const params = { ...buddyFilters };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);
            const response = await matchAPI.getMatches(params);
            setMatches(response.data.data || []);
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoadingMatches(false);
        }
    };

    const getMatchColor = (score) => {
        if (score >= 70) return 'from-green-400 to-green-600';
        if (score >= 50) return 'from-primary-400 to-primary-600';
        return 'from-yellow-400 to-yellow-600';
    };

    return (
        <div className="container-custom py-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Find Buddies</h1>
                    <p className="text-gray-600 mt-1">Discover travelers who match your interests</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setShowBuddyFilters(!showBuddyFilters)} className="btn-secondary">
                        <HiFilter className="w-5 h-5 mr-2 inline" /> Filters
                    </button>
                </div>
            </div>

            {/* Buddy Filters Panel */}
            {showBuddyFilters && (
                <div className="card mb-8 animate-fade-in">
                    <div className="grid md:grid-cols-4 gap-4">
                        <select name="minScore" value={buddyFilters.minScore} onChange={(e) => setBuddyFilters({ ...buddyFilters, minScore: e.target.value })} className="input">
                            <option value="0">All matches</option>
                            <option value="40">40%+</option>
                            <option value="60">60%+</option>
                        </select>
                        <input type="text" placeholder="Destination" value={buddyFilters.destination} onChange={(e) => setBuddyFilters({ ...buddyFilters, destination: e.target.value })} className="input" />
                        <select value={buddyFilters.travelStyle} onChange={(e) => setBuddyFilters({ ...buddyFilters, travelStyle: e.target.value })} className="input">
                            <option value="">Any style</option>
                            <option value="budget">Budget</option>
                            <option value="moderate">Moderate</option>
                            <option value="luxury">Luxury</option>
                        </select>
                        <button onClick={fetchMatches} className="btn-primary">Apply</button>
                    </div>
                </div>
            )}

            {/* BUDDIES TAB CONTENT */}
            {loadingMatches ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-48 bg-gray-100"></div>)}
                </div>
            ) : matches.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map(({ user: matchUser, matchScore }) => (
                        <div key={matchUser.id} className="card hover:shadow-lg transition-all group overflow-hidden border border-gray-100 relative">
                            <div className="flex items-start space-x-4 relative z-10">
                                <img src={matchUser.profile?.profilePicture || '/default-avatar.svg'} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900">{matchUser.profile?.fullName}</h3>
                                        <span className={`match-score text-xs px-2 py-1 rounded-full text-white font-bold bg-gradient-to-r ${getMatchColor(matchScore)}`}>{matchScore}% Match</span>
                                    </div>
                                    <p className="text-sm text-gray-500 flex items-center mt-1"><HiLocationMarker className="w-3.5 h-3.5 mr-1" />{matchUser.profile?.nationality || 'Unknown Location'}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4 line-clamp-2 relative z-10">{matchUser.profile?.bio || 'No bio available'}</p>
                            <div className="flex space-x-2 mt-5 pt-4 border-t border-gray-100 relative z-10">
                                <Link to={`/users/${matchUser.id}`} className="btn-secondary flex-1 text-center text-sm py-2">View Profile</Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <HiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No buddy matches found.</p>
                    <p className="text-sm text-gray-500 mt-1">Complete your profile for better AI personalized matches!</p>
                    <Link to="/profile/edit" className="btn-primary mt-6 inline-block">Update My Profile</Link>
                </div>
            )}
        </div>
    );
};

export default MatchesPage;
