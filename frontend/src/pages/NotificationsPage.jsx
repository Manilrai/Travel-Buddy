/**
 * Notifications Page
 * Displays user notifications and handles read/unread status
 */

import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { HiBell, HiCheckCircle, HiTrash, HiInformationCircle, HiChat, HiUserAdd } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getNotifications();
            setNotifications(response.data.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'message': return <HiChat className="w-6 h-6 text-blue-500" />;
            case 'match': return <HiUserAdd className="w-6 h-6 text-green-500" />;
            case 'trip': return <HiCheckCircle className="w-6 h-6 text-primary-500" />;
            case 'system':
            default: return <HiInformationCircle className="w-6 h-6 text-gray-500" />;
        }
    };

    const getLinkForType = (type, referenceId) => {
        switch (type) {
            case 'message': return `/messages/conversation/${referenceId}`;
            case 'match': return `/profile/${referenceId}`;
            case 'trip': return `/trips/${referenceId}`;
            default: return '#';
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold flex items-center text-gray-900 border-b-4 border-primary-200 pb-1">
                    <HiBell className="w-8 h-8 mr-3 text-primary-600" />
                    Notifications
                </h1>
                
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="btn-secondary flex items-center shadow-sm"
                    >
                        <HiCheckCircle className="w-5 h-5 mr-2" />
                        Mark All as Read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 bg-gray-50">
                        <HiBell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-700">No Notifications</h3>
                        <p className="mt-2 text-sm">You are all caught up! There are no new alerts right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`p-4 sm:p-6 transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                                    !notification.isRead ? 'bg-primary-50/30' : 'bg-white'
                                }`}
                                onClick={() => {
                                    if (!notification.isRead) handleMarkAsRead(notification.id);
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm">
                                        {getIconForType(notification.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-base font-medium truncate pr-4 ${!notification.isRead ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>
                                        
                                        <div className="mt-3 flex gap-4">
                                            {notification.referenceId && (
                                                <Link 
                                                    to={getLinkForType(notification.type, notification.referenceId)}
                                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                                >
                                                    View Details
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 self-center">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notification.id);
                                            }}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Notification"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
