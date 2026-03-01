import React, { useState, useMemo } from 'react';
import {
    PrinterIcon, FileTextIcon as FileSpreadsheetIcon, UsersIcon,
    HomeIcon, GiftIcon, HeartIcon, MapPinIcon, FilterIcon, SearchIcon,
    CalendarIcon, CheckCircleIcon, AlertTriangleIcon
} from '../../components/Icons';
import { Member, TAMIL_NADU_DISTRICTS } from '../../types';

interface PrintExportProps {
    members: Member[];
}

// --- CSV Utility ---
const escapeCSV = (str: string | undefined | null) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

const downloadCSV = (filename: string, headers: string[], data: any[][]) => {
    const csvContent = [
        headers.map(escapeCSV).join(','),
        ...data.map(row => row.map(escapeCSV).join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Date helpers
const isInDateRange = (dateStr: string | undefined, from: string, to: string): boolean => {
    if (!dateStr) return false;
    // Compare only month-day part for birthday/anniversary range
    const [year, month, day] = dateStr.split('-');
    if (!month || !day) return false;
    const mmdd = `${month}-${day}`;

    if (from && to) {
        const [fy, fm, fd] = from.split('-');
        const [ty, tm, td] = to.split('-');
        const fromMD = `${fm}-${fd}`;
        const toMD = `${tm}-${td}`;
        return mmdd >= fromMD && mmdd <= toMD;
    }
    if (from) {
        const [, fm, fd] = from.split('-');
        return mmdd >= `${fm}-${fd}`;
    }
    if (to) {
        const [, tm, td] = to.split('-');
        return mmdd <= `${tm}-${td}`;
    }
    return true;
};

const isCreatedInRange = (createdRaw: string | undefined, from: string, to: string): boolean => {
    if (!createdRaw) return !from && !to; // if no created date, only include when no filter
    const created = new Date(createdRaw);
    if (isNaN(created.getTime())) return !from && !to;
    const createdISO = created.toISOString().split('T')[0];
    if (from && createdISO < from) return false;
    if (to && createdISO > to) return false;
    return true;
};

export const PrintExport: React.FC<PrintExportProps> = ({ members }) => {
    // Global Filter State
    const [districtFilter, setDistrictFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dateField, setDateField] = useState<'dob' | 'doa' | 'created'>('created'); // which field to range-filter
    const [includeDNC, setIncludeDNC] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const hasActiveFilters = districtFilter || dateFrom || dateTo || !includeDNC;

    // --- Filtered member sets ---
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            if (!includeDNC && m.dnc) return false;
            if (districtFilter && m.district !== districtFilter) return false;
            if (dateField === 'created') {
                const raw = (m as any).created_at || (m as any).createdAt;
                if ((dateFrom || dateTo) && !isCreatedInRange(raw, dateFrom, dateTo)) return false;
            }
            return true;
        });
    }, [members, districtFilter, dateFrom, dateTo, dateField, includeDNC]);

    // All individuals from filtered members
    const getAllIndividuals = (src: Member[] = filteredMembers) => {
        const all: any[] = [];
        src.forEach(m => {
            all.push({ ...m, role: 'Head', ref_family: m.id });
            if (m.familyMembers) {
                m.familyMembers.forEach(fm => {
                    all.push({ ...fm, address: m.address, churchArea: m.churchArea, district: m.district, contactNo: fm.contactNo || m.contactNo, role: fm.relationship, ref_family: m.id, dnc: m.dnc });
                });
            }
        });
        return all;
    };

    // Birthday-filtered individuals
    const birthdayIndividuals = useMemo(() => {
        const all = getAllIndividuals();
        return all.filter(m => {
            if (!m.dob) return false;
            if (dateField === 'dob' && (dateFrom || dateTo)) {
                return isInDateRange(m.dob, dateFrom, dateTo);
            }
            return true;
        }).sort((a, b) => {
            const am = a.dob?.substring(5) || '';
            const bm = b.dob?.substring(5) || '';
            return am.localeCompare(bm);
        });
    }, [filteredMembers, dateFrom, dateTo, dateField]);

    // Anniversary-filtered members
    const anniversaryMembers = useMemo(() => {
        return filteredMembers.filter(m => {
            if (!m.doa || m.maritalStatus !== 'Married') return false;
            if (dateField === 'doa' && (dateFrom || dateTo)) {
                return isInDateRange(m.doa, dateFrom, dateTo);
            }
            return true;
        }).sort((a, b) => {
            const am = a.doa?.substring(5) || '';
            const bm = b.doa?.substring(5) || '';
            return am.localeCompare(bm);
        });
    }, [filteredMembers, dateFrom, dateTo, dateField]);

    const filterSuffix = () => {
        const parts: string[] = [];
        if (districtFilter) parts.push(districtFilter);
        if (dateFrom) parts.push(`from_${dateFrom}`);
        if (dateTo) parts.push(`to_${dateTo}`);
        return parts.length > 0 ? `_${parts.join('_')}` : '';
    };

    const filterMeta = () => {
        const parts: string[] = [];
        if (districtFilter) parts.push(`District: ${districtFilter}`);
        if (dateField === 'dob' && (dateFrom || dateTo)) parts.push(`DOB Range: ${dateFrom || '*'} – ${dateTo || '*'}`);
        if (dateField === 'doa' && (dateFrom || dateTo)) parts.push(`DOA Range: ${dateFrom || '*'} – ${dateTo || '*'}`);
        if (dateField === 'created' && (dateFrom || dateTo)) parts.push(`Added: ${dateFrom || '*'} – ${dateTo || '*'}`);
        if (!includeDNC) parts.push('Excluding DNC');
        return parts.length > 0 ? parts.join(' · ') : 'All Records';
    };

    // --- CSV Handlers ---
    const exportMembersCSV = () => {
        const data = getAllIndividuals();
        const headers = ["Member ID", "Name", "Role/Relation", "Gender", "DOB", "Contact", "Area", "District", "Family Ref"];
        const rows = data.map(m => [m.membershipId || '', m.name, m.role, m.gender || '', m.dob || '', m.contactNo || '', m.churchArea || '', m.district || '', m.ref_family]);
        downloadCSV(`Members_Export${filterSuffix()}`, headers, rows);
    };

    const exportFamiliesCSV = () => {
        const headers = ["Family ID", "Head Name", "Spouse", "Contact", "Address", "District", "Total Members"];
        const rows = filteredMembers.map(m => {
            const spouse = m.familyMembers?.find(f => ['wife', 'husband', 'spouse'].includes(f.relationship?.toLowerCase()));
            return [m.membershipId || '', m.name, spouse?.name || '', m.contactNo || '', m.address || '', m.district || '', (1 + (m.familyMembers?.length || 0)).toString()];
        });
        downloadCSV(`Families_Export${filterSuffix()}`, headers, rows);
    };

    const exportBirthdaysCSV = () => {
        const headers = ["Name", "Role/Relation", "DOB", "Month-Day", "Contact", "District", "Area", "Family Head"];
        const rows = birthdayIndividuals.map(m => [
            m.name, m.role, m.dob || '',
            m.dob ? m.dob.substring(5) : '',
            m.contactNo || '', m.district || '', m.churchArea || '',
            m.role === 'Head' ? m.name : m.ref_family
        ]);
        downloadCSV(`Birthdays_Export${filterSuffix()}`, headers, rows);
    };

    const exportAnniversariesCSV = () => {
        const headers = ["Couple Names", "DOA", "Month-Day", "Years Together", "Contact", "District", "Area"];
        const rows = anniversaryMembers.map(m => {
            const spouse = m.familyMembers?.find(f => ['wife', 'husband', 'spouse'].includes(f.relationship?.toLowerCase()));
            const doaYear = m.doa ? Number(m.doa.split('-')[0]) : 0;
            const yearsNow = doaYear > 0 ? new Date().getFullYear() - doaYear : '';
            return [
                m.name + (spouse ? ` & ${spouse.name}` : ''),
                m.doa || '', m.doa ? m.doa.substring(5) : '',
                yearsNow.toString(),
                m.contactNo || '', m.district || '', m.churchArea || ''
            ];
        });
        downloadCSV(`Anniversaries_Export${filterSuffix()}`, headers, rows);
    };

    const exportDistrictCSV = () => {
        const districts: Record<string, { families: number; members: number }> = {};
        filteredMembers.forEach(m => {
            const d = m.district || 'Unknown';
            if (!districts[d]) districts[d] = { families: 0, members: 0 };
            districts[d].families++;
            districts[d].members += (1 + (m.familyMembers?.length || 0));
        });
        const headers = ["District", "Total Families", "Total Members"];
        const rows = Object.entries(districts).sort().map(([d, s]) => [d, s.families.toString(), s.members.toString()]);
        downloadCSV(`District_Stats${filterSuffix()}`, headers, rows);
    };

    // --- Print Handler ---
    const handlePrintHTML = (title: string, headers: string[], rows: any[][], meta = '') => {
        const printSection = document.getElementById('print-section');
        if (!printSection) return;
        const tableRows = rows.map(r => `<tr>${r.map(td => `<td>${td ?? '-'}</td>`).join('')}</tr>`).join('');
        const headerHTML = `<tr>${headers.map(th => `<th>${th}</th>`).join('')}</tr>`;
        const formHTML = `
        <div class="print-content-wrapper">
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #1e293b; }
                h1 { text-align: center; font-size: 20px; margin-bottom: 2px; }
                .meta { text-align: center; color: #64748b; font-size: 11px; margin-bottom: 20px; }
                .filter-banner { background: #f0f9ff; border: 1px solid #bae6fd; padding: 6px 12px; border-radius: 6px; font-size: 11px; color: #0369a1; margin-bottom: 16px; text-align: center; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
                th { background: #f1f5f9; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                tr:nth-child(even) td { background: #f8fafc; }
                @media print { @page { margin: 1cm; size: landscape; } }
            </style>
            <h1>${title}</h1>
            <p class="meta">Generated: ${new Date().toLocaleString()} · Ecclesia Admin</p>
            ${meta ? `<div class="filter-banner">🔍 Filters: ${meta}</div>` : ''}
            <table><thead>${headerHTML}</thead><tbody>${tableRows}</tbody></table>
        </div>`;
        printSection.innerHTML = formHTML;
        setTimeout(() => {
            window.print();
            setTimeout(() => { printSection.innerHTML = ''; }, 100);
        }, 200);
    };

    const printMembers = () => {
        const data = getAllIndividuals();
        handlePrintHTML('Master Members List',
            ["#", "Name", "Role", "DOB", "Contact", "District", "Area"],
            data.map((m, i) => [i + 1, m.name, m.role, m.dob || '-', m.contactNo || '-', m.district || '-', m.churchArea || '-']),
            filterMeta()
        );
    };

    const printFamilies = () => {
        handlePrintHTML('Master Family List',
            ["#", "Head of Family", "Spouse", "Size", "Contact", "District"],
            filteredMembers.map((m, i) => {
                const spouse = m.familyMembers?.find(f => ['wife', 'husband', 'spouse'].includes(f.relationship?.toLowerCase()));
                return [i + 1, m.name, spouse?.name || '-', (1 + (m.familyMembers?.length || 0)).toString(), m.contactNo || '-', m.district || '-'];
            }),
            filterMeta()
        );
    };

    const printBirthdays = () => {
        handlePrintHTML('Birthday List',
            ["#", "Name", "Role", "DOB", "Month-Day", "Contact", "District"],
            birthdayIndividuals.map((m, i) => [i + 1, m.name, m.role, m.dob || '-', m.dob ? m.dob.substring(5) : '-', m.contactNo || '-', m.district || '-']),
            filterMeta()
        );
    };

    const printAnniversaries = () => {
        handlePrintHTML('Wedding Anniversary List',
            ["#", "Couple Names", "DOA", "Month-Day", "Contact", "District"],
            anniversaryMembers.map((m, i) => {
                const spouse = m.familyMembers?.find(f => ['wife', 'husband', 'spouse'].includes(f.relationship?.toLowerCase()));
                return [i + 1, m.name + (spouse ? ` & ${spouse.name}` : ''), m.doa || '-', m.doa ? m.doa.substring(5) : '-', m.contactNo || '-', m.district || '-'];
            }),
            filterMeta()
        );
    };

    const handleReset = () => {
        setDistrictFilter('');
        setDateFrom('');
        setDateTo('');
        setDateField('created');
        setIncludeDNC(false);
    };

    // Card config
    const allIndividuals = getAllIndividuals();
    const reports = [
        {
            id: 'members', title: 'Export Members',
            description: 'All individual members including family dependents.',
            icon: <UsersIcon size={22} />, color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-100',
            count: allIndividuals.length, countLabel: 'individuals',
            csvHandler: exportMembersCSV, printHandler: printMembers
        },
        {
            id: 'families', title: 'Export Families',
            description: 'Family head summary with spouse and size.',
            icon: <HomeIcon size={22} />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
            count: filteredMembers.length, countLabel: 'families',
            csvHandler: exportFamiliesCSV, printHandler: printFamilies
        },
        {
            id: 'birthdays', title: 'Export Birthdays',
            description: 'All members with DOB, sorted by month & day.',
            icon: <GiftIcon size={22} />, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100',
            count: birthdayIndividuals.length, countLabel: 'records',
            csvHandler: exportBirthdaysCSV, printHandler: printBirthdays
        },
        {
            id: 'anniversaries', title: 'Export Anniversaries',
            description: 'Married couples with their wedding anniversary date.',
            icon: <HeartIcon size={22} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100',
            count: anniversaryMembers.length, countLabel: 'couples',
            csvHandler: exportAnniversariesCSV, printHandler: printAnniversaries
        },
        {
            id: 'district', title: 'District Stats',
            description: 'Statistical summary grouped by Tamil Nadu district.',
            icon: <MapPinIcon size={22} />, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
            count: Object.keys(filteredMembers.reduce((acc, m) => { const d = m.district || 'Unknown'; acc[d] = 1; return acc; }, {} as any)).length, countLabel: 'districts',
            csvHandler: exportDistrictCSV, printHandler: null
        },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <PrinterIcon size={22} className="text-brand-600" />
                        Print &amp; Export Center
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Apply filters before exporting — filters affect all CSV &amp; Print reports below.</p>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    {hasActiveFilters && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                            <CheckCircleIcon size={13} /> Filters Active
                        </span>
                    )}
                    <button
                        onClick={() => setShowFilters(s => !s)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${showFilters ? 'bg-brand-600 text-white border-brand-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:text-brand-600'}`}
                    >
                        <FilterIcon size={16} />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                        <FilterIcon size={16} className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Export Filters</h3>
                        {(districtFilter || dateFrom || dateTo) && (
                            <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">
                                {[districtFilter && '1', (dateFrom || dateTo) && '1'].filter(Boolean).length} active
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                        {/* District */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <MapPinIcon size={12} /> District
                            </label>
                            <select
                                value={districtFilter}
                                onChange={e => setDistrictFilter(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                            >
                                <option value="">All Districts</option>
                                {TAMIL_NADU_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Date Field Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <CalendarIcon size={12} /> Date Range Applies To
                            </label>
                            <select
                                value={dateField}
                                onChange={e => { setDateField(e.target.value as any); setDateFrom(''); setDateTo(''); }}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                            >
                                <option value="created">Date Added (Created)</option>
                                <option value="dob">Date of Birth (MM-DD)</option>
                                <option value="doa">Anniversary Date (MM-DD)</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {dateField === 'created' ? 'Added After' : 'From (Date)'}
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {dateField === 'created' ? 'Added Before' : 'To (Date)'}
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>
                    </div>

                    {/* Second row: DNC + Reset + Active Filter Summary */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={includeDNC} onChange={e => setIncludeDNC(e.target.checked)} />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${includeDNC ? 'bg-red-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${includeDNC ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </div>
                                <span className={`text-xs font-bold ${includeDNC ? 'text-red-600' : 'text-slate-500'}`}>Include DNC Members</span>
                            </label>

                            {(districtFilter || dateFrom || dateTo) && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <SearchIcon size={12} className="text-slate-400" />
                                    <span className="text-xs text-slate-600 font-semibold">{filterMeta()}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Families', value: filteredMembers.length, total: members.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Individuals', value: allIndividuals.length, total: members.reduce((a, m) => a + 1 + (m.familyMembers?.length || 0), 0), color: 'text-brand-600', bg: 'bg-brand-50' },
                    { label: 'With DOB', value: birthdayIndividuals.length, total: null, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { label: 'Anniversaries', value: anniversaryMembers.length, total: null, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((s, i) => (
                    <div key={i} className={`${s.bg} rounded-2xl border border-white px-4 py-3 flex flex-col`}>
                        <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</span>
                        {s.total !== null && s.total !== s.value && (
                            <span className="text-xs text-slate-400 mt-0.5">of {s.total} total</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Export Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reports.map((report) => (
                    <div key={report.id}
                        className={`bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 relative overflow-hidden group`}
                    >
                        {/* Top accent line */}
                        <div className={`h-1 w-full ${report.bg.replace('bg-', 'bg-gradient-to-r from-').replace('-50', '-400')} rounded-t-2xl`}
                            style={{ background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }} />

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${report.bg} ${report.color} border ${report.border}`}>
                                    {report.icon}
                                </div>
                                {/* Live count badge */}
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${report.color}`}>{report.count}</span>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{report.countLabel}</p>
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-slate-800 mb-1">{report.title}</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-5 min-h-[32px]">{report.description}</p>

                            {report.count === 0 && (
                                <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    <AlertTriangleIcon size={12} /> No records match current filters
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={report.csvHandler}
                                    disabled={report.count === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <FileSpreadsheetIcon size={15} /> CSV
                                </button>

                                {report.printHandler && (
                                    <button
                                        onClick={report.printHandler}
                                        disabled={report.count === 0}
                                        className="flex-[0.8] flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <PrinterIcon size={15} /> Print
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-brand-50 to-indigo-50 rounded-2xl p-5 border border-brand-100 flex items-start gap-4">
                <div className="p-2 bg-white text-brand-600 rounded-xl border border-brand-200 shadow-sm shrink-0">
                    <PrinterIcon size={20} />
                </div>
                <div>
                    <h4 className="text-brand-900 font-bold mb-1 text-sm">How Filters Work</h4>
                    <p className="text-brand-700/80 text-xs leading-relaxed">
                        <strong>District Filter</strong> — Limits all exports to members in the selected district only.
                        <br />
                        <strong>Date Range</strong> — Choose whether to filter by Date Added, DOB (birthday month-day), or Anniversary date (month-day). CSV filenames include filter info for easy reference.
                        <br />
                        <strong>DNC Toggle</strong> — By default, Do-Not-Call members are excluded. Enable to include them in exports.
                    </p>
                </div>
            </div>

        </div>
    );
};
