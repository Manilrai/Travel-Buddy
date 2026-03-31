/**
 * Post a Trek Wizard
 * 5-step form for verified users to create a new trek post
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiArrowRight, HiArrowLeft, HiCheckCircle, HiPhotograph, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PostTrekPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Core Form State
    const [formData, setFormData] = useState({
        title: '',
        region: '',
        dates: { start: '', end: '', flexible: false },
        duration: '',
        difficulty: 'Moderate',
        maxAltitude: '',
        groupSize: { min: 2, max: 6 },
        budgetRange: { min: '', max: '' },
        itinerary: [{ day: 1, title: '', description: '' }],
        inclusions: [''],
        exclusions: [''],
        requirements: [''],
        meetingPoint: '',
        images: [] // Storing object URLs for MVP preview
    });

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    // Array field handlers (Itinerary, Inclusions...)
    const handleArrayChange = (field, index, value, subfield = null) => {
        setFormData(prev => {
            const newArr = [...prev[field]];
            if (subfield) {
                newArr[index][subfield] = value;
            } else {
                newArr[index] = value;
            }
            return { ...prev, [field]: newArr };
        });
    };

    const addArrayItem = (field, defaultItem = '') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultItem] }));
    };

    const removeArrayItem = (field, index) => {
        if (formData[field].length === 1) return; // Keep at least one
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    // Image Upload (Mock)
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(f => URL.createObjectURL(f));
        setFormData(prev => ({ 
            ...prev, 
            images: [...prev.images, ...imageUrls].slice(0, 5) // Max 5 images
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }

    const nextStep = (e) => { e.preventDefault(); setStep(s => s + 1); };
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const payload = {
                ...formData,
                userId: user?.id || user?._id,
                posterName: user?.fullName || 'Trekker'
            };
            
            const res = await api.post('/treks', payload);
            toast.success('Trek Posted Successfully!');
            navigate(`/treks/${res.data.data.id}`);
        } catch (error) {
            toast.error('Failed to post trek');
            setIsSubmitting(false);
        }
    };

    // --- STEP RENDERERS ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Basic Information</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trek Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleTextChange} className="input w-full" placeholder="E.g., Everest Base Camp - 14 Days" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                    <input type="text" name="region" required value={formData.region} onChange={handleTextChange} className="input w-full" placeholder="E.g., Annapurna, Langtang" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <input type="text" name="duration" required value={formData.duration} onChange={handleTextChange} className="input w-full" placeholder="E.g., 10 Days" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={formData.dates.start} onChange={(e) => handleNestedChange('dates', 'start', e.target.value)} className="input w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={formData.dates.end} onChange={(e) => handleNestedChange('dates', 'end', e.target.value)} className="input w-full" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id="flex-dates" checked={formData.dates.flexible} onChange={(e) => handleNestedChange('dates', 'flexible', e.target.checked)} className="rounded text-primary-600 focus:ring-primary-600" />
                <label htmlFor="flex-dates" className="text-sm text-gray-700">My dates are flexible</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleTextChange} className="input w-full">
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Challenging">Challenging</option>
                        <option value="Strenuous">Strenuous</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Altitude</label>
                    <input type="text" name="maxAltitude" value={formData.maxAltitude} onChange={handleTextChange} className="input w-full" placeholder="E.g., 5,364m" />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Itinerary Details</h2>
            
            <p className="text-sm text-gray-600">Provide a high-level day-by-day plan so joining trekkers know what to expect.</p>
            
            <div className="space-y-4">
                {formData.itinerary.map((day, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative">
                        {formData.itinerary.length > 1 && (
                            <button type="button" onClick={() => removeArrayItem('itinerary', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                <HiXCircle className="w-5 h-5" />
                            </button>
                        )}
                        <h4 className="font-bold text-gray-700 mb-2">Day {idx + 1}</h4>
                        <input 
                            type="text" 
                            required 
                            placeholder="Title (E.g., Drive KTM to Pokhara)" 
                            value={day.title} 
                            onChange={(e) => handleArrayChange('itinerary', idx, e.target.value, 'title')} 
                            className="input w-full mb-2" 
                        />
                        <textarea 
                            required 
                            placeholder="Brief description of the day's activities..." 
                            value={day.description} 
                            onChange={(e) => handleArrayChange('itinerary', idx, e.target.value, 'description')} 
                            className="input w-full h-20 resize-none" 
                        />
                    </div>
                ))}
            </div>
            
            <button 
                type="button" 
                onClick={() => addArrayItem('itinerary', { day: formData.itinerary.length + 1, title: '', description: '' })} 
                className="text-sm font-semibold text-primary-600 hover:text-primary-800"
            >
                + Add Another Day
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Cost & Group Setup</h2>
            
            <h3 className="font-semibold text-gray-800 pt-2">Budget Range (Per Person)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Min (NPR)</label>
                    <input type="number" required value={formData.budgetRange.min} onChange={(e) => handleNestedChange('budgetRange', 'min', Number(e.target.value))} className="input w-full" placeholder="30000" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Max (NPR)</label>
                    <input type="number" required value={formData.budgetRange.max} onChange={(e) => handleNestedChange('budgetRange', 'max', Number(e.target.value))} className="input w-full" placeholder="45000" />
                </div>
            </div>

            <h3 className="font-semibold text-gray-800 pt-4">Target Group Size</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Minimum members</label>
                    <input type="number" required value={formData.groupSize.min} onChange={(e) => handleNestedChange('groupSize', 'min', Number(e.target.value))} className="input w-full" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Maximum members</label>
                    <input type="number" required value={formData.groupSize.max} onChange={(e) => handleNestedChange('groupSize', 'max', Number(e.target.value))} className="input w-full" />
                </div>
            </div>

            <h3 className="font-semibold text-gray-800 pt-4">Meeting Details</h3>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Point / Starting City *</label>
                <input type="text" required name="meetingPoint" value={formData.meetingPoint} onChange={handleTextChange} className="input w-full" placeholder="E.g., Thamel, Kathmandu" />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Requirements & Extras</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Inclusions */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">What's Included</h3>
                    {formData.inclusions.map((inc, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <input type="text" required value={inc} onChange={(e) => handleArrayChange('inclusions', idx, e.target.value)} className="input flex-1" placeholder="E.g., Guide, Permits" />
                            {formData.inclusions.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem('inclusions', idx)} className="text-gray-400 hover:text-red-500 px-2">✕</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('inclusions')} className="text-xs font-semibold text-green-600">+ Add Inclusion</button>
                </div>

                {/* Exclusions */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">What's NOT Included</h3>
                    {formData.exclusions.map((exc, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <input type="text" required value={exc} onChange={(e) => handleArrayChange('exclusions', idx, e.target.value)} className="input flex-1" placeholder="E.g., Flights, Water" />
                            {formData.exclusions.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem('exclusions', idx)} className="text-gray-400 hover:text-red-500 px-2">✕</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('exclusions')} className="text-xs font-semibold text-red-600">+ Add Exclusion</button>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">Trek Requirements (Gear/Fitness)</h3>
                {formData.requirements.map((req, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                        <input type="text" required value={req} onChange={(e) => handleArrayChange('requirements', idx, e.target.value)} className="input flex-1" placeholder="E.g., Trekking poles needed" />
                        {formData.requirements.length > 1 && (
                            <button type="button" onClick={() => removeArrayItem('requirements', idx)} className="text-gray-400 hover:text-red-500 px-2">✕</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addArrayItem('requirements')} className="text-xs font-semibold text-primary-600">+ Add Requirement</button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Photos & Review</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Route Photos (Max 5)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => removeImage(idx)} 
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                            >
                                <HiXCircle className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    
                    {formData.images.length < 5 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                            <HiPhotograph className="w-8 h-8 mb-1" />
                            <span className="text-sm font-medium">Add Photo</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    )}
                </div>
            </div>

            <div className="bg-primary-50 p-6 rounded-xl mt-8">
                <h3 className="font-bold text-primary-900 flex items-center mb-2"><HiCheckCircle className="w-5 h-5 mr-2" /> Ready to Publish!</h3>
                <p className="text-sm text-primary-800">
                    By publishing this trek, it will be visible to everyone on the Find Buddies page. Only verified users will be able to message you directly.
                </p>
            </div>
        </div>
    );

    const stepsArray = ['Basic Info', 'Itinerary', 'Cost & Group', 'Details', 'Photos'];

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Post a Trek</h1>
                    {/* Progress Bar */}
                    <div className="flex border-b border-gray-200 hide-scrollbar overflow-x-auto">
                        {stepsArray.map((label, idx) => {
                            const stepNum = idx + 1;
                            const isActive = step === stepNum;
                            const isCompleted = step > stepNum;
                            return (
                                <div key={stepNum} className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    isActive ? 'border-primary-600 text-primary-600' :
                                    isCompleted ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-400'
                                }`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs border ${
                                        isActive ? 'border-primary-600 bg-primary-50' :
                                        isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                                    }`}>
                                        {isCompleted ? '✓' : stepNum}
                                    </span>
                                    {label}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
                    <form onSubmit={step === 5 ? handleSubmit : nextStep}>
                        
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}

                        {/* Navigation Footer */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <button 
                                type="button" 
                                onClick={prevStep} 
                                disabled={step === 1 || isSubmitting}
                                className={`flex items-center gap-2 font-medium ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <HiArrowLeft className="w-4 h-4" /> Back
                            </button>
                            
                            {step < 5 ? (
                                <button type="submit" className="btn-primary flex items-center gap-2">
                                    Next Step <HiArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 w-48 justify-center">
                                    {isSubmitting ? 'Publishing...' : 'Publish Trek'} <HiCheckCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default PostTrekPage;
