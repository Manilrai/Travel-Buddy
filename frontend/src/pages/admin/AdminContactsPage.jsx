import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contactAPI } from '../../services/api';
import { HiMail, HiCheck, HiTrash, HiDotsVertical } from 'react-icons/hi';

const AdminContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await contactAPI.getContacts();
            setContacts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contact messages');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const statuses = ['unread', 'read', 'resolved'];
        const currentIndex = statuses.indexOf(currentStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        try {
            await contactAPI.updateContactStatus(id, nextStatus);
            toast.success(`Marked as ${nextStatus}`);
            setContacts(contacts.map(c => 
                c.id === id ? { ...c, status: nextStatus } : c
            ));
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        
        try {
            await contactAPI.deleteContact(id);
            toast.success('Message deleted');
            setContacts(contacts.filter(c => c.id !== id));
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread': return 'bg-red-100 text-red-800 border-red-200';
            case 'read': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                    <HiMail className="w-6 h-6 mr-2 text-primary-600" />
                    Enquiries & Contacts
                </h2>
                <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                    {contacts.length} Total Messages
                </span>
            </div>

            {contacts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <HiMail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg font-medium">No messages found</p>
                    <p className="text-gray-400 text-sm mt-1">When users contact you, they'll appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <div 
                            key={contact.id} 
                            className={`border rounded-lg p-5 transition-shadow hover:shadow-md ${
                                contact.status === 'unread' ? 'bg-white border-primary-200 shadow-sm' : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{contact.subject}</h3>
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wider ${getStatusColor(contact.status)}`}>
                                            {contact.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1 font-medium">
                                        <span>From: {contact.fullName}</span>
                                        <span>Email: <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline">{contact.email}</a></span>
                                        {contact.phone && <span>Phone: {contact.phone}</span>}
                                    </div>
                                    <span className="text-xs text-gray-400 mt-2 block">
                                        {new Date(contact.createdAt).toLocaleString(undefined, { 
                                            year: 'numeric', month: 'short', day: 'numeric', 
                                            hour: '2-digit', minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                
                                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                                    <button 
                                        onClick={() => handleUpdateStatus(contact.id, contact.status)}
                                        className="btn-secondary py-1.5 px-3 text-sm flex items-center justify-center hover:bg-gray-100"
                                        title="Cycle Status (Unread -> Read -> Resolved)"
                                    >
                                        <HiCheck className="w-4 h-4 mr-1.5 opacity-70" />
                                        Update Status
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(contact.id)}
                                        className="btn-danger py-1.5 px-3 text-sm flex items-center justify-center hover:bg-red-600"
                                    >
                                        <HiTrash className="w-4 h-4 mr-1.5 opacity-70 text-white" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded border border-gray-100 text-gray-700 whitespace-pre-wrap mt-2">
                                {contact.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminContactsPage;
