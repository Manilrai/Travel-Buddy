/**
 * Footer Component
 * Site footer with links and copyright
 */

import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                                <img src="/logo.png" alt="Travel Buddy Logo" className="h-8 w-auto object-contain" />
                            </div>
                            <span className="font-bold text-xl text-white">Travel Buddy</span>
                        </Link>
                        <p className="text-gray-400 mb-4">
                            Find your perfect travel companion. Connect with like-minded travelers and create unforgettable adventures together.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <FaFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <FaInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <FaLinkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/trips" className="text-gray-400 hover:text-primary-400 transition-colors">Browse Trips</Link></li>
                            <li><Link to="/matches" className="text-gray-400 hover:text-primary-400 transition-colors">Find Buddies</Link></li>
                            <li><Link to="/trips/create" className="text-gray-400 hover:text-primary-400 transition-colors">Create a Trip</Link></li>
                            <li><Link to="/profile" className="text-gray-400 hover:text-primary-400 transition-colors">My Profile</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">About & Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-3">
                                <HiMail className="w-5 h-5 text-primary-400" />
                                <span className="text-gray-400">ksnsay64@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <HiPhone className="w-5 h-5 text-primary-400" />
                                <span className="text-gray-400">(+977) 9807314103</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <HiLocationMarker className="w-5 h-5 text-primary-400 mt-0.5" />
                                <span className="text-gray-400">Dharan-18<br />Sunsari,Nepal</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex justify-center items-center text-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} Travel Buddy. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
