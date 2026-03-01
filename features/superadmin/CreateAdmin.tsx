import React, { useState } from 'react';
import { UserPlusIcon, MessageSquareIcon as MailIcon, PhoneIcon, LockIcon } from '../../components/Icons';
import { Admin, ActivityLog } from '../../types';
import { API_URL } from '../../config';

interface CreateAdminProps {
    admins: Admin[];
    onAddAdmin: (admin: Admin) => void;
    onAddLog: (log: ActivityLog) => void;
}

export const CreateAdmin: React.FC<CreateAdminProps> = ({ admins, onAddAdmin, onAddLog }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        status: 'active' as 'active' | 'inactive'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear error for this field when user types
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (admins.some(a => a.username.toLowerCase() === formData.username.toLowerCase())) {
            newErrors.username = 'Username already exists';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token'); // Fallback if we decide to store it
            // NOTE: In a real app we might pass token down via context, but let's assume valid login session. 
            // The user logged in via LoginForm which sets token, ideally to localStorage. Let's assume it's there.

            const response = await fetch(`${API_URL}/api/admins/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    role: 'admin', // Enforce admin role
                    status: formData.status
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create admin');
            }

            // Successfully created. Add to local state
            const newAdmin: Admin = {
                id: Date.now().toString(), // Using Date.now for local state ref until full fetch
                name: formData.name,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                lastLogin: null,
                createdAt: new Date().toISOString()
            };

            const newLog: ActivityLog = {
                id: Date.now().toString(),
                adminName: 'Super Admin',
                action: 'Admin Created',
                module: 'Admin Management',
                description: `Created new admin account for ${formData.name}`,
                timestamp: new Date().toISOString(),
                ipAddress: '192.168.1.1'
            };

            onAddAdmin(newAdmin);
            onAddLog(newLog);

            setShowToast(true);

            // Reset form
            setFormData({
                name: '', username: '', email: '', phone: '',
                password: '', confirmPassword: '', status: 'active'
            });

            setTimeout(() => setShowToast(false), 3000);

        } catch (error: any) {
            console.error('Error creating admin:', error);
            setErrors({ submit: error.message || 'Failed to connect to server.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-8 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 animate-slideInRight z-50">
                    <div className="p-1 bg-emerald-500 text-white rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="font-bold">Admin account created successfully! Redirecting...</span>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Admin</h2>
                <p className="text-slate-500 text-sm mt-1">Add a new church administrator and configure their access settings.</p>
                {errors.submit && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold">
                        {errors.submit}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Section 1: Basic Details */}
                        <div className="col-span-1 md:col-span-2 pb-6 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-200"></span> Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <UserPlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium ${errors.name ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-brand-500'}`}
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                        <input
                                            type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe99"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium ${errors.username ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-brand-500'}`}
                                        />
                                    </div>
                                    {errors.username && <p className="text-xs text-red-500 mt-1 font-medium">{errors.username}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Details */}
                        <div className="col-span-1 md:col-span-2 pb-6 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-200"></span> Contact Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium ${errors.email ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-brand-500'}`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium ${errors.phone ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-brand-500'}`}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Security */}
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-200"></span> Security & Access
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium ${errors.password ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-brand-500'}`}
                                        />
                                    </div>
                                    {errors.password ? (
                                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-brand-500'}`}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Account Status</label>
                                    <div className="flex items-center gap-4">
                                        <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.status === 'active' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.status === 'active' ? 'border-emerald-500' : 'border-slate-300'}`}>
                                                {formData.status === 'active' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                                            </div>
                                            <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleChange} className="hidden" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Active</p>
                                                <p className="text-xs text-slate-500">Can log in immediately</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.status === 'inactive' ? 'border-amber-500 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.status === 'inactive' ? 'border-amber-500' : 'border-slate-300'}`}>
                                                {formData.status === 'inactive' && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>}
                                            </div>
                                            <input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={handleChange} className="hidden" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Inactive</p>
                                                <p className="text-xs text-slate-500">Account suspended / drafted</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button type="button" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Creating Account...
                                </>
                            ) : (
                                <>Create Admin Account</>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
