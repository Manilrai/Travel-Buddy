/**
 * Mock API Layer
 * Simulates backend endpoints for features not yet implemented on the real server.
 * Uses localStorage to persist data across page reloads.
 */

import api from './api';

// ==========================================
// Verification (KYC) API
// ==========================================
export const verificationMockAPI = {
    submitVerification: async (userId, data) => {
        // Send actual payload to real backend POST
        return await api.post('/verification/submit', data);
    },

    getMyVerification: async (userId) => {
        // userId argument is ignored by the backend which reads the token
        return await api.get('/verification/me');
    },

    getPendingVerifications: async () => {
        // Fetch pending list for admin
        return await api.get('/verification/admin?status=pending_review');
    },

    approveVerification: async (requestId, userId) => {
        return await api.post(`/verification/admin/${requestId}/approve`);
    },

    rejectVerification: async (requestId, userId, reason) => {
        return await api.post(`/verification/admin/${requestId}/reject`, { reason });
    }
};

// ==========================================
// Trek Posts Mock API
// ==========================================
export const trekMockAPI = {
    getAllTreks: async (params = {}) => {
        return await api.get('/treks', { params });
    },

    getTrekById: async (id) => {
        return await api.get(`/treks/${id}`);
    },

    createTrek: async (trekData) => {
        return await api.post('/treks', trekData);
    }
};

// ==========================================
// Chat Mock API
// ==========================================
export const chatMockAPI = {
    getUserChats: async (userId) => {
        return await api.get('/messages/inbox');
    },
    
    getChatMessages: async (chatId) => {
        // ChatId is actually a conversation between two users
        // Since we mapped the frontend generic "chatId" concept, we'll use the conversation endpoint
        // NOTE: If frontend passes the actual other user's ID as `chatId`, this works seamlessly
        return await api.get(`/messages/conversation/${chatId}`);
    },

    sendMessage: async (chatId, senderId, text) => {
        // 'chatId' maps to receiverId in the 1-on-1 backend logic
        return await api.post('/messages', {
            receiverId: chatId,
            content: text
        });
    },

    createChat: async (participantIds) => {
        // For direct chats, the backend just expects messages to build the inbox.
        // We can mock the "create" return just by yielding an empty chat structure 
        // to conform with the frontend expecting `{ id: targetUserId }`
        const targetId = participantIds[1]; // Assuming index 1 is the poster
        return { 
            data: { 
                success: true, 
                chat: { 
                    id: targetId, 
                    participants: participantIds 
                } 
            } 
        };
    }
};
