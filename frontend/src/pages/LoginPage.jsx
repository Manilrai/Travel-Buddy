/**
 * Login Page
 * User authentication form
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect target: from location.state or localStorage fallback
    const redirectTo = location.state?.from || null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSuccess = (responseData) => {
        const role = responseData?.data?.user?.role;
        localStorage.removeItem('bookingRedirect');

        // Role-based redirect: respect redirectTo unless it's a role mismatch
        if (redirectTo) {
            const isAdminRoute = redirectTo.startsWith('/admin');
            if (role === 'admin' && !isAdminRoute) {
                // Admin was redirected from a user page — send to admin panel
                navigate('/admin', { replace: true });
            } else if (role !== 'admin' && isAdminRoute) {
                // User was redirected from an admin page — send to dashboard
                navigate('/dashboard', { replace: true });
            } else {
                navigate(redirectTo, { replace: true });
            }
        } else {
            navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const responseData = await login(formData.email, formData.password, false);
            toast.success('Welcome back!');
            handleLoginSuccess(responseData);
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (email, password) => {
        setLoading(true);
        try {
            const responseData = await login(email, password);
            toast.success('Welcome back!');
            handleLoginSuccess(responseData);
        } catch (error) {
            const message = error.response?.data?.message || 'Demo login failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 bg-fixed bg-center bg-cover relative"
            style={{ backgroundImage: "url('/images/himalayas/hero.jpg')" }}
        >
            <div className="absolute inset-0 bg-gray-900/60 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
                        <img src="/logo.png" alt="Travel Buddy Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Welcome Back</h1>
                    <p className="text-gray-300 mt-2">Sign in to continue your adventure</p>
                </div>

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiMail className="h-5 w-5 text-gray-300" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white/20 transition-colors placeholder-gray-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiLockClosed className="h-5 w-5 text-gray-300" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-4 py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white/20 transition-colors placeholder-gray-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <HiEyeOff className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                                    ) : (
                                        <HiEye className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Login Buttons */}
                    <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-sm text-gray-300 mb-3">Quick Demo Access:</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleDemoLogin('john@example.com', 'password123')}
                                className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                                id="demo-user-login"
                            >
                                🧑 Demo User
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleDemoLogin('admin@travelbuddy.com', 'admin123')}
                                className="flex-1 py-2.5 px-3 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-300 hover:bg-purple-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                                id="demo-admin-login"
                            >
                                🔑 Demo Admin
                            </button>
                        </div>
                    </div>

                    {/* Register link */}
                    <p className="text-center mt-6 text-gray-300">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
