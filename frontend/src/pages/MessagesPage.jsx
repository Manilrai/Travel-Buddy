/**
 * Messages Page - Real-time chat with inbox, DM, and group messaging
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../services/api';
import { HiPaperAirplane, HiArrowLeft, HiChat, HiUserGroup, HiSearch, HiX, HiPlus, HiReply, HiCheck } from 'react-icons/hi';

const MessagesPage = () => {
    const { userId, tripId } = useParams();
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [groups, setGroups] = useState([]);
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [tripInfo, setTripInfo] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('direct');
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const messagesEndRef = useRef(null);

    // Fetch inbox and groups on mount
    useEffect(() => {
        fetchInbox();
        fetchGroups();
    }, []);

    // Fetch conversation when params change
    useEffect(() => {
        if (userId) {
            fetchConversation(userId);
            setActiveTab('direct');
        } else if (tripId) {
            fetchTripConversation(tripId);
            setActiveTab('groups');
        } else {
            setMessages([]);
            setOtherUser(null);
            setTripInfo(null);
        }
    }, [userId, tripId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time: listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            // If viewing the relevant conversation, append the message
            if (userId && msg.messageType === 'direct') {
                const isRelevant =
                    (msg.senderId === parseInt(userId) && msg.receiverId === user.id) ||
                    (msg.senderId === user.id && msg.receiverId === parseInt(userId));
                if (isRelevant) {
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            } else if (tripId && msg.messageType === 'group' && msg.tripId === parseInt(tripId)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
            // Refresh inbox regardless
            fetchInbox();
        };

        const handleMessagesRead = (data) => {
            if (userId && data.readerId === parseInt(userId)) {
                setMessages(prev => prev.map(m => 
                    m.senderId === user.id ? { ...m, isRead: true } : m
                ));
            }
            fetchInbox();
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messagesRead', handleMessagesRead);
        
        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messagesRead', handleMessagesRead);
        };
    }, [socket, userId, tripId, user]);

    // Join trip room for group chat
    useEffect(() => {
        if (!socket || !tripId) return;
        socket.emit('joinRoom', tripId);
        return () => socket.emit('leaveRoom', tripId);
    }, [socket, tripId]);

    // Join all group rooms so we get notifications
    useEffect(() => {
        if (!socket || groups.length === 0) return;
        groups.forEach(g => socket.emit('joinRoom', g.tripId));
        return () => groups.forEach(g => socket.emit('leaveRoom', g.tripId));
    }, [socket, groups]);

    const fetchInbox = async () => {
        try {
            const response = await messageAPI.getInbox();
            setConversations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching inbox:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await messageAPI.getGroups();
            setGroups(response.data.data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchConversation = async (id) => {
        try {
            const response = await messageAPI.getConversation(id);
            const data = response.data.data;
            setMessages(data.messages || []);
            setOtherUser(data.otherUser);
            setTripInfo(null);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const fetchTripConversation = async (id) => {
        try {
            const response = await messageAPI.getTripMessages(id);
            const data = response.data.data;
            setMessages(data.messages || []);
            setTripInfo(data.trip);
            setOtherUser(null);
        } catch (error) {
            console.error('Error fetching trip messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!userId && !tripId) return;

        try {
            const payload = { content: newMessage };
            if (replyingTo) {
                payload.replyToId = replyingTo.id;
            }

            if (tripId) {
                await messageAPI.sendMessage({ ...payload, tripId: parseInt(tripId) });
                fetchTripConversation(tripId);
            } else {
                await messageAPI.sendMessage({ ...payload, receiverId: parseInt(userId) });
                fetchConversation(userId);
            }
            setNewMessage('');
            setReplyingTo(null);
            fetchInbox();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Search users for new conversation
    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const response = await messageAPI.searchUsers(query);
            setSearchResults(response.data.data || []);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    const startConversation = (targetUserId) => {
        setShowNewChat(false);
        setSearchQuery('');
        setSearchResults([]);
        navigate(`/messages/${targetUserId}`);
    };

    const isActive = userId || tripId;

    return (
        <div className="container-custom py-4">
            <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
                {/* Sidebar */}
                <div className={`card overflow-hidden flex flex-col ${isActive ? 'hidden md:flex' : 'flex'}`}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-gray-900 text-lg">Messages</h2>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                title="New Message"
                            >
                                <HiPlus className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Tabs */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('direct')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'direct'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <HiChat className="w-4 h-4 inline mr-1" />
                                Direct
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'groups'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <HiUserGroup className="w-4 h-4 inline mr-1" />
                                Groups
                            </button>
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="overflow-y-auto flex-1">
                        {activeTab === 'direct' ? (
                            conversations.length > 0 ? (
                                conversations.map((conv) => (
                                    <Link
                                        key={conv.userId}
                                        to={`/messages/${conv.userId}`}
                                        className={`flex items-center space-x-3 p-4 hover:bg-gray-50 border-b transition-colors ${
                                            userId == conv.userId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                                        }`}
                                    >
                                        <img
                                            src={conv.user?.profile?.profilePicture || '/default-avatar.svg'}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {conv.user?.profile?.fullName || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {conv.lastMessage?.content || 'No messages yet'}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <HiChat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No conversations yet</p>
                                    <p className="text-sm mt-1">Start chatting with someone!</p>
                                    <button
                                        onClick={() => setShowNewChat(true)}
                                        className="btn-primary mt-4 text-sm"
                                    >
                                        <HiPlus className="w-4 h-4 inline mr-1" />
                                        New Message
                                    </button>
                                </div>
                            )
                        ) : (
                            groups.length > 0 ? (
                                groups.map((group) => (
                                    <Link
                                        key={group.tripId}
                                        to={`/messages/trip/${group.tripId}`}
                                        className={`flex items-center space-x-3 p-4 hover:bg-gray-50 border-b transition-colors ${
                                            tripId == group.tripId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {group.title?.charAt(0) || 'G'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{group.title}</p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {group.lastMessage?.content || 'No messages yet'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                            {group.memberCount} members
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <HiUserGroup className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No group chats</p>
                                    <p className="text-sm mt-1">Join a trip to get a group chat!</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-2 card flex flex-col overflow-hidden">
                    {(userId && otherUser) || (tripId && tripInfo) ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center space-x-3 p-4 border-b bg-white">
                                <Link to="/messages" className="md:hidden text-gray-500 hover:text-gray-700">
                                    <HiArrowLeft className="w-5 h-5" />
                                </Link>
                                {tripId ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                                            {tripInfo?.title?.charAt(0) || 'T'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{tripInfo?.title || 'Trip Group Chat'}</p>
                                            <Link to={`/trips/${tripId}`} className="text-sm text-primary-600 hover:underline">
                                                View trip details
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={otherUser?.profile?.profilePicture || '/default-avatar.svg'}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{otherUser?.profile?.fullName}</p>
                                            <Link to={`/users/${otherUser?.id}`} className="text-sm text-primary-600 hover:underline">
                                                View profile
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 py-12">
                                        <HiChat className="w-10 h-10 mx-auto mb-2" />
                                        <p>No messages yet. Say hello! 👋</p>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex relative group ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex items-center gap-2 max-w-[70%] ${msg.senderId === user.id ? 'flex-row-reverse' : ''}`}>
                                            <button 
                                                onClick={() => setReplyingTo(msg)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-primary-600 transition-opacity bg-white rounded-full shadow-sm border border-gray-100"
                                                title="Reply"
                                            >
                                                <HiReply className="w-4 h-4" />
                                            </button>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                                                    msg.senderId === user.id
                                                        ? 'bg-primary-600 text-white rounded-br-md'
                                                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                                                }`}
                                            >
                                                {msg.replyTo && (
                                                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${msg.senderId === user.id ? 'bg-primary-700/50 border-white text-primary-100' : 'bg-gray-50 border-primary-500 text-gray-600'}`}>
                                                        <span className="font-semibold block">{msg.replyTo.sender?.profile?.fullName || 'User'}</span>
                                                        <p className="truncate line-clamp-2 mt-0.5 whitespace-normal break-words">{msg.replyTo.content}</p>
                                                    </div>
                                                )}
                                                {tripId && msg.senderId !== user.id && (
                                                    <p className="text-xs font-semibold text-primary-600 mb-1">
                                                        {msg.sender?.profile?.fullName}
                                                    </p>
                                                )}
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                <div
                                                    className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                                                        msg.senderId === user.id ? 'text-primary-200' : 'text-gray-400'
                                                    }`}
                                                >
                                                    <span>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {msg.senderId === user.id && (
                                                        <span className="flex">
                                                            <HiCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-white' : 'opacity-70'}`} />
                                                            {msg.isRead && <HiCheck className="w-3.5 h-3.5 -ml-2 text-white" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="flex flex-col bg-white border-t rounded-br-xl">
                                {replyingTo && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b relative">
                                        <div className="flex flex-col text-sm text-gray-600 border-l-4 border-primary-600 pl-3">
                                            <span className="font-semibold text-primary-700">Replying to {replyingTo.sender?.profile?.fullName || 'User'}</span>
                                            <span className="truncate max-w-md">{replyingTo.content}</span>
                                        </div>
                                        <button 
                                            onClick={() => setReplyingTo(null)}
                                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            <HiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleSend} className="p-4 flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="input flex-1"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="btn-primary px-4 py-2.5 disabled:opacity-50"
                                    >
                                        <HiPaperAirplane className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                            <div className="text-center">
                                <HiChat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium text-gray-600">Select a conversation</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Choose from the sidebar or start a new chat
                                </p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="btn-primary mt-4"
                                >
                                    <HiPlus className="w-4 h-4 inline mr-1" />
                                    New Message
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            {showNewChat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg text-gray-900">New Message</h3>
                            <button
                                onClick={() => {
                                    setShowNewChat(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search users by name..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="input pl-10 w-full"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 px-2 pb-4">
                            {searching ? (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="mt-2 text-sm">Searching...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => startConversation(u.id)}
                                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg w-full text-left transition-colors"
                                    >
                                        <img
                                            src={u.profile?.profilePicture || '/default-avatar.svg'}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {u.profile?.fullName || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-500">{u.email}</p>
                                        </div>
                                    </button>
                                ))
                            ) : searchQuery.length >= 2 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p>No users found</p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <HiSearch className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-sm">Type at least 2 characters to search</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
