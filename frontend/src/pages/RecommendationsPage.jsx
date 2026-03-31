import { Link } from 'react-router-dom';
import { HiMap } from 'react-icons/hi';

const RecommendationsPage = () => {
    return (
        <div className="container-custom py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Recommended Tours</h1>
                <p className="text-gray-600">Discover our hand-picked selection of breath-taking trips across Nepal.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {
                        title: 'Himalayan Adventure Trek',
                        location: 'Mount Everest Base Camp',
                        days: '14 Days',
                        price: 'Rs. 45,000',
                        image: '/images/recommend/himalyas.jpg'
                    },
                    {
                        title: 'Kathmandu Cultural Tour',
                        location: 'Kathmandu Valley',
                        days: '5 Days',
                        price: 'Rs. 15,000',
                        image: '/images/recommend/culture.jpg'
                    },
                    {
                        title: 'Pokhara Lakeside Retreat',
                        location: 'Phewa Lake, Pokhara',
                        days: '7 Days',
                        price: 'Rs. 25,000',
                        image: '/images/recommend/ppokhara.jpg'
                    },
                    {
                        title: 'Chitwan Jungle Safari',
                        location: 'Chitwan National Park',
                        days: '3 Days',
                        price: 'Rs. 18,000',
                        image: '/images/recommend/jungle.jpg'
                    },
                    {
                        title: 'Annapurna Base Camp',
                        location: 'Annapurna Conservation',
                        days: '10 Days',
                        price: 'Rs. 35,000',
                        image: '/images/himalayas/Annapurna.jpg'
                    }
                ].map((tour, index) => (
                    <div key={index} className="card hover:shadow-lg transition-shadow group p-0 overflow-hidden">
                        <div className="h-48 overflow-hidden relative">
                            <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-sm">
                                {tour.price}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{tour.title}</h3>
                            <div className="flex items-center justify-between text-gray-600 mb-4">
                                <span className="flex items-center">
                                    <HiMap className="w-4 h-4 mr-1 text-primary-500" />
                                    <span className="text-sm">{tour.location}</span>
                                </span>
                                <span className="text-sm font-medium">{tour.days}</span>
                            </div>
                            <Link to="/trips" className="btn-secondary w-full flex items-center justify-center">
                                Explore Trips
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationsPage;
