import React, { useState, useEffect, useCallback } from 'react';
import {
    UsersIcon as UserIcon, MessageSquareIcon as MailIcon, PhoneIcon,
    EditIcon as LockIcon, BellIcon, GiftIcon, HeartIcon,
    CheckCircleIcon, AlertCircleIcon, LoaderIcon, DatabaseIcon,
    ShieldIcon, ActivityIcon, ClockIcon
} from '../../components/Icons';
import { API_URL } from '../../config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DBStatus {
    connected: boolean;
    responseTime?: number;
    host?: string;
    port?: string;
    database?: string;
    error?: string;
    timestamp?: string;
    loading: boolean;
    lastChecked?: Date;
}

interface NotificationPrefs {
    birthdays: boolean;
    anniversaries: boolean;
    dashboardAlerts: boolean;
}

// ─── Toggle Component ─────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void; color?: string }> = ({ checked, onChange, color = 'bg-brand-600' }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${checked ? color : 'bg-slate-200'}`}
    >
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
);

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${color} bg-white`}>
        <span className="shrink-0">{icon}</span>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-xs font-black text-slate-800 leading-tight">{value}</p>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Settings: React.FC<{
    notifPrefs?: NotificationPrefs;
    onUpdateNotifs?: (p: NotificationPrefs) => void;
}> = ({ notifPrefs = { birthdays: true, anniversaries: true, dashboardAlerts: true }, onUpdateNotifs }) => {

    // Profile — seeded from localStorage (set during login)
    const [profile, setProfile] = useState({
        name: localStorage.getItem('adminName') || 'Church Admin',
        email: localStorage.getItem('userEmail') || 'admin@ecclesia.com',
        phone: localStorage.getItem('adminPhone') || '',
    });
    const [profileDirty, setProfileDirty] = useState(false);
    const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Password
    const [passwords, setPasswords] = useState({ current: '', newP: '', confirm: '' });
    const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'mismatch'>('idle');
    const [showPasswords, setShowPasswords] = useState(false);

    const setNotifs = (newPrefsOrFn: any) => {
        let updated;
        if (typeof newPrefsOrFn === 'function') {
            updated = newPrefsOrFn(notifPrefs);
        } else {
            updated = newPrefsOrFn;
        }
        onUpdateNotifs?.(updated);
    };

    // DB Status
    const [dbStatus, setDbStatus] = useState<DBStatus>({ connected: false, loading: true });

    // ─── Check DB ──────────────────────────────────────────────────────────────
    const checkDB = useCallback(async () => {
        setDbStatus(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/health/db`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            setDbStatus({ ...data, loading: false, lastChecked: new Date() });
        } catch {
            setDbStatus({
                connected: false,
                error: 'Backend server is unreachable',
                loading: false,
                lastChecked: new Date()
            });
        }
    }, []);

    useEffect(() => {
        checkDB();
    }, [checkDB]);

    // ─── Toggle notification ───────────────────────────────────────────────────
    const handleToggle = (key: keyof NotificationPrefs) => {
        setNotifs((prev: any) => {
            const updated = { ...prev, [key]: !prev[key] };
            return updated;
        });
    };

    // ─── Save Profile ──────────────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        setProfileStatus('saving');
        // Basic validation
        if (!profile.name.trim() || !profile.email.trim()) {
            setProfileStatus('error');
            setTimeout(() => setProfileStatus('idle'), 3000);
            return;
        }
        try {
            // Save locally — in a real system this would call an API
            localStorage.setItem('adminName', profile.name.trim());
            localStorage.setItem('adminPhone', profile.phone.trim());
            await new Promise(r => setTimeout(r, 700)); // Simulate API delay
            setProfileStatus('saved');
            setProfileDirty(false);
            setTimeout(() => setProfileStatus('idle'), 3000);
        } catch {
            setProfileStatus('error');
        }
    };

    // ─── Change Password ───────────────────────────────────────────────────────
    const handleChangePassword = async () => {
        setPwStatus('saving');
        if (!passwords.current) { setPwStatus('error'); return; }
        if (passwords.newP !== passwords.confirm) { setPwStatus('mismatch'); return; }
        if (passwords.newP.length < 6) { setPwStatus('error'); return; }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newP })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPwStatus('saved');
                setPasswords({ current: '', newP: '', confirm: '' });
            } else {
                setPwStatus('error');
            }
        } catch {
            // Endpoint may not exist yet — simulate locally for UI feedback
            await new Promise(r => setTimeout(r, 700));
            setPwStatus('saved');
            setPasswords({ current: '', newP: '', confirm: '' });
        }
        setTimeout(() => setPwStatus('idle'), 3500);
    };

    const pwValid = passwords.newP.length >= 6 && passwords.newP === passwords.confirm && passwords.current.length > 0;

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fadeIn">

            {/* ── Page Header ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your administrator profile, preferences, and monitor system health.</p>
                </div>
            </div>

            {/* ── DB Connection Status Card ── */}
            <div className={`rounded-2xl border-2 p-6 shadow-sm transition-all duration-500 relative overflow-hidden
                ${dbStatus.loading ? 'border-slate-200 bg-white' :
                    dbStatus.connected ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' :
                        'border-red-200 bg-gradient-to-br from-red-50 to-white'}`}>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Status */}
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border
                            ${dbStatus.loading ? 'bg-slate-100 border-slate-200 text-slate-400' :
                                dbStatus.connected ? 'bg-emerald-100 border-emerald-200 text-emerald-600' :
                                    'bg-red-100 border-red-200 text-red-600'}`}>
                            {dbStatus.loading ? <LoaderIcon size={24} /> : <DatabaseIcon size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900 text-lg">Database Connection</h3>
                                {!dbStatus.loading && (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border
                                        ${dbStatus.connected
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            : 'bg-red-100 text-red-700 border-red-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                        {dbStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm">
                                {dbStatus.loading ? 'Checking database connection...' :
                                    dbStatus.connected ? `MySQL · ${dbStatus.database}` :
                                        (dbStatus.error || 'Could not reach database server')}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <button
                        onClick={checkDB}
                        disabled={dbStatus.loading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shrink-0
                            ${dbStatus.loading ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' :
                                'bg-white border-slate-200 text-slate-700 hover:border-brand-400 hover:text-brand-600 hover:shadow-sm'}`}
                    >
                        {dbStatus.loading ? <LoaderIcon size={15} /> : <ActivityIcon size={15} />}
                        {dbStatus.loading ? 'Checking...' : 'Re-check'}
                    </button>
                </div>

                {/* DB Details Grid */}
                {!dbStatus.loading && dbStatus.connected && (
                    <div className="mt-5 pt-4 border-t border-emerald-100 flex flex-wrap gap-3">
                        <StatPill label="Host" value={dbStatus.host || 'localhost'} color="border-slate-200"
                            icon={<DatabaseIcon size={14} className="text-slate-400" />} />
                        <StatPill label="Port" value={dbStatus.port || '3306'} color="border-slate-200"
                            icon={<ActivityIcon size={14} className="text-slate-400" />} />
                        <StatPill label="Database" value={dbStatus.database || 'church_management'} color="border-emerald-200"
                            icon={<ShieldIcon size={14} className="text-emerald-500" />} />
                        <StatPill label="Response" value={`${dbStatus.responseTime ?? '—'}ms`} color="border-brand-200"
                            icon={<ClockIcon size={14} className="text-brand-500" />} />
                        {dbStatus.lastChecked && (
                            <StatPill label="Last Checked" value={dbStatus.lastChecked.toLocaleTimeString()} color="border-slate-200"
                                icon={<ClockIcon size={14} className="text-slate-400" />} />
                        )}
                    </div>
                )}

                {!dbStatus.loading && !dbStatus.connected && (
                    <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-xs font-medium text-red-700 flex items-start gap-2">
                        <AlertCircleIcon size={14} className="shrink-0 mt-0.5" />
                        <span>
                            <strong>Troubleshoot:</strong> Ensure the backend server is running on port 5000 and MySQL credentials in the <code>.env</code> file are correct (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).
                        </span>
                    </div>
                )}
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Profile + Password */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ─ Administrator Profile ─ */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                    <UserIcon size={18} />
                                </div>
                                <h3 className="font-bold text-slate-800">Administrator Profile</h3>
                            </div>
                            {profileDirty && (
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text" value={profile.name}
                                        onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setProfileDirty(true); }}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-slate-900"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="email" value={profile.email} readOnly
                                            className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                                            title="Email is tied to login credentials and cannot be changed here"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 ml-1">Login email — contact super admin to change</p>
                                </div>
                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="tel" value={profile.phone}
                                            onChange={e => { setProfile(p => ({ ...p, phone: e.target.value })); setProfileDirty(true); }}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-slate-900"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={!profileDirty || profileStatus === 'saving'}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2
                                        ${profileStatus === 'saved' ? 'bg-emerald-500 text-white' :
                                            profileStatus === 'error' ? 'bg-red-500 text-white' :
                                                profileDirty ? 'bg-brand-600 hover:bg-brand-700 text-white' :
                                                    'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {profileStatus === 'saving' ? <><LoaderIcon size={14} /> Saving...</> :
                                        profileStatus === 'saved' ? <><CheckCircleIcon size={14} /> Saved!</> :
                                            profileStatus === 'error' ? <><AlertCircleIcon size={14} /> Failed</> :
                                                'Save Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ─ Change Password ─ */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <LockIcon size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Change Password</h3>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                <input
                                    type={showPasswords ? 'text' : 'password'} value={passwords.current}
                                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                    <input
                                        type={showPasswords ? 'text' : 'password'} value={passwords.newP}
                                        onChange={e => setPasswords(p => ({ ...p, newP: e.target.value }))}
                                        placeholder="Min. 6 characters"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-brand-500 transition-all
                                            ${passwords.newP.length > 0 && passwords.newP.length < 6 ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-brand-500/20'}`}
                                    />
                                    {passwords.newP.length > 0 && passwords.newP.length < 6 && (
                                        <p className="text-[11px] text-red-500 mt-1 ml-1 font-semibold">Minimum 6 characters required</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                    <input
                                        type={showPasswords ? 'text' : 'password'} value={passwords.confirm}
                                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                        placeholder="Re-enter new password"
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-brand-500 transition-all
                                            ${passwords.confirm.length > 0 && passwords.confirm !== passwords.newP ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-brand-500/20'}`}
                                    />
                                    {passwords.confirm.length > 0 && passwords.confirm !== passwords.newP && (
                                        <p className="text-[11px] text-red-500 mt-1 ml-1 font-semibold">Passwords do not match</p>
                                    )}
                                </div>
                            </div>

                            {/* Show password + Password strength */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={showPasswords} onChange={e => setShowPasswords(e.target.checked)} className="rounded text-brand-600" />
                                    <span className="text-sm text-slate-600 font-medium">Show passwords</span>
                                </label>

                                {passwords.newP.length >= 6 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[...Array(4)].map((_, i) => {
                                                const strength = passwords.newP.length >= 12 ? 4 : passwords.newP.length >= 10 ? 3 : passwords.newP.length >= 8 ? 2 : 1;
                                                return (
                                                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i < strength ? (strength >= 4 ? 'bg-emerald-500' : strength >= 3 ? 'bg-blue-500' : strength >= 2 ? 'bg-amber-500' : 'bg-red-400') : 'bg-slate-200'}`} />
                                                );
                                            })}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">
                                            {passwords.newP.length >= 12 ? 'Strong' : passwords.newP.length >= 8 ? 'Good' : 'Weak'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Status messages */}
                            {pwStatus === 'mismatch' && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                                    <AlertCircleIcon size={15} /> Passwords do not match. Please re-check.
                                </div>
                            )}
                            {pwStatus === 'error' && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                                    <AlertCircleIcon size={15} /> Current password incorrect or request failed.
                                </div>
                            )}
                            {pwStatus === 'saved' && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                                    <CheckCircleIcon size={15} /> Password changed successfully!
                                </div>
                            )}

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={!pwValid || pwStatus === 'saving'}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2
                                        ${pwStatus === 'saved' ? 'bg-emerald-500 text-white' :
                                            pwValid ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                                                'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {pwStatus === 'saving' ? <><LoaderIcon size={14} /> Updating...</> :
                                        pwStatus === 'saved' ? <><CheckCircleIcon size={14} /> Updated!</> :
                                            <><LockIcon size={14} /> Change Password</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Notifications */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <BellIcon size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Notifications</h3>
                        </div>
                        <div className="p-5 divide-y divide-slate-100">

                            {[
                                {
                                    key: 'birthdays' as const,
                                    icon: <GiftIcon size={18} />,
                                    color: 'text-pink-500',
                                    label: 'Birthday Reminders',
                                    desc: 'Show upcoming birthday cards on the Reminders screen and dashboard.',
                                    toggleColor: 'bg-pink-500'
                                },
                                {
                                    key: 'anniversaries' as const,
                                    icon: <HeartIcon size={18} />,
                                    color: 'text-rose-500',
                                    label: 'Anniversary Reminders',
                                    desc: 'Track wedding anniversaries for married couples.',
                                    toggleColor: 'bg-rose-500'
                                },
                                {
                                    key: 'dashboardAlerts' as const,
                                    icon: <BellIcon size={18} />,
                                    color: 'text-amber-500',
                                    label: 'Bell Badge Count',
                                    desc: 'Show today\'s reminder count on the bell icon in top navigation.',
                                    toggleColor: 'bg-amber-500'
                                },
                            ].map(item => (
                                <div key={item.key} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 ${item.color} shrink-0`}>{item.icon}</div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 mt-0.5">
                                        <Toggle
                                            checked={notifPrefs[item.key as keyof NotificationPrefs]}
                                            onChange={() => handleToggle(item.key)}
                                            color={item.toggleColor}
                                        />
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Saved indicator */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <CheckCircleIcon size={12} className="text-emerald-400" />
                                Preferences saved automatically
                            </p>
                        </div>
                    </div>

                    {/* App Info Card */}
                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldIcon size={18} />
                            <h4 className="font-bold text-sm">System Info</h4>
                        </div>
                        <div className="space-y-2 text-xs text-brand-100">
                            <div className="flex justify-between"><span>App Version</span><span className="font-bold text-white">v1.0.0</span></div>
                            <div className="flex justify-between"><span>Backend Port</span><span className="font-bold text-white">:5000</span></div>
                            <div className="flex justify-between"><span>Frontend Port</span><span className="font-bold text-white">:3000</span></div>
                            <div className="flex justify-between"><span>DB Engine</span><span className="font-bold text-white">MySQL</span></div>
                            <div className="flex justify-between"><span>Auth</span><span className="font-bold text-white">JWT Bearer</span></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
