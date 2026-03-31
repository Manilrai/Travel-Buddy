/**
 * Edit Profile Page
 * Form to update user profile and interests
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiCamera, HiX } from 'react-icons/hi';

const EditProfilePage = () => {
    const { user, updateUser, fetchCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [interests, setInterests] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [newDestination, setNewDestination] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'prefer_not_to_say',
        nationality: '',
        travelStyle: 'moderate',
        availabilityStart: '',
        availabilityEnd: '',
        groupSizePreference: 4,
        bio: ''
    });

    useEffect(() => {
        fetchInterests();
        if (user?.profile) {
            const profile = user.profile;
            setFormData({
                fullName: profile.fullName || '',
                age: profile.age || '',
                gender: profile.gender || 'prefer_not_to_say',
                nationality: profile.nationality || '',
                travelStyle: profile.travelStyle || 'moderate',
                availabilityStart: profile.availabilityStart || '',
                availabilityEnd: profile.availabilityEnd || '',
                groupSizePreference: profile.groupSizePreference || 4,
                bio: profile.bio || ''
            });
            setDestinations(profile.preferredDestinations || []);
        }
        if (user?.interests) {
            setSelectedInterests(user.interests.map(i => i.id));
        }
    }, [user]);

    const fetchInterests = async () => {
        try {
            const response = await userAPI.getAllInterests();
            setInterests(response.data.data || []);
        } catch (error) {
            console.error('Error fetching interests:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleInterestToggle = (interestId) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    };

    const addDestination = () => {
        if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
            setDestinations([...destinations, newDestination.trim()]);
            setNewDestination('');
        }
    };

    const removeDestination = (dest) => {
        setDestinations(destinations.filter(d => d !== dest));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update profile
            await userAPI.updateProfile({
                ...formData,
                preferredDestinations: destinations
            });

            // Update interests
            if (selectedInterests.length > 0) {
                await userAPI.updateInterests(selectedInterests);
            }

            await fetchCurrentUser();
            toast.success('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            await userAPI.uploadProfilePicture(formData);
            await fetchCurrentUser();
            toast.success('Profile picture updated!');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload image';
            toast.error(message);
            console.error('Upload error:', error);
        }
    };

    return (
        <div className="container-custom py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Picture */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <img
                                    src={(user?.profile?.profilePicture ? `${user.profile.profilePicture}?t=${Date.now()}` : null) || '/default-avatar.svg'}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
                                    <HiCamera className="w-4 h-4 text-white" />
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Upload a photo of yourself</p>
                                <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="label">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="18"
                                    max="120"
                                    className="input"
                                    placeholder="25"
                                />
                            </div>
                            <div>
                                <label className="label">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Nationality</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="United States"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="label">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="input"
                                placeholder="Tell others about yourself..."
                            />
                        </div>
                    </div>

                    {/* Travel Preferences */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Preferences</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Travel Style</label>
                                <select name="travelStyle" value={formData.travelStyle} onChange={handleChange} className="input">
                                    <option value="budget">Budget</option>
                                    <option value="backpacker">Backpacker</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="luxury">Luxury</option>
                                    <option value="adventure">Adventure</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Preferred Group Size</label>
                                <input
                                    type="number"
                                    name="groupSizePreference"
                                    value={formData.groupSizePreference}
                                    onChange={handleChange}
                                    min="2"
                                    max="20"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">Available From</label>
                                <input
                                    type="date"
                                    name="availabilityStart"
                                    value={formData.availabilityStart}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">Available Until</label>
                                <input
                                    type="date"
                                    name="availabilityEnd"
                                    value={formData.availabilityEnd}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Destinations */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dream Destinations</h2>
                        <div className="flex space-x-2 mb-4">
                            <input
                                type="text"
                                value={newDestination}
                                onChange={(e) => setNewDestination(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                                className="input flex-1"
                                placeholder="Add a destination..."
                            />
                            <button type="button" onClick={addDestination} className="btn-primary">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {destinations.map((dest, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                                    {dest}
                                    <button type="button" onClick={() => removeDestination(dest)} className="ml-2 hover:text-primary-900">
                                        <HiX className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Interests</h2>
                        <div className="flex flex-wrap gap-2">
                            {interests.map((interest) => (
                                <button
                                    key={interest.id}
                                    type="button"
                                    onClick={() => handleInterestToggle(interest.id)}
                                    className={`px-4 py-2 rounded-full border transition-colors ${selectedInterests.includes(interest.id)
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                                        }`}
                                >
                                    {interest.icon} {interest.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => navigate('/profile')} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;
