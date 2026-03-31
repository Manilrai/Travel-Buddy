/**
 * Chat Page - Redirects to Messages Page
 */
import { Navigate } from 'react-router-dom';

const ChatPage = () => {
    return <Navigate to="/messages" replace />;
};

export default ChatPage;
