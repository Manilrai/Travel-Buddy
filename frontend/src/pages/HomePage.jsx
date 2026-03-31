

import { Link } from 'react-router-dom';
import {
  HiUsers,
  HiMap,
  HiChat,
  HiShieldCheck,
  HiStar,
  HiGlobe
} from 'react-icons/hi';

const HomePage = () => {
  const features = [
    {
      icon: HiUsers,
      title: 'Smart Matching',
      description:
        'Our algorithm finds travel companions based on shared interests, destinations, and travel style.'
    },
    {
      icon: HiMap,
      title: 'Plan Together',
      description:
        'Create and join group trips. Coordinate destinations, dates, and budgets with your travel buddies.'
    },
    {
      icon: HiChat,
      title: 'Connect Securely',
      description:
        'Chat with potential travel partners through our secure in-app messaging system.'
    },
    {
      icon: HiShieldCheck,
      title: 'Verified Profiles',
      description:
        'User verification and rating system ensures you connect with trustworthy travelers.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Travelers' },
    { value: '5K+', label: 'Trips Created' },
    { value: '50+', label: 'Countries' },
    { value: '4.8', label: 'User Rating' }
  ];

  const recommendedTours = [
    {
      id: 1,
      image: '/images/himalayas/everestbasecamp.avif',
      title: 'Everest Base Camp Trek',
      duration: '14 Days',
      price: '$1500',
      description: 'Trek to the base of the world\'s highest peak.'
    },
    {
      id: 2,
      image: '/images/himalayas/Annapurna.jpg',
      title: 'Annapurna Circuit Trek',
      duration: '18 Days',
      price: '$1800',
      description: 'Experience diverse landscapes and cultures in the Annapurna region.'
    },
    {
      id: 3,
      image: '/images/himalayas/Langtang-Valley-Trek-1.jpg',
      title: 'Langtang Valley Trek',
      duration: '10 Days',
      price: '$1000',
      description: 'A shorter trek with stunning views and Tamang culture.'
    },
    {
      id: 4,
      image: '/images/himalayas/uppermustang.jpg',
      title: 'Upper Mustang Trek',
      duration: '12 Days',
      price: '$2200',
      description: 'Explore the ancient forbidden kingdom of Mustang.'
    },
    {
      id: 5,
      image: '/images/himalayas/tour-5.jpg',
      title: 'Gokyo Lakes Trek',
      duration: '12 Days',
      price: '$1600',
      description: 'Discover pristine turquoise lakes and panoramic mountain views.'
    }
  ];

  return (
    <div
      className="min-h-screen bg-fixed bg-center bg-cover relative"
      style={{ backgroundImage: "url('/images/himalayas/hero.jpg')" }}
    >
      {/* Global dark overlay to ensure readability */}
      <div className="absolute inset-0 bg-gray-900/40 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10 min-h-[85vh] flex items-center">
        {/* background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>

        <div className="container-custom relative z-10 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Find Your Perfect
                <span className="block text-primary-200">
                  Travel Companion
                </span>
              </h1>

              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with like-minded travelers, plan amazing adventures
                together, and make memories that last a lifetime.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  Get Started Free
                </Link>

                <Link
                  to="/trips"
                  className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  Browse Trips
                </Link>
              </div>
            </div>

            {/* Hero Cards */}
            <div className="hidden lg:block relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary-400/30 rounded-full blur-3xl"></div>

              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <HiGlobe className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-semibold text-gray-800">
                        Match Found!
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sarah also wants to visit Bali in March
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-lg mt-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <HiStar className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-gray-800">
                        92% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on interests & travel style
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-lg col-span-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://ui-avatars.com/api/?name=John&background=3b82f6&color=fff"
                        alt="John"
                        className="w-12 h-12 rounded-full"
                      />
                      <img
                        src="https://ui-avatars.com/api/?name=Sarah&background=10b981&color=fff"
                        alt="Sarah"
                        className="w-12 h-12 rounded-full -ml-4"
                      />
                      <img
                        src="https://ui-avatars.com/api/?name=Mike&background=8b5cf6&color=fff"
                        alt="Mike"
                        className="w-12 h-12 rounded-full -ml-4"
                      />
                      <span className="text-gray-600">
                        +5 more in this trip
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end hero cards */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/70 backdrop-blur-md border-b border-white/20 relative z-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Travel Buddy?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to find compatible travel partners and plan
              unforgettable trips together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center group bg-white/80 backdrop-blur-md hover:bg-white/95 border border-white/50 hover:border-primary-200 transition-all shadow-xl"
              >
                <div className="w-16 h-16 bg-primary-100/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/60 backdrop-blur-md border-y border-white/20 relative z-10">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start your adventure in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                desc: 'Tell us about yourself, your interests, and travel preferences'
              },
              {
                step: '2',
                title: 'Find Your Match',
                desc: 'Browse potential travel buddies or let our algorithm suggest matches'
              },
              {
                step: '3',
                title: 'Plan & Travel',
                desc: 'Connect, plan your trip together, and embark on your adventure'
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-800 font-medium">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Tours */}
      <section className="py-20 relative z-10">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
              Recommended Tours
            </h2>
            <p className="text-lg text-white/90 drop-shadow-md max-w-2xl mx-auto">
              Swipe through our hand-picked selection of breath-taking trips across Nepal.
            </p>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory pt-4 px-4 -mx-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              <div key={index} className="min-w-[300px] md:min-w-[350px] snap-center card hover:shadow-2xl transition-all duration-300 group p-0 overflow-hidden bg-white/80 backdrop-blur-md border border-white/40">
                <div className="h-56 overflow-hidden relative">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-sm">
                    {tour.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{tour.title}</h3>
                  <div className="flex items-center justify-between text-gray-700 font-medium mb-4">
                    <span className="flex items-center">
                      <HiMap className="w-4 h-4 mr-1 text-primary-500" />
                      <span className="text-sm">{tour.location}</span>
                    </span>
                    <span className="text-sm">{tour.days}</span>
                  </div>
                  <Link to="/register" className="btn-secondary w-full flex items-center justify-center bg-primary-50/50 hover:bg-primary-100 border border-primary-200">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-800/90 to-primary-900/90 backdrop-blur-sm relative z-10 border-t border-white/10">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Travel Buddy?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
            Join thousands of travelers who have already found their perfect
            travel companions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-lg inline-block"
            >
              Start Your Adventure
            </Link>
            <Link
              to="/about"
              className="btn border-2 border-white text-white hover:bg-white/10 px-10 py-4 text-lg inline-block"
            >
              About &amp; Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
