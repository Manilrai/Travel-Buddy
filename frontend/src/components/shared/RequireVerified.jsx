/**
 * RequireVerified Wrapper Component
 * Protects routes or actions that require a user to have a 'approved' verificationStatus.
 * 
 * If the user is not logged in -> redirects to /login
 * If the user is logged in but not verified -> redirects to /verify
 * 
 * Uses location.state.from to securely redirect users back after they complete auth/verification.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireVerified = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show nothing or a highly simplified spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // 1. Not Authenticated -> Send to Login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 2. Authenticated but Not Verified -> Send to Verify hub
    if (user?.verificationStatus !== 'approved' && user?.role !== 'admin') {
        return <Navigate to="/verify" state={{ from: location.pathname }} replace />;
    }

    // 3. Authenticated and Verified -> Render children
    return children;
};

export default RequireVerified;
