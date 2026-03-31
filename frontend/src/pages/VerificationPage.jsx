/**
 * Verification Page (KYC)
 * Allows users to submit their identity details or check their status.
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HiCheckCircle, HiXCircle, HiClock, HiUpload, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const VerificationPage = () => {
    const { user, isVerified, fetchCurrentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Status states: loading, unverified, pending_review, approved, rejected
    const [status, setStatus] = useState('loading');
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Form state
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        personalDetails: {
            fullName: user?.fullName || '',
            dob: '',
            nationality: '',
            phone: '',
            address: ''
        },
        idDocType: 'national_id',
        idDocNumber: '',
        idFront: null,
        selfie: null,
        consent: false
    });
    const [previews, setPreviews] = useState({ idFront: null, selfie: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch actual verification request status on mount
    useEffect(() => {
        const checkStatus = async () => {
            if (isVerified) {
                setStatus('approved');
                return;
            }

            try {
                // Read from backend endpoint
                const res = await api.get('/verification/me');
                const verification = res.data.data;
                
                if (!verification) {
                    setStatus('unverified');
                } else {
                    setStatus(verification.status);
                    if (verification.rejectionReason) {
                        setRejectionReason(verification.rejectionReason);
                    }
                }
            } catch (error) {
                toast.error('Failed to load verification status');
                setStatus('unverified');
            }
        };

        checkStatus();
    }, [user, isVerified]);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        if (name in formData.personalDetails) {
            setFormData(prev => ({
                ...prev,
                personalDetails: { ...prev.personalDetails, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            // Store actual File object for upload
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            // Create preview URL for display
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
        }
    };

    const nextStep = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };
    
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const submitData = new FormData();
            submitData.append('personalDetails', JSON.stringify(formData.personalDetails));
            submitData.append('idDocType', formData.idDocType);
            submitData.append('idDocNumber', formData.idDocNumber);
            if (formData.idFront) submitData.append('idFront', formData.idFront);
            if (formData.selfie) submitData.append('selfie', formData.selfie);

            await api.post('/verification/submit', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Verification submitted successfully!');
            await fetchCurrentUser(); // Refresh user context
            setStatus('pending_review');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit verification request');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER STATUS SCREENS ---
    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (status === 'approved') {
        return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiCheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">You are Verified!</h1>
                <p className="text-gray-600 mb-8">
                    Your identity has been confirmed. You can now post treks and chat with other verified members of the community safely.
                </p>
                
                {location.state?.from ? (
                    <button onClick={() => navigate(location.state.from)} className="btn-primary">
                        Continue to Previous Page
                    </button>
                ) : (
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Go to Dashboard
                    </button>
                )}
            </div>
        );
    }

    if (status === 'pending_review') {
        return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center animate-fade-in">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiClock className="w-12 h-12 text-yellow-500 animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Pending</h1>
                <p className="text-gray-600 mb-4">
                    Your identity documents have been submitted and are currently under review by our admin team. This usually takes 1-24 hours.
                </p>
                {location.state?.from && (
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-8 text-sm">
                        You were trying to access a restricted feature. You'll be able to use it once your account is fully verified.
                    </div>
                )}
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiXCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Rejected</h1>
                <p className="text-gray-600 mb-6">
                    Unfortunately, we could not verify your identity based on the documents provided.
                </p>
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-left mb-8 max-w-md mx-auto">
                    <span className="font-bold block mb-1">Reason for rejection:</span>
                    {rejectionReason || 'Documents were unclear or did not match the personal details provided.'}
                </div>
                <button 
                    onClick={() => {
                        setStatus('unverified');
                        setStep(1);
                    }} 
                    className="btn-primary"
                >
                    Submit New Documents
                </button>
            </div>
        );
    }

    // --- RENDER WIZARD FORM (status === 'unverified') ---
    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <HiShieldCheck className="w-6 h-6 text-primary-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Get Verified</h1>
                <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                    Verification is required to post treks and chat. This keeps our community safe and builds trust among travelers.
                </p>
                {location.state?.from && (
                    <p className="text-sm font-medium text-primary-600 mt-2">
                        Complete this quick process to access your requested feature!
                    </p>
                )}
            </div>

            {/* Stepper UI */}
            <div className="flex items-center justify-center mb-10">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            step === s ? 'bg-primary-600 text-white shadow-md' :
                            step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 3 && (
                            <div className={`w-16 h-1 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-fade-in">
                <form onSubmit={step === 3 ? handleSubmit : nextStep}>
                    
                    {/* STEP 1: Personal Details */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 mb-6">1. Personal Details</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as on ID) *</label>
                                <input type="text" name="fullName" required value={formData.personalDetails.fullName} onChange={handleTextChange} className="input w-full" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                    <input type="date" name="dob" required value={formData.personalDetails.dob} onChange={handleTextChange} className="input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                                    <input type="text" name="nationality" required value={formData.personalDetails.nationality} onChange={handleTextChange} className="input w-full" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input type="tel" name="phone" required value={formData.personalDetails.phone} onChange={handleTextChange} className="input w-full" placeholder="+1 234 567 8900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address *</label>
                                <textarea name="address" required value={formData.personalDetails.address} onChange={handleTextChange} className="input w-full h-24 resize-none" placeholder="City, State, Country" />
                            </div>
                            
                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="btn-primary flex items-center gap-2">
                                    Continue <HiArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ID Document */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 mb-6">2. Identity Document</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                                <select name="idDocType" required value={formData.idDocType} onChange={handleTextChange} className="input w-full">
                                    <option value="passport">Passport</option>
                                    <option value="national_id">National ID Card</option>
                                    <option value="drivers_license">Driver's License</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Number *</label>
                                <input type="text" name="idDocNumber" required value={formData.idDocNumber} onChange={handleTextChange} className="input w-full" placeholder="Ex: ABC123456" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Front page) *</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                                    <input type="file" name="idFront" id="idFront" accept="image/jpeg, image/png" required={!formData.idFront} onChange={handleFileChange} className="hidden" />
                                    <label htmlFor="idFront" className="cursor-pointer flex flex-col items-center">
                                        {previews.idFront ? (
                                            <div className="relative group">
                                                <img src={previews.idFront} alt="ID Preview" className="h-32 object-cover rounded shadow-sm" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                    <span className="text-white text-sm font-medium">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <HiUpload className="w-10 h-10 text-gray-400 mb-2" />
                                                <span className="text-primary-600 font-medium">Click to upload image</span>
                                                <span className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-between">
                                <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
                                <button type="submit" className="btn-primary flex items-center gap-2">
                                    Continue <HiArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Selfie & Consent */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 mb-6">3. Selfie & Consent</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Take a clear selfie *</label>
                                <p className="text-xs text-gray-500 mb-3">Please ensure your face is clearly visible and well-lit. No sunglasses or hats.</p>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                                    <input type="file" name="selfie" id="selfie" accept="image/jpeg, image/png, image/webp" capture="user" required={!formData.selfie} onChange={handleFileChange} className="hidden" />
                                    <label htmlFor="selfie" className="cursor-pointer flex flex-col items-center">
                                        {previews.selfie ? (
                                            <div className="relative group">
                                                <img src={previews.selfie} alt="Selfie Preview" className="h-32 w-32 object-cover rounded-full shadow-sm" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                    <span className="text-white text-sm font-medium w-full text-center">Change</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                                                    <HiUpload className="w-8 h-8 text-primary-500" />
                                                </div>
                                                <span className="text-primary-600 font-medium">Take Photo or Upload</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" name="consent" required checked={formData.consent} onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))} className="mt-1 w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-600" />
                                    <span className="text-sm text-gray-700 leading-relaxed">
                                        I confirm that the details provided are accurate and the documents belong to me. I understand that submitting false information may result in a permanent ban from Travel Buddy.
                                    </span>
                                </label>
                            </div>
                            
                            <div className="pt-4 flex justify-between">
                                <button type="button" onClick={prevStep} className="btn-secondary" disabled={isSubmitting}>Back</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary w-48 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Submitting...</span>
                                    ) : (
                                        'Submit Verification'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default VerificationPage;
