/**
 * Create Trip Page
 * Form to create a new trip with optional cover image upload
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPhotograph, HiX } from 'react-icons/hi';

const CreateTripPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: '',
        budgetType: 'moderate',
        maxGroupSize: 5,
        description: '',
        isPublic: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Reuse the same handler by constructing a fake event
            handleImageChange({ target: { files: [file] } });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error('End date must be after start date');
            return;
        }

        if (new Date(formData.startDate) < new Date()) {
            toast.error('Start date cannot be in the past');
            return;
        }

        setLoading(true);
        try {
            // Build FormData for multipart upload
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('destination', formData.destination);
            fd.append('startDate', formData.startDate);
            fd.append('endDate', formData.endDate);
            if (formData.budget) fd.append('budget', formData.budget);
            fd.append('budgetType', formData.budgetType);
            fd.append('maxGroupSize', formData.maxGroupSize);
            if (formData.description) fd.append('description', formData.description);
            fd.append('isPublic', formData.isPublic);
            if (imageFile) fd.append('coverImage', imageFile);

            const response = await tripAPI.createTrip(fd);
            toast.success('Trip created successfully!');
            navigate(`/trips/${response.data.data.id}`);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create trip';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-8">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <HiArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create a New Trip</h1>
                <p className="text-gray-600 mb-8">Fill in the details to create your group adventure</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover Image Upload */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h2>

                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Cover preview"
                                    className="w-full h-56 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                                    <p className="text-white text-sm font-medium truncate">{imageFile?.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                            >
                                <HiPhotograph className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                                <p className="text-gray-400 text-sm mt-1">JPEG, PNG, GIF, or WebP (max 5MB)</p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Trip Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    minLength={5}
                                    maxLength={200}
                                    className="input"
                                    placeholder="e.g., Weekend in Paris, Backpacking through Thailand"
                                />
                            </div>

                            <div>
                                <label className="label">Destination *</label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="e.g., Paris, France"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">End Date *</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    className="input"
                                    placeholder="Describe your trip, activities planned, what you're looking for in travel buddies..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget & Group Size */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Group</h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">Budget Type *</label>
                                <select
                                    name="budgetType"
                                    value={formData.budgetType}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="budget">Budget</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Estimated Budget (Rs.)</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    min="0"
                                    className="input"
                                    placeholder="e.g., 1500"
                                />
                            </div>
                            <div>
                                <label className="label">Max Group Size *</label>
                                <input
                                    type="number"
                                    name="maxGroupSize"
                                    value={formData.maxGroupSize}
                                    onChange={handleChange}
                                    required
                                    min="2"
                                    max="50"
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility</h2>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="isPublic"
                                checked={formData.isPublic}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Public Trip</span>
                                <p className="text-sm text-gray-500">Anyone can find and request to join this trip</p>
                            </div>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => navigate('/trips')} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Creating...' : 'Create Trip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTripPage;
