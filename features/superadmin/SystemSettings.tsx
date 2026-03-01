import React, { useState, useEffect } from 'react';
import { HomeIcon, MessageSquareIcon as MailIcon, PhoneIcon, MapPinIcon, ShieldIcon, CheckCircleIcon, LockIcon } from '../../components/Icons';
import { ActivityLog } from '../../types';
import { API_URL } from '../../config';

interface SystemSettingsProps {
    onAddLog: (log: ActivityLog) => void;
    globalLogo?: string;
    onUpdateLogo?: (logo: string) => void;
    onUpdateName?: (name: string) => void;
    onUpdateAddress?: (address: string) => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onAddLog, globalLogo, onUpdateLogo, onUpdateName, onUpdateAddress }) => {
    const [churchInfo, setChurchInfo] = useState({
        name: 'Ecclesia Central Church',
        address: '123 Holy Way, Grace Avenue, 40001',
        email: 'contact@ecclesiacentral.com',
        phone: '+91 9876543210'
    });

    const [toggles, setToggles] = useState({
        confirmDelete: true,
        twoFactorAuth: false
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/settings`);
                const data = await res.json();
                if (data.success) {
                    const settings = data.settings;
                    setChurchInfo({
                        name: settings.name || '',
                        address: settings.address || '',
                        email: settings.email || '',
                        phone: settings.phone || ''
                    });
                    setToggles({
                        confirmDelete: settings.confirm_delete === 1 || settings.confirm_delete === true,
                        twoFactorAuth: settings.two_factor_auth === 1 || settings.two_factor_auth === true
                    });
                    if (settings.global_logo && onUpdateLogo) {
                        onUpdateLogo(settings.global_logo);
                    }
                }
            } catch (error) {
                console.error('Failed to load system settings', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [onUpdateLogo]);

    // File upload logic
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string' && onUpdateLogo) {
                    onUpdateLogo(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChurchInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            await fetch(`${API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: churchInfo.name,
                    address: churchInfo.address,
                    email: churchInfo.email,
                    phone: churchInfo.phone,
                    global_logo: globalLogo || '',
                    confirm_delete: toggles.confirmDelete,
                    two_factor_auth: toggles.twoFactorAuth
                })
            });

            onAddLog({
                id: Date.now().toString(),
                adminName: 'Super Admin',
                action: 'System Settings Updated',
                module: 'Settings',
                description: 'Updated global church configuration and safety parameters.',
                timestamp: new Date().toISOString()
            });

            if (onUpdateName) onUpdateName(churchInfo.name);
            if (onUpdateAddress) onUpdateAddress(churchInfo.address);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-8 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 animate-slideInRight z-50">
                    <div className="p-1 bg-emerald-500 text-white rounded-full">
                        <CheckCircleIcon size={16} />
                    </div>
                    <span className="font-bold">System settings saved successfully.</span>
                </div>
            )}

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure global application variables and church information.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Church Information */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                            <HomeIcon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">Church Information</h3>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">

                        <div className="flex items-start gap-6 border-b border-slate-100 pb-8">
                            <label className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-brand-400 transition-colors shrink-0 overflow-hidden relative group">
                                {globalLogo ? (
                                    <img src={globalLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-brand-600">Logo</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all">
                                    <span className="text-white text-xs font-bold">Upload</span>
                                </div>
                                <input type="file" accept="image/png, image/jpeg, image/jpg, image/svg+xml" className="hidden" onChange={handleFileChange} />
                            </label>
                            <div className="flex-1 mt-2">
                                <h4 className="text-sm font-bold text-slate-800 mb-1">Organization Logo</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">Upload your church logo. Recommended size is 256x256 pixels in PNG or JPG format.</p>
                                <label className="px-4 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer inline-block">
                                    Browse Files
                                    <input type="file" accept="image/png, image/jpeg, image/jpg, image/svg+xml" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Church Name</label>
                                <div className="relative">
                                    <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text" name="name" value={churchInfo.name} onChange={handleInfoChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Complete Address</label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text" name="address" value={churchInfo.address} onChange={handleInfoChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Official Email</label>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email" name="email" value={churchInfo.email} onChange={handleInfoChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Contact Number</label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="tel" name="phone" value={churchInfo.phone} onChange={handleInfoChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Global Safety Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <ShieldIcon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">Security & Overrides</h3>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">

                        {/* Toggle Item */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400"><ShieldIcon size={18} /></div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Verification before Delete</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Require administrators to confirm destructive actions like deleting a member or admin account.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('confirmDelete')}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${toggles.confirmDelete ? 'bg-brand-600' : 'bg-slate-200'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles.confirmDelete ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>



                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? 'Saving Configurations...' : 'Save System Settings'}
                    </button>
                </div>

            </form>

        </div>
    );
};
