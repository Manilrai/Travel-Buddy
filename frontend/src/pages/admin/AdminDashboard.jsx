/**
 * Admin Dashboard - Platform management
 */
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUsers, HiMap, HiFlag, HiChartBar, HiCheck, HiBan, HiTrash, HiShieldCheck, HiUser, HiCamera, HiCreditCard, HiTruck, HiMail } from 'react-icons/hi';
import VerificationsAdminPage from './VerificationsAdminPage';
import AdminBookingsPage from './AdminBookingsPage';
import AdminServicesPage from './AdminServicesPage';
import AdminContactsPage from './AdminContactsPage';

// Stats Component
const Stats = () => {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        adminAPI.getStats().then(res => setStats(res.data.data)).catch(console.error);
    }, []);

    if (!stats) return <div className="animate-pulse"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}</div></div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card"><p className="text-3xl font-bold text-primary-600">{stats.users?.total || 0}</p><p className="text-gray-600">Total Users</p></div>
            <div className="card"><p className="text-3xl font-bold text-green-600">{stats.users?.active || 0}</p><p className="text-gray-600">Active Users</p></div>
            <div className="card"><p className="text-3xl font-bold text-blue-600">{stats.trips?.total || 0}</p><p className="text-gray-600">Total Trips</p></div>
            <div className="card"><p className="text-3xl font-bold text-red-600">{stats.reports?.pending || 0}</p><p className="text-gray-600">Pending Reports</p></div>
        </div>
    );
};

// Users Management
const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getAllUsers({ limit: 50 });
            setUsers(response.data.data.users || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleVerify = async (id) => {
        try { await adminAPI.updateUserStatus(id, { isVerified: true }); toast.success('User verified'); fetchUsers(); }
        catch (error) { toast.error('Failed to verify user'); }
    };

    const handleSuspend = async (id, currentStatus) => {
        try { await adminAPI.updateUserStatus(id, { isSuspended: !currentStatus }); toast.success('User status updated'); fetchUsers(); }
        catch (error) { toast.error('Failed to update user'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try { await adminAPI.deleteUser(id); toast.success('User deleted'); fetchUsers(); }
        catch (error) { toast.error('Failed to delete user'); }
    };

    if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>)}</div>;

    return (
        <div className="card overflow-hidden">
            <h3 className="font-semibold text-lg mb-4">User Management</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr><th className="px-4 py-2 text-left">User</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Actions</th></tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="px-4 py-3 flex items-center space-x-2">
                                    <img src={u.profile?.profilePicture || '/default-avatar.svg'} alt="" className="w-8 h-8 rounded-full" />
                                    <span>{u.profile?.fullName || 'Unknown'}</span>
                                </td>
                                <td className="px-4 py-3">{u.email}</td>
                                <td className="px-4 py-3">
                                    {u.isSuspended ? <span className="badge-danger">Suspended</span> : u.isVerified ? <span className="badge-success">Verified</span> : <span className="badge-warning">Unverified</span>}
                                </td>
                                <td className="px-4 py-3 flex space-x-2">
                                    {!u.isVerified && !u.isSuspended && <button onClick={() => handleVerify(u.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><HiCheck className="w-5 h-5" /></button>}
                                    <button onClick={() => handleSuspend(u.id, u.isSuspended)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"><HiBan className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><HiTrash className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Reports Management
const ReportsManagement = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        adminAPI.getReports({ status: 'pending' }).then(res => setReports(res.data.data.reports || [])).catch(console.error);
    }, []);

    const handleResolve = async (id, action) => {
        try {
            await adminAPI.resolveReport(id, { status: 'resolved', actionTaken: action });
            toast.success('Report resolved');
            setReports(reports.filter(r => r.id !== id));
        } catch (error) { toast.error('Failed to resolve'); }
    };

    return (
        <div className="card">
            <h3 className="font-semibold text-lg mb-4">Pending Reports ({reports.length})</h3>
            {reports.length > 0 ? (
                <div className="space-y-4">
                    {reports.map(r => (
                        <div key={r.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="badge-warning capitalize">{r.reportType}</span>
                                <span className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600">{r.description || 'No description'}</p>
                            <p className="text-xs text-gray-400 mt-2">Reported by: {r.reporter?.profile?.fullName} | Target: {r.reportedUser?.profile?.fullName}</p>
                            <div className="flex space-x-2 mt-3">
                                <button onClick={() => handleResolve(r.id, 'dismiss')} className="btn-secondary text-sm">Dismiss</button>
                                <button onClick={() => handleResolve(r.id, 'suspend')} className="btn-danger text-sm">Suspend User</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-500">No pending reports</p>}
        </div>
    );
};

// Admin Profile Upload
const AdminProfile = () => {
    const { user, updateUser } = useAuth();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await userAPI.uploadProfilePicture(formData);
            updateUser({ profile: { ...user.profile, profilePicture: response.data.data.profilePicture } });
            toast.success('Admin profile picture updated!');
        } catch (error) {
            toast.error('Failed to upload image');
        }
    };

    return (
        <div className="card max-w-2xl mx-auto mt-8">
            <h3 className="font-semibold text-xl mb-6">Admin Profile Picture</h3>
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                    <img
                        src={user?.profile?.profilePicture || '/default-avatar.svg'}
                        alt="Admin Profile"
                        className="w-40 h-40 rounded-full object-cover border-4 border-primary-100 shadow-md"
                    />
                    <label className="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 shadow-lg transition-transform hover:scale-110">
                        <HiCamera className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>
                <div className="text-center">
                    <p className="text-gray-900 font-medium text-lg">{user?.profile?.fullName || 'Admin User'}</p>
                    <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-4">JPG, PNG, GIF up to 5MB</p>
                </div>
            </div>
        </div>
    );
};

// Main Admin Dashboard
const AdminDashboard = () => {
    const location = useLocation();
    const tabs = [
        { path: '/admin', icon: HiChartBar, label: 'Overview' },
        { path: '/admin/users', icon: HiUsers, label: 'Users' },
        { path: '/admin/verifications', icon: HiShieldCheck, label: 'Verifications' },
        { path: '/admin/services', icon: HiTruck, label: 'Services' },
        { path: '/admin/reports', icon: HiFlag, label: 'Reports' },
        { path: '/admin/bookings', icon: HiCreditCard, label: 'Bookings' },
        { path: '/admin/contacts', icon: HiMail, label: 'Enquiries' },
        { path: '/admin/profile', icon: HiUser, label: 'Profile' },
    ];

    return (
        <div className="container-custom py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b">
                {tabs.map(tab => (
                    <Link key={tab.path} to={tab.path}
                        className={`flex items-center px-4 py-2 border-b-2 -mb-px ${location.pathname === tab.path ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                        <tab.icon className="w-5 h-5 mr-2" /> {tab.label}
                    </Link>
                ))}
            </div>

            {/* Content */}
            <Routes>
                <Route path="/" element={<><Stats /><div className="grid md:grid-cols-2 gap-6"><UsersManagement /><ReportsManagement /></div></>} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/verifications" element={<VerificationsAdminPage />} />
                <Route path="/services" element={<AdminServicesPage />} />
                <Route path="/reports" element={<ReportsManagement />} />
                <Route path="/bookings" element={<AdminBookingsPage />} />
                <Route path="/contacts" element={<AdminContactsPage />} />
                <Route path="/profile" element={<AdminProfile />} />
            </Routes>
        </div>
    );
};

export default AdminDashboard;
