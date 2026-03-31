import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, matchAPI, ratingAPI } from '../services/api';
import { HiLocationMarker, HiStar, HiChat, HiFlag, HiCalendar, HiUsers, HiBadgeCheck, HiPencilAlt, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [matchData, setMatchData] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('other');
    const [reportDescription, setReportDescription] = useState('');

    const [showRateModal, setShowRateModal] = useState(false);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewText, setReviewText] = useState('');

    useEffect(() => { fetchUserData(); }, [id]);

    const fetchUserData = async () => {
        try {
            const [userRes, matchRes, ratingsRes] = await Promise.all([
                userAPI.getUser(id),
                matchAPI.getMatchWithUser(id).catch(() => ({ data: { data: null } })), // Catch optional if no match found
                ratingAPI.getUserRatings(id).catch(() => ({ data: { data: { ratings: [] } } }))
            ]);
            setUserData(userRes.data.data);
            setMatchData(matchRes.data.data);
            // API shape varies based on ratings endpoints, but generally falls here
            setRatings(ratingsRes.data.data.ratings || ratingsRes.data.data || []);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const handleReportUser = async (e) => {
        e.preventDefault();
        try {
            await userAPI.reportUser(id, { reportType: reportReason, description: reportDescription });
            toast.success('User has been reported successfully.');
            setShowReportModal(false);
            setReportDescription('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to report user');
        }
    };

    const handleRateUser = async (e) => {
        e.preventDefault();
        try {
            await userAPI.rateUser(id, { rating: ratingValue, review: reviewText });
            toast.success('Rating submitted successfully!');
            setShowRateModal(false);
            setReviewText('');
            setRatingValue(5);
            fetchUserData(); // refresh ratings
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit rating');
        }
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div></div>;
    if (!userData) return <div className="container-custom py-8 text-center"><p>User not found</p></div>;

    const profile = userData.profile || {};
    const isOwnProfile = currentUser?.id === parseInt(id);

    return (
        <div className="container-custom py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Profile */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <img src={profile.profilePicture || '/default-avatar.svg'} alt="" className="w-24 h-24 rounded-full object-cover" />
                                {userData.isVerified && <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1"><HiBadgeCheck className="w-5 h-5 text-white" /></div>}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-gray-600 mt-2">
                                    {profile.nationality && <span className="flex items-center"><HiLocationMarker className="w-4 h-4 mr-1" />{profile.nationality}</span>}
                                    {profile.age && <span>{profile.age} years old</span>}
                                    {profile.travelStyle && <span className="badge-primary capitalize">{profile.travelStyle}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-3">
                                    <span className="flex items-center"><HiStar className="w-5 h-5 text-yellow-500 mr-1" />{profile.averageRating || '—'}</span>
                                    <span className="text-gray-500">({profile.totalRatings || 0} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-semibold mb-2">About</h3>
                                <p className="text-gray-600">{profile.bio}</p>
                            </div>
                        )}
                    </div>

                    {/* Interests */}
                    {userData.interests?.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold mb-4">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {userData.interests.map(i => <span key={i.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{i.icon} {i.name}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Reviews ({ratings.length})</h3>
                            {!isOwnProfile && (
                                <button onClick={() => setShowRateModal(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Leave a Review</button>
                            )}
                        </div>
                        {ratings.length > 0 ? (
                            <div className="space-y-4">
                                {ratings.slice(0, 5).map(r => (
                                    <div key={r.id} className="flex space-x-3 pb-4 border-b last:border-0">
                                        <img src={r.rater?.profile?.profilePicture || '/default-avatar.svg'} alt="" className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{r.rater?.profile?.fullName || `User #${r.raterId}`}</span>
                                                <div className="flex text-yellow-500">{[...Array(5)].map((_, i) => <HiStar key={i} className={`w-4 h-4 ${i < r.rating ? '' : 'opacity-30'}`} />)}</div>
                                            </div>
                                            {r.review && <p className="text-gray-600 text-sm mt-1">{r.review}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500">No reviews yet</p>}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Match Score */}
                    {matchData && !isOwnProfile && (
                        <div className="card text-center">
                            <div className="match-score w-20 h-20 text-2xl mx-auto mb-3">{matchData.matchScore || 0}%</div>
                            <p className="text-gray-600">Match with you</p>
                            {matchData.breakdown?.commonInterests?.length > 0 && (
                                <p className="text-sm text-gray-500 mt-2">Common: {matchData.breakdown.commonInterests.slice(0, 3).join(', ')}</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    {!isOwnProfile && (
                        <div className="card space-y-3">
                            <Link to={`/messages/${id}`} className="btn-primary w-full flex items-center justify-center"><HiChat className="w-5 h-5 mr-2" />Send Message</Link>
                            <button onClick={() => setShowRateModal(true)} className="btn-secondary w-full flex items-center justify-center"><HiPencilAlt className="w-5 h-5 mr-2" />Write a Review</button>
                            <button onClick={() => setShowReportModal(true)} className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50 w-full flex items-center justify-center"><HiFlag className="w-5 h-5 mr-2" />Report User</button>
                        </div>
                    )}

                    {/* Travel Preferences */}
                    <div className="card">
                        <h3 className="font-semibold mb-3">Travel Info</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            {profile.groupSizePreference && <p className="flex items-center"><HiUsers className="w-4 h-4 mr-2" />Groups of {profile.groupSizePreference}</p>}
                            {profile.availabilityStart && <p className="flex items-center"><HiCalendar className="w-4 h-4 mr-2" />Available from {new Date(profile.availabilityStart).toLocaleDateString()}</p>}
                        </div>
                    </div>

                    {/* Destinations */}
                    {profile.preferredDestinations?.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold mb-3">Dream Destinations</h3>
                            <div className="flex flex-wrap gap-2">{profile.preferredDestinations.map((d, i) => <span key={i} className="badge-primary">{d}</span>)}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* modals go here */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-gray-900">Report {profile.fullName}</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1"><HiX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleReportUser} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <select 
                                    value={reportReason} 
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="spam">Spam</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="inappropriate">Inappropriate Behavior</option>
                                    <option value="fake_profile">Fake Profile</option>
                                    <option value="scam">Scam</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea 
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    className="input-field h-24"
                                    placeholder="Please provide details to help us review..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowReportModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-gray-900">Review {profile.fullName}</h3>
                            <button onClick={() => setShowRateModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1"><HiX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleRateUser} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex items-center space-x-2">
                                    {[1,2,3,4,5].map(val => (
                                        <button 
                                            key={val} 
                                            type="button" 
                                            onClick={() => setRatingValue(val)}
                                            className="focus:outline-none"
                                        >
                                            <HiStar className={`w-8 h-8 ${val <= ratingValue ? 'text-yellow-500' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Review (Optional)</label>
                                <textarea 
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className="input-field h-24"
                                    placeholder="How was your experience with this user?"
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowRateModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
