/**
 * Navbar Component
 * Main navigation header with responsive mobile menu
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI, messageAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
    HiMenu, HiX, HiHome, HiUsers, HiMap, HiChat,
    HiUser, HiBell, HiLogout, HiCog, HiGlobe, HiBookOpen,
    HiInformationCircle, HiTruck, HiCheckCircle, HiClock
} from 'react-icons/hi';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, isAuthenticated, isAdmin, isVerified, logout } = useAuth();
    const { socket } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    const verificationStatus = user?.verificationStatus;

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            fetchUnreadMessageCount();
        }

        // Listen for booking confirmation events to update badge
        const handleBookingConfirmed = () => {
            fetchUnreadCount();
        };
        window.addEventListener('bookingConfirmed', handleBookingConfirmed);

        return () => {
            window.removeEventListener('bookingConfirmed', handleBookingConfirmed);
        };
    }, [isAuthenticated, location.pathname]);

    useEffect(() => {
        if (!socket || !isAuthenticated) return;

        const handleNewMessage = () => {
            fetchUnreadMessageCount();
        };
        
        const handleMessagesRead = () => {
            fetchUnreadMessageCount();
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messagesRead', handleMessagesRead);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messagesRead', handleMessagesRead);
        };
    }, [socket, isAuthenticated]);

    const fetchUnreadMessageCount = async () => {
        try {
            if (!isAuthenticated) return;
            const response = await messageAPI.getUnreadCount();
            setUnreadMessageCount(response.data.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread message count', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            if (!isAuthenticated) return;
            const response = await notificationAPI.getUnreadCount();
            setUnreadCount(response.data.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
        toast.success('Logged out successfully');
        setShowDropdown(false);
        setIsOpen(false);
    };

    const navLinks = isAuthenticated ? [
        { name: 'Dashboard', path: '/dashboard', icon: HiHome },
        { name: 'Find Buddies', path: '/find-buddies', icon: HiUsers },
        { name: 'Trips', path: '/trips', icon: HiMap },
        { name: 'Services', path: '/services', icon: HiTruck },
        { name: 'Blog', path: '/blog', icon: HiBookOpen }
    ] : [
        { name: 'Home', path: '/', icon: HiHome },
        { name: 'Find Buddies', path: '/find-buddies', icon: HiUsers },
        { name: 'Services', path: '/services', icon: HiTruck },
        { name: 'About', path: '/about', icon: HiInformationCircle },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container-custom">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
                        <img
                            src="/logo.png"
                            alt="Travel Buddy Logo"
                            className="h-12 w-auto object-contain"
                        />
                        <span className="font-bold text-xl text-gray-900">Travel Buddy</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${isActive(link.path)
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Messages Icon */}
                                <Link
                                    to="/messages"
                                    className="p-2 text-gray-600 hover:text-primary-600 relative me-1"
                                    title="Messages"
                                >
                                    <HiChat className="w-6 h-6" />
                                    {unreadMessageCount > 0 && (
                                        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-white">
                                            {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Notifications */}
                                <Link to="/notifications" className="p-2 text-gray-600 hover:text-primary-600 relative">
                                    <HiBell className="w-6 h-6" />
                                    {/* Notification badge */}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <img
                                            src={user?.profile?.profilePicture ? `${user.profile.profilePicture}?t=${Date.now()}` : '/default-avatar.svg'}
                                            alt={user?.profile?.fullName}
                                            className="w-8 h-8 rounded-full object-cover bg-gray-200"
                                            onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                                        />
                                        <span className="text-gray-700 font-medium flex items-center gap-1.5">
                                            {user?.profile?.fullName?.split(' ')[0] || 'User'}
                                            {verificationStatus === 'approved' && (
                                                <HiCheckCircle className="w-4 h-4 text-green-500" title="Verified" />
                                            )}
                                            {verificationStatus === 'pending_review' && (
                                                <HiClock className="w-4 h-4 text-yellow-500" title="Verification Pending" />
                                            )}
                                        </span>
                                    </button>

                                    {/* Dropdown menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            >
                                                <HiUser className="w-5 h-5" />
                                                <span>My Profile</span>
                                            </Link>
                                            <Link
                                                to="/my-activity"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            >
                                                <HiMap className="w-5 h-5" />
                                                <span>My Bookings & Trips</span>
                                            </Link>
                                            <Link
                                                to="/profile/edit"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            >
                                                <HiCog className="w-5 h-5" />
                                                <span>Settings</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setShowDropdown(false)}
                                                    className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-gray-50"
                                                >
                                                    <HiCog className="w-5 h-5" />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            )}
                                            <hr className="my-2" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                                            >
                                                <HiLogout className="w-5 h-5" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn-ghost">
                                    Log In
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    >
                        {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
                        <div className="space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${isActive(link.path)
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span>{link.name}</span>
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <>
                                    <hr className="my-2" />
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        <HiUser className="w-5 h-5" />
                                        <span>My Profile</span>
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center space-x-2 px-4 py-3 text-primary-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            <HiCog className="w-5 h-5" />
                                            <span>Admin Panel</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                                    >
                                        <HiLogout className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <hr className="my-2" />
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-center text-primary-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;
