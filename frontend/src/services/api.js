/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - adds auth token to all requests
api.interceptors.request.use(
    (config) => {
        // Check both storages to support Remember Me feature
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stored credentials from both storages
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('role');
        }
        return Promise.reject(error);
    }
);

// ==========================================
// Auth API
// ==========================================
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/password', data),
    logout: () => api.post('/auth/logout')
};

// ==========================================
// User API
// ==========================================
export const userAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUser: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
    uploadProfilePicture: (formData) => api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateInterests: (interestIds) => api.put('/users/interests', { interestIds }),
    getAllInterests: () => api.get('/users/interests/all'),
    getUserRatings: (id) => api.get(`/users/${id}/ratings`),
    blockUser: (id) => api.post(`/users/${id}/block`),
    rateUser: (id, data) => api.post(`/users/${id}/rate`, data),
    reportUser: (id, data) => api.post(`/users/${id}/report`, data)
};

// ==========================================
// Trip API
// ==========================================
export const tripAPI = {
    getTrips: (params) => api.get('/trips', { params }),
    getTrip: (id) => api.get(`/trips/${id}`),
    createTrip: (data) => api.post('/trips', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateTrip: (id, data) => api.put(`/trips/${id}`, data),
    deleteTrip: (id) => api.delete(`/trips/${id}`),
    joinTrip: (id) => api.post(`/trips/${id}/join`),
    leaveTrip: (id) => api.post(`/trips/${id}/leave`),
    getMyTrips: () => api.get('/trips/my'),
    removeMember: (tripId, userId) => api.delete(`/trips/${tripId}/members/${userId}`)
};

// ==========================================
// Match API
// ==========================================
export const matchAPI = {
    getMatches: (params) => api.get('/matches', { params }),
    getMatchWithUser: (userId) => api.get(`/matches/${userId}`),
    getSuggestions: () => api.get('/matches/suggestions')
};

// ==========================================
// Booking API
// ==========================================
export const bookingAPI = {
    createBooking: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings/me'),
    cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
    uploadPaymentReceipt: (id, formData) => api.post(`/bookings/${id}/pay`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

// ==========================================
// Message API
// ==========================================
export const messageAPI = {
    sendMessage: (data) => api.post('/messages', data),
    getConversation: (userId, params) => api.get(`/messages/conversation/${userId}`, { params }),
    getTripMessages: (tripId, params) => api.get(`/messages/trip/${tripId}`, { params }),
    getInbox: () => api.get('/messages/inbox'),
    getGroups: () => api.get('/messages/groups'),
    searchUsers: (q) => api.get('/messages/search-users', { params: { q } }),
    deleteMessage: (id) => api.delete(`/messages/${id}`),
    getUnreadCount: () => api.get('/messages/unread/count')
};

// ==========================================
// Notification API
// ==========================================
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getUnreadCount: () => api.get('/notifications/unread/count'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// ==========================================
// Report API
// ==========================================
export const reportAPI = {
    createReport: (data) => api.post('/reports', data),
    getMyReports: () => api.get('/reports/my')
};

// ==========================================
// Rating API
// ==========================================
export const ratingAPI = {
    rateUser: (data) => api.post('/ratings', data),
    getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
    getMyRatings: () => api.get('/ratings/my')
};

// ==========================================
// Service API
// ==========================================
export const serviceAPI = {
    getAll: (type) => api.get('/services', { params: type ? { type } : {} }),
    getById: (id) => api.get(`/services/${id}`),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    remove: (id) => api.delete(`/services/${id}`)
};

// ==========================================
// Admin API
// ==========================================
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getReports: (params) => api.get('/admin/reports', { params }),
    resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data),
    getAllTrips: (params) => api.get('/admin/trips', { params }),
    getAllBookings: (params) => api.get('/admin/bookings', { params }),
    updateBookingPaymentStatus: (id, data) => api.put(`/admin/bookings/${id}/payment`, data)
};

// ==========================================
// Contact API
// ==========================================
export const contactAPI = {
    submitContact: (data) => api.post('/contacts', data),
    getContacts: () => api.get('/contacts'),
    updateContactStatus: (id, status) => api.put(`/contacts/${id}/status`, { status }),
    deleteContact: (id) => api.delete(`/contacts/${id}`)
};

export default api;
