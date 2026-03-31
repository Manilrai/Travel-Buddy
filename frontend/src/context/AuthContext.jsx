/**
 * Auth Context
 * Manages authentication state across the application.
 * Supports "Remember Me" via localStorage (persistent) vs sessionStorage (session-only).
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * Helper: get the active storage (localStorage if "remember me" was used, else sessionStorage).
 * We store a flag in localStorage to know which storage holds the session.
 */
const getStorage = () => {
    if (localStorage.getItem('rememberMe') === 'true') {
        return localStorage;
    }
    return sessionStorage;
};

/**
 * Helper: read token / user from whichever storage has it.
 */
const readToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

const readUser = () =>
    localStorage.getItem('user') || sessionStorage.getItem('user');

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Clear auth state from both storages
    const clearAuthState = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Check for existing session on mount
    useEffect(() => {
        const token = readToken();
        const storedUser = readUser();

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                // Verify token is still valid
                fetchCurrentUser();
            } catch (error) {
                clearAuthState();
            }
        }
        setLoading(false);
    }, []);

    // Fetch current user data
    const fetchCurrentUser = async () => {
        try {
            const response = await authAPI.getMe();
            const userData = response.data.data;
            const storage = getStorage();

            setUser(userData);
            storage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            logout();
        }
    };

    // Register new user (always uses localStorage for new registrations)
    const register = async (email, password, fullName) => {
        const response = await authAPI.register({ email, password, fullName });
        const { user: userData, token } = response.data.data;

        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role || 'user');
        setUser(userData);
        setIsAuthenticated(true);

        return response.data;
    };

    // Login user with optional "Remember Me"
    const login = async (email, password, rememberMe = false) => {
        const response = await authAPI.login({ email, password });
        const { user: userData, token } = response.data.data;

        // Clear any previous session data from both storages
        clearAuthState();

        // Choose storage based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        localStorage.setItem('rememberMe', String(rememberMe));
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(userData));
        storage.setItem('role', userData.role || 'user');

        setUser(userData);
        setIsAuthenticated(true);

        return response.data;
    };

    // Logout user
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        clearAuthState();
    };

    // Update user data
    const updateUser = (userData) => {
        const storage = getStorage();
        setUser(prev => ({ ...prev, ...userData }));
        storage.setItem('user', JSON.stringify({ ...user, ...userData }));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        isVerified: user?.verificationStatus === 'approved',
        register,
        login,
        logout,
        updateUser,
        fetchCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
