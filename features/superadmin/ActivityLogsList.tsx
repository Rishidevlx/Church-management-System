import React, { useState, useMemo } from 'react';
import { ActivityIcon, SearchIcon, FilterIcon, CalendarIcon, ShieldIcon } from '../../components/Icons';
import { ActivityLog } from '../../types';

interface ActivityLogsListProps {
    logs: ActivityLog[];
}

export const ActivityLogsList: React.FC<ActivityLogsListProps> = ({ logs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState('all');
    const [moduleFilter, setModuleFilter] = useState('all');

    // Extract unique admins and modules for filter dropdowns
    const uniqueAdmins = useMemo(() => Array.from(new Set(logs.map(l => l.adminName))), [logs]);
    const uniqueModules = useMemo(() => Array.from(new Set(logs.map(l => l.module))), [logs]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAdmin = adminFilter === 'all' || log.adminName === adminFilter;
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

        return matchesSearch && matchesAdmin && matchesModule;
    });

    return (
        <div className="space-y-6 pb-12">

            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Activity Logs</h2>
                    <p className="text-slate-500 text-sm mt-1">Comprehensive audit trail of all administrative actions securely recorded.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search actions or descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 font-medium"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">

                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                        <ActivityIcon size={16} className="text-slate-400" />
                        <select
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto"
                        >
                            <option value="all">All Modules</option>
                            {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Administrator</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">Module & Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <ActivityIcon size={32} className="text-slate-300" />
                                            <p className="font-medium text-slate-600">No activity logs found</p>
                                            <p className="text-sm">Try adjusting your filters or performing an action first.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => {
                                    const date = new Date(log.timestamp);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-start gap-2">
                                                    <CalendarIcon size={16} className="text-slate-400 mt-0.5" />
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-700">{date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                        {(log.adminName || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-800">{log.adminName}</span>
                                                </div>
                                                {log.ipAddress && <div className="text-[10px] text-slate-400 mt-1 font-mono tracking-tight ml-8">{log.ipAddress}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                                                    {log.module}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">{log.action}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed font-medium">
                                                {log.description}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm bg-slate-50/30">
                    <p className="text-slate-500 font-medium">Showing <span className="font-bold text-slate-900">{filteredLogs.length}</span> log entries</p>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 bg-white cursor-not-allowed font-medium shadow-sm">Previous</button>
                        <button disabled className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 bg-white cursor-not-allowed font-medium shadow-sm">Next</button>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-brand-50 rounded-2xl p-6 border border-brand-100 flex items-start gap-4">
                <div className="p-2 bg-brand-100 text-brand-600 rounded-lg shrink-0">
                    <ShieldIcon size={24} />
                </div>
                <div>
                    <h4 className="text-brand-900 font-bold mb-1">Audit Trail Active</h4>
                    <p className="text-brand-700/80 text-sm leading-relaxed">
                        Every critical action performed within the Super Admin and Admin dashboards is permanently logged for compliance and security monitoring.
                        These logs cannot be deleted or modified by standard administrators.
                    </p>
                </div>
            </div>

        </div>
    );
};
