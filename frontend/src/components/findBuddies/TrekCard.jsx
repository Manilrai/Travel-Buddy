import { Link } from 'react-router-dom';
import { HiLocationMarker, HiClock, HiCurrencyRupee, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const TrekCard = ({ trek }) => {
    const { user } = useAuth();
    const isOwner = user && (user.id === trek.userId || user._id === trek.userId);

    return (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full border border-gray-100">
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={trek.images[0]} 
                    alt={trek.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800'; }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-bold rounded-full shadow-sm">
                        {trek.difficulty}
                    </span>
                </div>
                
                {isOwner && (
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                            Your Post
                        </span>
                    </div>
                )}
            </div>

            {/* Content Context */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Poster Info */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase">
                        {trek.posterName.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-500">Posted by <span className="font-semibold text-gray-700">{trek.posterName}</span></span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[56px]">{trek.title}</h3>
                
                {/* Quick Details */}
                <div className="grid grid-cols-2 gap-y-3 mb-5 mt-auto">
                    <div className="flex items-center text-sm tracking-tight text-gray-600">
                        <HiLocationMarker className="w-4 h-4 mr-1.5 text-gray-400" /> 
                        <span className="truncate">{trek.region}</span>
                    </div>
                    <div className="flex items-center text-sm tracking-tight text-gray-600">
                        <HiClock className="w-4 h-4 mr-1.5 text-gray-400" /> 
                        {trek.duration}
                    </div>
                    <div className="flex items-center text-sm tracking-tight text-gray-600">
                        <HiUserGroup className="w-4 h-4 mr-1.5 text-gray-400" /> 
                        {trek.groupSize.min}-{trek.groupSize.max} pp
                    </div>
                    <div className="flex items-center text-sm tracking-tight text-primary-600 font-semibold">
                        <HiCurrencyRupee className="w-4 h-4 mr-1" /> 
                        {trek.budgetRange.min.toLocaleString()}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        Posted {new Date(trek.createdAt).toLocaleDateString()}
                    </span>
                    <Link 
                        to={`/treks/${trek.id}`} 
                        className="px-4 py-2 bg-gray-50 text-primary-600 text-sm font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrekCard;
