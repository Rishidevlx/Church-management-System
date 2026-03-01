import React, { useState, useEffect } from 'react';
import {
    UsersIcon, SearchIcon, FilterIcon, EditIcon,
    LockIcon, LogOutIcon, MoreVerticalIcon
} from '../../components/Icons';
import { Admin, ActivityLog } from '../../types';
import { API_URL } from '../../config';

// Let's create a local TrashIcon since it's common for delete actions
const TrashIcon: React.FC<{ size?: number, className?: string }> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const CheckCircleIcon: React.FC<{ size?: number, className?: string }> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const XCircleIcon: React.FC<{ size?: number, className?: string }> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

interface AdminListProps {
    admins: Admin[];
    onUpdateAdmin: (admin: Admin) => void;
    onDeleteAdmin: (id: string) => void;
    onAddLog: (log: ActivityLog) => void;
}

export const AdminList: React.FC<AdminListProps> = ({ admins, onUpdateAdmin, onDeleteAdmin, onAddLog }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Modal states
    const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Admin>>({});

    useEffect(() => {
        if (adminToEdit) {
            setEditFormData({
                name: adminToEdit.name,
                phone: adminToEdit.phone,
                status: adminToEdit.status
            });
        }
    }, [adminToEdit]);

    const handleSaveEdit = async () => {
        if (!adminToEdit) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admins/${adminToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editFormData.name,
                    phone: editFormData.phone,
                    status: editFormData.status
                })
            });

            if (!res.ok) throw new Error('Failed to update admin');

            onUpdateAdmin({
                ...adminToEdit,
                name: editFormData.name || adminToEdit.name,
                phone: editFormData.phone || adminToEdit.phone,
                status: editFormData.status || adminToEdit.status
            });

            onAddLog({
                id: Date.now().toString(),
                adminName: 'Super Admin',
                action: 'Admin Updated',
                module: 'Admin Management',
                description: `Updated profile details for @${adminToEdit.username}`,
                timestamp: new Date().toISOString()
            });

            showToast('success', 'Admin details updated successfully.');
            setAdminToEdit(null);
        } catch (error) {
            console.error(error);
            showToast('error', 'Failed to update admin details.');
        }
    };

    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMessage({ type, text });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleStatusToggle = async (admin: Admin) => {
        const newStatus = admin.status === 'active' ? 'inactive' : 'active';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admins/${admin.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update status');

            onUpdateAdmin({ ...admin, status: newStatus });

            onAddLog({
                id: Date.now().toString(),
                adminName: 'Super Admin',
                action: newStatus === 'active' ? 'Admin Enabled' : 'Admin Disabled',
                module: 'Admin Management',
                description: `Changed access status for ${admin.name} to ${newStatus.toUpperCase()}`,
                timestamp: new Date().toISOString()
            });

            showToast('success', `${admin.name} account is now ${newStatus}.`);
        } catch (error) {
            console.error(error);
            showToast('error', 'Failed to update admin status.');
        }
    };

    const handleResetPassword = (admin: Admin) => {
        // Mock action
        onAddLog({
            id: Date.now().toString(),
            adminName: 'Super Admin',
            action: 'Password Reset',
            module: 'Admin Management',
            description: `Triggered password reset link for ${admin.name}`,
            timestamp: new Date().toISOString()
        });

        showToast('success', `Password reset link sent to ${admin.email}`);
    };

    const handleDeleteClick = (admin: Admin) => {
        if (admin.username === 'superadmin') {
            showToast('error', 'Cannot delete the primary Super Admin account.');
            return;
        }
        setAdminToDelete(admin);
    };

    const confirmDelete = async () => {
        if (!adminToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admins/${adminToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete admin');
            }

            onDeleteAdmin(adminToDelete.id);
            onAddLog({
                id: Date.now().toString(),
                adminName: 'Super Admin',
                action: 'Admin Deleted',
                module: 'Admin Management',
                description: `Permanently deleted admin account: ${adminToDelete.name}`,
                timestamp: new Date().toISOString()
            });
            showToast('success', 'Admin account deleted successfully.');
            setAdminToDelete(null);
        } catch (error: any) {
            console.error(error);
            showToast('error', error.message || 'Failed to delete admin account.');
        }
    };

    const filteredAdmins = admins.filter(a => {
        const matchesSearch =
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-12">

            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed top-24 right-8 border px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 animate-slideInRight z-50 ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    <div className={`p-1 rounded-full text-white ${toastMessage.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {toastMessage.type === 'success' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <XCircleIcon size={16} />
                        )}
                    </div>
                    <span className="font-bold">{toastMessage.text}</span>
                </div>
            )}

            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Administrators</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage all admin accounts, their status, and security actions.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                        <FilterIcon size={16} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Administrator</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <UsersIcon size={32} className="text-slate-300" />
                                            <p className="font-medium text-slate-600">No administrators found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
                                                    {admin.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">@{admin.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700 font-medium">{admin.email}</div>
                                            <div className="text-xs text-slate-500">{admin.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${admin.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {admin.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {admin.lastLogin
                                                ? new Date(admin.lastLogin).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                                                : <span className="text-slate-400 italic">Never logged in</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setAdminToEdit(admin)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-100"
                                                    title="Edit Admin"
                                                >
                                                    <EditIcon size={18} />
                                                </button>


                                                {admin.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleStatusToggle(admin)}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                                        title="Disable Account"
                                                    >
                                                        <XCircleIcon size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusToggle(admin)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                        title="Enable Account"
                                                    >
                                                        <CheckCircleIcon size={18} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteClick(admin)}
                                                    disabled={admin.username === 'superadmin'}
                                                    className={`p-2 rounded-lg transition-colors border border-transparent ${admin.username === 'superadmin'
                                                        ? 'text-slate-300 cursor-not-allowed'
                                                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                                                        }`}
                                                    title="Delete Account"
                                                >
                                                    <TrashIcon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <p className="text-slate-500 font-medium">Showing <span className="font-bold text-slate-900">{filteredAdmins.length}</span> administrators</p>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 bg-slate-50 cursor-not-allowed font-medium">Previous</button>
                        <button disabled className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 bg-slate-50 cursor-not-allowed font-medium">Next</button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {adminToDelete && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                                <TrashIcon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Administrator?</h3>
                            <p className="text-slate-500 text-sm">
                                Are you sure you want to permanently delete <strong className="text-slate-700">{adminToDelete.name}</strong>? This action cannot be undone and will remove all their access.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setAdminToDelete(null)}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Admin Modal */}
            {adminToEdit && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">Edit Administrator</h3>
                            <button onClick={() => setAdminToEdit(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
                                <XCircleIcon size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Account Status</label>
                                <select
                                    value={editFormData.status || 'inactive'}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="pt-2 text-xs bg-brand-50 text-brand-700 p-3 rounded-xl border border-brand-100 flex flex-col gap-1">
                                <div className="font-bold">Note:</div>
                                <div>Username and Email are used for login credentials and cannot be changed here. Use the Action tools to reset passwords if needed.</div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setAdminToEdit(null)}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <CheckCircleIcon size={16} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
