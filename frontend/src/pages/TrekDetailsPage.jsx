import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { trekMockAPI } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';
import { 
    HiLocationMarker, HiClock, HiCurrencyRupee, HiUserGroup, 
    HiOutlineChevronLeft, HiChat, HiCheckCircle, HiXCircle, HiInformationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const TrekDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isVerified, user } = useAuth();
    
    const [trek, setTrek] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchTrek = async () => {
            try {
                const res = await trekMockAPI.getTrekById(id);
                const trekData = res.data?.data || res.data?.trek;
                if (trekData) {
                    setTrek(trekData);
                } else {
                    toast.error('Trek not found');
                    navigate('/find-buddies');
                }
            } catch (error) {
                toast.error('Failed to load trek details');
            } finally {
                setLoading(false);
            }
        };
        fetchTrek();
    }, [id, navigate]);

    const handleChatClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/treks/${id}` } });
            return;
        }
        if (!isVerified) {
            navigate('/verify', { state: { from: `/treks/${id}` } });
            return;
        }
        
        // If verified, navigate to chat creation/view
        navigate('/chat', { state: { recipientId: trek.userId, prefilledMsg: `Hi ${trek.posterName}, I'm interested in your trek: ${trek.title}` } });
    };

    if (loading) {
        return (
            <div className="container-custom py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!trek) return null;

    const isOwner = user && (user.id === trek.userId || user._id === trek.userId);

    // Mock data for tabs if missing
    const defaultItinerary = trek.itinerary || [
        { day: 1, title: 'Arrival & Briefing', description: 'Meet at the starting point and brief about the trek.' },
        { day: 2, title: 'Start Trekking', description: 'Begin the ascent through the forest trails.' }
    ];
    
    const defaultInclusions = trek.inclusions || ['Guide', 'Permits', 'Accommodation'];
    const defaultExclusions = trek.exclusions || ['Flights', 'Personal Insurance', 'Extra Meals'];
    const defaultRequirements = trek.requirements || ['Good fitness level', 'Trekking boots', 'Warm layers'];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] w-full">
                <img 
                    src={trek.images[0] || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa'} 
                    alt={trek.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                    <button onClick={() => navigate(-1)} className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                        <HiOutlineChevronLeft className="w-5 h-5 mr-1" /> Back
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container-custom">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full mb-4 inline-block shadow-sm">
                        {trek.difficulty}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 line-clamp-2 leading-tight">
                        {trek.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm md:text-base font-medium">
                        <span className="flex items-center"><HiLocationMarker className="w-5 h-5 mr-1" />{trek.region}</span>
                        <span className="flex items-center"><HiClock className="w-5 h-5 mr-1" />{trek.duration}</span>
                        <span className="flex items-center"><HiUserGroup className="w-5 h-5 mr-1" />{trek.groupSize.min}-{trek.groupSize.max} People</span>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column - Main Details */}
                    <div className="lg:w-2/3">
                        {/* Tabs Navigation */}
                        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-8 pb-1">
                            {['overview', 'itinerary', 'included', 'requirements'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                        activeTab === tab 
                                            ? 'border-primary-600 text-primary-600' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 animate-fade-in border border-gray-100">
                            
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900">About this Trek</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Join this amazing adventure in the {trek.region} region. We are looking for like-minded trekkers to share the journey.
                                    </p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Max Altitude</p>
                                            <p className="font-semibold text-gray-900">{trek.maxAltitude}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Diffculty</p>
                                            <p className="font-semibold text-gray-900">{trek.difficulty}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Duration</p>
                                            <p className="font-semibold text-gray-900">{trek.duration}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Budget</p>
                                            <p className="font-semibold text-gray-900 border-b border-primary-200 inline-block border-dashed">
                                                NPR {trek.budgetRange.min.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'itinerary' && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-bold text-gray-900"> प्रस्तावित Itinerary</h3>
                                    <div className="relative border-l-2 border-primary-100 ml-3 md:ml-4 space-y-8 pb-4">
                                        {defaultItinerary.map((day, idx) => (
                                            <div key={idx} className="relative pl-6 md:pl-8">
                                                <div className="absolute w-6 h-6 bg-primary-100 rounded-full -left-[13px] flex items-center justify-center border-4 border-white">
                                                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-lg mb-2">Day {day.day}: {day.title}</h4>
                                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{day.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'included' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">What's Included & Excluded</h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                            <h4 className="font-bold text-green-800 mb-4 flex items-center"><HiCheckCircle className="w-5 h-5 mr-2" /> Included</h4>
                                            <ul className="space-y-3">
                                                {defaultInclusions.map((item, idx) => (
                                                    <li key={idx} className="flex items-start text-green-700 text-sm">
                                                        <span className="text-green-500 mr-2">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                            <h4 className="font-bold text-red-800 mb-4 flex items-center"><HiXCircle className="w-5 h-5 mr-2" /> Not Included</h4>
                                            <ul className="space-y-3">
                                                {defaultExclusions.map((item, idx) => (
                                                    <li key={idx} className="flex items-start text-red-700 text-sm">
                                                        <span className="text-red-500 mr-2">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'requirements' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements & Gear</h3>
                                    <ul className="space-y-4">
                                        {defaultRequirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                <HiInformationCircle className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Posted By</h3>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl uppercase shadow-inner">
                                    {trek.posterName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{trek.posterName}</h4>
                                    <p className="text-sm text-green-600 font-medium flex items-center">
                                        <HiCheckCircle className="w-4 h-4 mr-1" /> ID Verified
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-primary-50 p-4 rounded-xl mb-6">
                                <p className="text-sm text-primary-800 font-medium mb-1">Estimated Budget</p>
                                <p className="text-2xl font-bold text-primary-900">
                                    NPR {trek.budgetRange.min.toLocaleString()}
                                </p>
                                <p className="text-xs text-primary-600 mt-1">per person (approx)</p>
                            </div>

                            {isOwner ? (
                                <div className="space-y-3">
                                    <button className="btn-primary w-full disabled:opacity-50" disabled>
                                        Edit Post (Coming Soon)
                                    </button>
                                    <p className="text-xs text-center text-gray-500">This is your trek post.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button onClick={handleChatClick} className="btn-primary w-full py-3 flex items-center justify-center gap-2 shadow-md">
                                        <HiChat className="w-5 h-5" /> Chat with Poster
                                    </button>
                                    <p className="text-xs text-center text-gray-500 px-2 leading-relaxed">
                                        Only Verified users can send messages. Click to verify if you haven't already.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TrekDetailsPage;
