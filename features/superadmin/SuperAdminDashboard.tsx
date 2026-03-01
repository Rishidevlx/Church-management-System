import React from 'react';
import {
    UsersIcon, ShieldIcon, HomeIcon, GiftIcon, HeartIcon, ActivityIcon,
    SettingsIcon, ClockIcon, DatabaseIcon
} from '../../components/Icons';
import { Admin, ActivityLog } from '../../types';

// Let's create a local ShieldIcon if not exported in Icons.tsx (using standard feather-icons shield)
const ShieldCheckIcon: React.FC<{ size?: number, className?: string }> = ({ size = 24, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

interface SuperAdminDashboardProps {
    admins: Admin[];
    logs: ActivityLog[];
    families: number;
    members: number;
    todayBirthdays: number;
    todayAnniversaries: number;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
    admins, logs, families, members, todayBirthdays, todayAnniversaries
}) => {

    const activeAdminsToday = admins.filter(a => {
        if (!a.lastLogin) return false;
        const loginDate = new Date(a.lastLogin).toDateString();
        const today = new Date().toDateString();
        return loginDate === today && a.status === 'active';
    }).length;

    const stats = [
        {
            title: 'Total System Admins',
            value: admins.length.toString(),
            subtext: `${admins.filter(a => a.status === 'active').length} active records`,
            icon: <ShieldCheckIcon size={24} />,
            color: 'bg-brand-50 text-brand-600',
            border: 'border-brand-200'
        },
        {
            title: 'Active Admins Today',
            value: activeAdminsToday.toString(),
            subtext: 'Logged in last 24h',
            icon: <ActivityIcon size={24} />,
            color: 'bg-indigo-50 text-indigo-600',
            border: 'border-indigo-200'
        },
        {
            title: 'Total Families',
            value: families.toString(),
            subtext: 'Registered units',
            icon: <HomeIcon size={24} />,
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-200'
        },
        {
            title: 'Total Members',
            value: members.toString(),
            subtext: 'Including dependents',
            icon: <UsersIcon size={24} />,
            color: 'bg-emerald-50 text-emerald-600',
            border: 'border-emerald-200'
        },
        {
            title: 'Today\'s Birthdays',
            value: todayBirthdays.toString(),
            subtext: 'System alerts enabled',
            icon: <GiftIcon size={24} />,
            color: 'bg-pink-50 text-pink-600',
            border: 'border-pink-200'
        },
        {
            title: 'Today\'s Anniversaries',
            value: todayAnniversaries.toString(),
            subtext: 'System alerts enabled',
            icon: <HeartIcon size={24} />,
            color: 'bg-rose-50 text-rose-600',
            border: 'border-rose-200'
        }
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Dashboard</h2>
                    <p className="text-slate-500 text-sm mt-1">High-level overview of system metrics and admin activities.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        System Live
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                        <DatabaseIcon size={14} className="text-slate-500" />
                        Auto-Sync: ON
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {stats.map((stat, index) => (
                    <div key={index} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-slate-700 text-sm">{stat.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.subtext}</p>
                        </div>

                        {/* Decorative background element */}
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${stat.color.split(' ')[0]}`}></div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout for Activity and System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Admin Activity Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <ActivityIcon size={18} className="text-brand-600" />
                            <h3 className="font-bold text-slate-800">Recent Admin Activity</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">Last 50 actions</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 space-y-3">
                                <ActivityIcon size={40} className="text-slate-200" />
                                <p className="text-sm">No activity recorded yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {logs.slice(0, 50).map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                            {(log.adminName || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {log.action} <span className="font-medium text-slate-500">by {log.adminName}</span>
                                                </p>
                                                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 truncate">{log.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick System Status Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <SettingsIcon size={18} className="text-slate-600" />
                        <h3 className="font-bold text-slate-800">System Status</h3>
                    </div>
                    <div className="p-6 space-y-6">

                        <div className="flex items-start gap-4 p-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                                <ClockIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Reminder Engine</h4>
                                <p className="text-xs text-slate-500 mt-1">Status: <span className="text-emerald-600 font-bold">Active & Running</span></p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl border-l-4 border-brand-500 bg-brand-50/50">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-brand-600">
                                <DatabaseIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Database Connection</h4>
                                <p className="text-xs text-slate-500 mt-1">Status: <span className="text-brand-600 font-bold">Stable (Mock)</span></p>
                                <p className="text-xs text-slate-400 mt-1">Last Sync: {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 text-center leading-relaxed">
                                Super Admin views are isolated from standard Admin operations to ensure data integrity.
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
