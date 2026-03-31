/**
 * App Component
 * Main application with routing setup
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import TripsPage from './pages/TripsPage';
import TripDetailsPage from './pages/TripDetailsPage';
import CreateTripPage from './pages/CreateTripPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import UserProfilePage from './pages/UserProfilePage';
import MyActivityPage from './pages/MyActivityPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationsAdminPage from './pages/admin/VerificationsAdminPage';
import BlogPage from './pages/BlogPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import AboutContactPage from './pages/AboutContactPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import VerificationPage from './pages/VerificationPage';
import TrekDetailsPage from './pages/TrekDetailsPage';
import PostTrekPage from './pages/PostTrekPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import RequireVerified from './components/shared/RequireVerified';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
    }

    return children;
};

// Layout wrapper
const Layout = ({ children, showFooter = true }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={
                <Layout><HomePage /></Layout>
            } />
            <Route path="/login" element={
                <PublicRoute>
                    <Layout showFooter={false}><LoginPage /></Layout>
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Layout showFooter={false}><RegisterPage /></Layout>
                </PublicRoute>
            } />
            <Route path="/about" element={
                <Layout><AboutContactPage /></Layout>
            } />
            <Route path="/services" element={
                <Layout><ServicesPage /></Layout>
            } />
            <Route path="/services/:type/:id" element={
                <Layout><ServiceDetailsPage /></Layout>
            } />
            {/* Find Buddies — public access (browse treks without login) */}
            <Route path="/find-buddies" element={<Layout><MatchesPage /></Layout>} />
            <Route path="/treks/:id" element={<Layout><TrekDetailsPage /></Layout>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <Layout><ProfilePage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
                <ProtectedRoute>
                    <Layout><EditProfilePage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/notifications" element={
                <ProtectedRoute>
                    <Layout><NotificationsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/my-activity" element={
                <ProtectedRoute>
                    <Layout><MyActivityPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/verify" element={
                <ProtectedRoute>
                    <Layout><VerificationPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/treks/create" element={
                <RequireVerified>
                    <Layout><PostTrekPage /></Layout>
                </RequireVerified>
            } />
            <Route path="/chat" element={
                <RequireVerified>
                    <Layout><ChatPage /></Layout>
                </RequireVerified>
            } />
            <Route path="/users/:id" element={
                <ProtectedRoute>
                    <Layout><UserProfilePage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/recommendations" element={<Navigate to="/services" replace />} />
            <Route path="/blog" element={
                <ProtectedRoute>
                    <Layout><BlogPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/blog/:id" element={
                <ProtectedRoute>
                    <Layout><BlogDetailsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/trips" element={
                <ProtectedRoute>
                    <Layout><TripsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/trips/create" element={
                <ProtectedRoute>
                    <Layout><CreateTripPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/trips/:id" element={
                <ProtectedRoute>
                    <Layout><TripDetailsPage /></Layout>
                </ProtectedRoute>
            } />
            {/* /matches kept as alias for backwards compatibility */}
            <Route path="/matches" element={
                <Layout><MatchesPage /></Layout>
            } />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <Layout showFooter={false}><MessagesPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/messages/:userId" element={
                <ProtectedRoute>
                    <Layout showFooter={false}><MessagesPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/messages/trip/:tripId" element={
                <ProtectedRoute>
                    <Layout showFooter={false}><MessagesPage /></Layout>
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
                <ProtectedRoute adminOnly={true}>
                    <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
                <Layout>
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-primary-600">404</h1>
                            <p className="text-xl text-gray-600 mt-4">Page not found</p>
                            <a href="/" className="btn-primary inline-block mt-6">Go Home</a>
                        </div>
                    </div>
                </Layout>
            } />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <SocketProvider>
                    <AppRoutes />
                    <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#fff',
                            color: '#374151',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                </SocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
