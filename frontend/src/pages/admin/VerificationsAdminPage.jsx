/**
 * Admin Verifications Page
 * Allows admins to view pending KYC requests, review documents, and approve/reject.
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiCheck, HiX, HiEye, HiOutlineDocumentSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const VerificationsAdminPage = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/verification/admin?status=pending_review');
            setVerifications(res.data.data); // backend returns { data: [] }
        } catch (error) {
            toast.error('Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);
        try {
            await api.post(`/verification/admin/${selectedRequest.id}/approve`);
            toast.success('User verification approved!');
            setSelectedRequest(null);
            fetchPending(); // Refresh list
        } catch (error) {
            toast.error('Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        setActionLoading(true);
        try {
            await api.post(`/verification/admin/${selectedRequest.id}/reject`, { reason: rejectReason });
            toast.success('User verification rejected');
            setSelectedRequest(null);
            setIsRejecting(false);
            setRejectReason('');
            fetchPending(); // Refresh list
        } catch (error) {
            toast.error('Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
                    <p className="text-gray-600 mt-2">Review and approve user KYC documents.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            ) : verifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <HiOutlineDocumentSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-500">All user verifications have been processed.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / Date</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {verifications.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{req.personalDetails.fullName}</div>
                                        <div className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {req.personalDetails.nationality}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {req.idDocType.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => setSelectedRequest(req)}
                                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 font-semibold"
                                        >
                                            <HiEye className="w-5 h-5" /> Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedRequest(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6 flex items-center justify-between" id="modal-title">
                                            Review Verification: {selectedRequest.personalDetails.fullName}
                                            <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-500">
                                                <HiX className="w-6 h-6" />
                                            </button>
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left Col: Details */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Personal Details</h4>
                                                <dl className="space-y-3 text-sm">
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">Full Name</dt><dd className="col-span-2 font-medium">{selectedRequest.personalDetails.fullName}</dd></div>
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">DOB</dt><dd className="col-span-2 font-medium">{selectedRequest.personalDetails.dob}</dd></div>
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">Nationality</dt><dd className="col-span-2 font-medium">{selectedRequest.personalDetails.nationality}</dd></div>
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">Phone</dt><dd className="col-span-2 font-medium">{selectedRequest.personalDetails.phone}</dd></div>
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">Address</dt><dd className="col-span-2 font-medium">{selectedRequest.personalDetails.address}</dd></div>
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">Doc Type</dt><dd className="col-span-2 font-medium capitalize">{selectedRequest.idDocType.replace('_', ' ')}</dd></div>
                                                    <div className="grid grid-cols-3"><dt className="text-gray-500">Doc #</dt><dd className="col-span-2 font-medium">{selectedRequest.idDocNumber}</dd></div>
                                                </dl>
                                            </div>

                                            {/* Right Col: Images */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">ID Document (Front)</h4>
                                                    <img src={selectedRequest.idFrontUrl} alt="ID Document" className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Selfie</h4>
                                                    <img src={selectedRequest.selfieUrl} alt="Selfie" className="w-32 h-32 object-cover rounded-full border border-gray-200 shadow-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {isRejecting && (
                                            <div className="mt-8 bg-red-50 p-4 rounded-xl border border-red-100 animate-slide-up">
                                                <label className="block text-sm font-medium text-red-800 mb-2">Reason for Rejection *</label>
                                                <textarea 
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    className="w-full p-3 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                                                    placeholder="E.g., Selfie does not match ID document, ID is blurry, etc."
                                                    rows="3"
                                                />
                                                <div className="mt-3 flex justify-end gap-3">
                                                    <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                                    <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">Confirm Rejection</button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions Footer */}
                            {!isRejecting && (
                                <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                    <button 
                                        type="button" 
                                        disabled={actionLoading}
                                        onClick={handleApprove}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm items-center gap-2"
                                    >
                                        <HiCheck className="w-5 h-5" /> Approve
                                    </button>
                                    <button 
                                        type="button" 
                                        disabled={actionLoading}
                                        onClick={() => setIsRejecting(true)}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm items-center gap-2"
                                    >
                                        <HiX className="w-5 h-5" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationsAdminPage;
