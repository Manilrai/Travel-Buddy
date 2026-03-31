/**
 * Admin Services Management Page
 * CRUD interface for managing Bus, Hotel, and Trek services
 */
import { useState, useEffect } from 'react';
import { serviceAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    HiPlus, HiPencil, HiTrash, HiTruck, HiOfficeBuilding,
    HiFlag, HiX, HiPhotograph
} from 'react-icons/hi';

const SERVICE_TYPES = [
    { key: 'bus', label: 'Bus & Transport', icon: HiTruck },
    { key: 'hotel', label: 'Hotels & Stays', icon: HiOfficeBuilding },
    { key: 'trek', label: 'Trekking Packages', icon: HiFlag },
];

const emptyForm = {
    type: 'bus',
    title: '',
    description: '',
    overview: '',
    price: '',
    image: '',
    location: '',
    duration: '',
    // Bus-specific
    routeFrom: '',
    routeTo: '',
    busType: '',
    seatsAvailable: '',
    // Hotel-specific
    city: '',
    starRating: '',
    checkIn: '',
    checkOut: '',
    // Trek-specific
    region: '',
    difficulty: 'Moderate',
    maxAltitude: '',
    bestSeason: '',
    groupSize: '',
};

const AdminServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('bus');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchServices();
    }, [activeType]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await serviceAPI.getAll(activeType);
            setServices(res.data.data || []);
        } catch (err) {
            console.error('Fetch services error:', err);
            const msg = err.response?.data?.message || 'Failed to load services';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm({ ...emptyForm, type: activeType });
        setShowForm(true);
    };

    const openEditForm = (svc) => {
        setEditingId(svc.id);
        const meta = svc.metadata || {};
        setForm({
            type: svc.type,
            title: svc.title || '',
            description: svc.description || '',
            overview: svc.overview || '',
            price: svc.price || '',
            image: svc.image || '',
            location: svc.location || '',
            duration: svc.duration || '',
            // Bus
            routeFrom: meta.route?.from || meta.routeFrom || '',
            routeTo: meta.route?.to || meta.routeTo || '',
            busType: meta.busType || '',
            seatsAvailable: meta.seatsAvailable || '',
            // Hotel
            city: meta.city || '',
            starRating: meta.starRating || '',
            checkIn: meta.checkIn || '',
            checkOut: meta.checkOut || '',
            // Trek
            region: meta.region || '',
            difficulty: meta.difficulty || 'Moderate',
            maxAltitude: meta.maxAltitude || '',
            bestSeason: meta.bestSeason || '',
            groupSize: meta.groupSize || '',
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyForm });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const buildPayload = () => {
        const payload = {
            type: form.type,
            title: form.title,
            description: form.description,
            overview: form.overview,
            price: parseInt(form.price) || 0,
            image: form.image,
            location: form.location,
            duration: form.duration,
        };

        // Type-specific metadata fields go as extra keys (controller spreads them into metadata)
        if (form.type === 'bus') {
            payload.route = { from: form.routeFrom, to: form.routeTo };
            payload.busType = form.busType;
            payload.seatsAvailable = parseInt(form.seatsAvailable) || 0;
        } else if (form.type === 'hotel') {
            payload.city = form.city;
            payload.starRating = parseInt(form.starRating) || 3;
            payload.checkIn = form.checkIn;
            payload.checkOut = form.checkOut;
        } else if (form.type === 'trek') {
            payload.region = form.region;
            payload.difficulty = form.difficulty;
            payload.maxAltitude = form.maxAltitude;
            payload.bestSeason = form.bestSeason;
            payload.groupSize = form.groupSize;
        }

        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.price) {
            toast.error('Title, description, and price are required');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await serviceAPI.update(editingId, buildPayload());
                toast.success('Service updated!');
            } else {
                await serviceAPI.create(buildPayload());
                toast.success('Service created!');
            }
            closeForm();
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await serviceAPI.remove(id);
            toast.success('Service deleted');
            fetchServices();
        } catch (err) {
            console.error('Delete error:', err);
            const msg = err.response?.data?.message || 'Failed to delete service';
            toast.error(msg);
        }
    };

    // Render type-specific form fields
    const renderTypeFields = () => {
        switch (form.type) {
            case 'bus':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route From</label>
                                <input name="routeFrom" value={form.routeFrom} onChange={handleChange} className="input w-full" placeholder="e.g. Kathmandu" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route To</label>
                                <input name="routeTo" value={form.routeTo} onChange={handleChange} className="input w-full" placeholder="e.g. Pokhara" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bus Type</label>
                                <input name="busType" value={form.busType} onChange={handleChange} className="input w-full" placeholder="e.g. Tourist Deluxe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Seats Available</label>
                                <input name="seatsAvailable" type="number" value={form.seatsAvailable} onChange={handleChange} className="input w-full" />
                            </div>
                        </div>
                    </>
                );
            case 'hotel':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input name="city" value={form.city} onChange={handleChange} className="input w-full" placeholder="e.g. Lakeside, Pokhara" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                                <select name="starRating" value={form.starRating} onChange={handleChange} className="input w-full">
                                    <option value="">Select</option>
                                    {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Star</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                                <input name="checkIn" value={form.checkIn} onChange={handleChange} className="input w-full" placeholder="e.g. 2:00 PM" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                                <input name="checkOut" value={form.checkOut} onChange={handleChange} className="input w-full" placeholder="e.g. 12:00 PM" />
                            </div>
                        </div>
                    </>
                );
            case 'trek':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                <input name="region" value={form.region} onChange={handleChange} className="input w-full" placeholder="e.g. Solukhumbu" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input w-full">
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Challenging">Challenging</option>
                                    <option value="Moderate–Challenging">Moderate–Challenging</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Altitude</label>
                                <input name="maxAltitude" value={form.maxAltitude} onChange={handleChange} className="input w-full" placeholder="e.g. 5,364m" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Best Season</label>
                                <input name="bestSeason" value={form.bestSeason} onChange={handleChange} className="input w-full" placeholder="e.g. March–May" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
                            <input name="groupSize" value={form.groupSize} onChange={handleChange} className="input w-full" placeholder="e.g. 2–12" />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Type tabs */}
            <div className="flex space-x-2 mb-6">
                {SERVICE_TYPES.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveType(t.key)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeType === t.key
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <t.icon className="w-4 h-4 mr-2" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Header + Add button */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">
                    {SERVICE_TYPES.find(t => t.key === activeType)?.label} ({services.length})
                </h3>
                <button onClick={openAddForm} className="btn-primary flex items-center text-sm">
                    <HiPlus className="w-4 h-4 mr-1" />
                    Add Service
                </button>
            </div>

            {/* Services table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <HiPhotograph className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No {activeType} services yet. Click "Add Service" to create one.</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Image</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Price (NPR)</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Info</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(svc => (
                                    <tr key={svc.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {svc.image ? (
                                                <img src={svc.image} alt="" className="w-16 h-10 rounded object-cover" />
                                            ) : (
                                                <div className="w-16 h-10 rounded bg-gray-200 flex items-center justify-center">
                                                    <HiPhotograph className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{svc.title}</td>
                                        <td className="px-4 py-3 text-gray-700">Rs. {svc.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {svc.type === 'bus' && `${svc.metadata?.route?.from || svc.metadata?.routeFrom || ''} → ${svc.metadata?.route?.to || svc.metadata?.routeTo || ''}`}
                                            {svc.type === 'hotel' && (svc.metadata?.city || svc.location || '')}
                                            {svc.type === 'trek' && `${svc.duration || ''} • ${svc.metadata?.difficulty || ''}`}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex space-x-2">
                                                <button onClick={() => openEditForm(svc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(svc.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingId ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type selector (only for new) */}
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                    <select name="type" value={form.type} onChange={handleChange} className="input w-full">
                                        <option value="bus">Bus & Transport</option>
                                        <option value="hotel">Hotel & Stay</option>
                                        <option value="trek">Trekking Package</option>
                                    </select>
                                </div>
                            )}

                            {/* Common fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input name="title" value={form.title} onChange={handleChange} className="input w-full" placeholder="Service title" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea name="description" value={form.description} onChange={handleChange} className="input w-full" rows={3} placeholder="Short description" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                                <textarea name="overview" value={form.overview} onChange={handleChange} className="input w-full" rows={3} placeholder="Detailed overview (optional)" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR) *</label>
                                    <input name="price" type="number" value={form.price} onChange={handleChange} className="input w-full" placeholder="0" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input name="duration" value={form.duration} onChange={handleChange} className="input w-full" placeholder="e.g. 6-7 hours / 14 Days" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input name="image" value={form.image} onChange={handleChange} className="input w-full" placeholder="/images/..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input name="location" value={form.location} onChange={handleChange} className="input w-full" placeholder="e.g. Kathmandu, Nepal" />
                            </div>

                            {/* Type-specific fields */}
                            <hr className="my-2" />
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {form.type === 'bus' ? 'Bus' : form.type === 'hotel' ? 'Hotel' : 'Trek'} Details
                            </p>
                            {renderTypeFields()}

                            {/* Submit */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary">
                                    {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServicesPage;
