import React, { useState, useMemo } from 'react';
import { SearchIcon, UsersIcon, PhoneIcon, MapPinIcon, HomeIcon, ArrowUpIcon, ArrowDownIcon } from '../../components/Icons';
import { Member, TAMIL_NADU_DISTRICTS } from '../../types';

interface AreaReportsProps {
    members: Member[];
}

interface AreaRecord {
    id: string;
    personName: string;
    headName: string;
    isHead: boolean;
    district: string;
    area: string;
    address: string;
    contactNo: string;
    dnc: boolean;
    familySize: number;
    addedDaysAgo: number;
    _originalMember: Member;
}

export const AreaReports: React.FC<AreaReportsProps> = ({ members }) => {
    const [selectedDistrict, setSelectedDistrict] = useState<string>(prev => prev || '');
    const [areaSearch, setAreaSearch] = useState<string>('');
    const [sizeFilter, setSizeFilter] = useState<string>('all');
    const [addedFilter, setAddedFilter] = useState<string>('all');
    const [includeDNC, setIncludeDNC] = useState<boolean>(false);

    const [sortField, setSortField] = useState<'area' | 'size'>('area');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const allIndividuals = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return members.flatMap(member => {
            const addedDays = member.createdAt ? Math.floor((today.getTime() - new Date(member.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 9999;
            const size = 1 + (member.familyMembers?.length || 0);

            const individuals: AreaRecord[] = [];

            // Head
            individuals.push({
                id: member.id,
                personName: member.name,
                headName: member.name,
                isHead: true,
                district: member.district || '',
                area: member.churchArea || '',
                address: member.address || '',
                contactNo: member.contactNo,
                dnc: member.dnc,
                familySize: size,
                addedDaysAgo: addedDays,
                _originalMember: member
            });

            // Family
            (member.familyMembers || []).forEach((fm, index) => {
                individuals.push({
                    id: `${member.id}-fm-${index}`,
                    personName: `${fm.name} (${fm.relationship} of ${member.name})`,
                    headName: member.name,
                    isHead: false,
                    district: member.district || '',
                    area: member.churchArea || '',
                    address: member.address || '',
                    contactNo: fm.contactNo || member.contactNo,
                    dnc: member.dnc,
                    familySize: size,
                    addedDaysAgo: addedDays,
                    _originalMember: member
                });
            });

            return individuals;
        });
    }, [members]);

    const filteredRecords = useMemo(() => {
        if (!selectedDistrict) return [];

        let result = allIndividuals.filter(f => f.district === selectedDistrict);

        if (areaSearch.trim()) {
            const query = areaSearch.toLowerCase().trim();
            result = result.filter(f =>
                f.area.toLowerCase().includes(query) ||
                f.address.toLowerCase().includes(query) ||
                f.personName.toLowerCase().includes(query)
            );
        }

        if (sizeFilter !== 'all') {
            if (sizeFilter === 'small') result = result.filter(f => f.familySize >= 1 && f.familySize <= 3);
            else if (sizeFilter === 'medium') result = result.filter(f => f.familySize >= 4 && f.familySize <= 6);
            else if (sizeFilter === 'large') result = result.filter(f => f.familySize >= 7);
        }

        if (addedFilter === 'today') result = result.filter(f => f.addedDaysAgo === 0);
        else if (addedFilter === '7days') result = result.filter(f => f.addedDaysAgo <= 7);
        else if (addedFilter === 'month') result = result.filter(f => f.addedDaysAgo <= 30);

        if (!includeDNC) result = result.filter(f => !f.dnc);

        result.sort((a, b) => {
            if (sortField === 'size') return sortOrder === 'asc' ? a.familySize - b.familySize : b.familySize - a.familySize;
            const areaA = a.area || '';
            const areaB = b.area || '';
            if (areaA < areaB) return sortOrder === 'asc' ? -1 : 1;
            if (areaA > areaB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [allIndividuals, selectedDistrict, areaSearch, sizeFilter, addedFilter, includeDNC, sortField, sortOrder]);

    const uniqueAreas = useMemo(() => {
        const areas = new Set(filteredRecords.map(f => f.area).filter(Boolean));
        return areas.size;
    }, [filteredRecords]);

    const totalFamiliesCount = useMemo(() => {
        const families = new Set(filteredRecords.map(f => f._originalMember.id));
        return families.size;
    }, [filteredRecords]);

    const totalMembersCount = filteredRecords.length;
    const dncCount = filteredRecords.filter(f => f.dnc).length;

    const handleSort = (field: 'area' | 'size') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6 relative">

            {/* Top Summary Header Row */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl border border-emerald-200 text-emerald-600 shadow-inner">
                        <MapPinIcon size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Area-Wise Reports</h2>
                        <p className="text-slate-500 text-sm mt-1">Scope by district and search areas for follow-ups</p>
                    </div>
                </div>

                {/* Top Summary Cards (Dynamic to filtered scope) */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 w-full md:w-auto gap-3 text-center">
                    <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Total Areas</p>
                        <p className="text-xl font-black text-slate-800">{uniqueAreas}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Families</p>
                        <p className="text-xl font-black text-brand-600">{totalFamiliesCount}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Members</p>
                        <p className="text-xl font-black text-indigo-600">{totalMembersCount}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">DNC Active</p>
                        <p className="text-xl font-black text-red-500">{dncCount}</p>
                    </div>
                </div>
            </div>

            {/* Smart Filters Container */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                {/* 1. The Core Scoped Search Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* District Selector - MANDATORY */}
                    <div className="w-full md:w-1/3 relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            1. Select District Scope <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setAreaSearch(''); // Important UX: Reset area search when district changes
                            }}
                            className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-bold focus:outline-none focus:border-emerald-500 md:cursor-pointer shadow-sm"
                        >
                            <option value="">-- Choose District First --</option>
                            {TAMIL_NADU_DISTRICTS.map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>
                    </div>

                    {/* Smart Area Search Input */}
                    <div className="w-full md:w-2/3 relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            2. Smart Area Search
                        </label>
                        <div className="relative">
                            <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 ${selectedDistrict ? 'text-brand-500' : 'text-slate-300'}`} size={18} />
                            <input
                                type="text"
                                disabled={!selectedDistrict} // Disabled until district is chosen
                                placeholder={selectedDistrict ? `Search areas within ${selectedDistrict}... (e.g. 'anna')` : "Select a district first to search areas..."}
                                value={areaSearch}
                                onChange={(e) => setAreaSearch(e.target.value)}
                                className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium
                                    ${selectedDistrict
                                        ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-brand-500'
                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed placeholder:text-slate-400'
                                    }
                                `}
                            />
                        </div>
                    </div>
                </div>

                {/* Optional Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Family Size</label>
                        <select
                            disabled={!selectedDistrict}
                            value={sizeFilter}
                            onChange={(e) => setSizeFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white md:cursor-pointer disabled:opacity-50"
                        >
                            <option value="all">All Sizes</option>
                            <option value="small">Small (1 - 3)</option>
                            <option value="medium">Medium (4 - 6)</option>
                            <option value="large">Large (7+)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recently Added</label>
                        <select
                            disabled={!selectedDistrict}
                            value={addedFilter}
                            onChange={(e) => setAddedFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white md:cursor-pointer disabled:opacity-50"
                        >
                            <option value="all">Anytime</option>
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className="flex items-end lg:col-span-2 h-full pb-1">
                        <label className={`flex items-center gap-3 cursor-pointer group w-full ${!selectedDistrict && 'opacity-50 pointer-events-none'}`}>
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={includeDNC}
                                    onChange={(e) => setIncludeDNC(e.target.checked)}
                                    disabled={!selectedDistrict}
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${includeDNC ? 'bg-red-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${includeDNC ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div>
                                <span className={`text-sm font-bold ${includeDNC ? 'text-red-600' : 'text-slate-600'}`}>Include DNC (Do Not Call)</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Results Default Table Component */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {!selectedDistrict ? (
                    // Initial Empty State Guidance
                    <div className="py-24 text-center px-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                            <MapPinIcon size={32} className="text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Select a District to Begin</h3>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                            To ensure focused and fast searching, please select a target district from the dropdown above to view the respective family reports.
                        </p>
                    </div>
                ) : (
                    // Active Table View
                    <>
                        {/* Table Header Controls */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {filteredRecords.length > 0 ? (
                                    <>Found <span className="text-brand-600 font-black">{totalFamiliesCount}</span> families in <span className="underline decoration-emerald-300 underline-offset-4">{selectedDistrict}</span></>
                                ) : (
                                    'No results found'
                                )}
                            </h3>
                            <button
                                onClick={() => handleSort('size')}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
                            >
                                <UsersIcon size={14} /> Sort by Size {sortField === 'size' && (sortOrder === 'asc' ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />)}
                            </button>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <table className="w-full text-left border-collapse min-w-[850px]">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200">
                                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Membership No</th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Head of Family</th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</th>
                                        <th
                                            className="py-3 px-6 text-xs font-bold text-brand-600 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => handleSort('area')}
                                            title="Click to sort by Area"
                                        >
                                            <div className="flex items-center gap-1">
                                                Area Target {sortField === 'area' && (sortOrder === 'asc' ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />)}
                                            </div>
                                        </th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Family Size</th>
                                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRecords.length > 0 ? (
                                        filteredRecords.map((f) => (
                                            <tr key={f.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-4 px-6 font-medium text-slate-500 text-sm">
                                                    {f._originalMember.id}
                                                </td>

                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 text-xs">
                                                            {f.personName.charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-slate-800 text-sm">
                                                            {f.personName}
                                                            {f.addedDaysAgo <= 7 && (
                                                                <span className="ml-2 inline-block w-2h-2 rounded-full bg-blue-500 animate-pulse" title="Recently Added"></span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                                        <PhoneIcon size={14} className="text-slate-400" />
                                                        {f.contactNo || <span className="text-slate-300 italic text-xs">No Phone</span>}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-slate-800 text-sm">{f.area || '-'}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]" title={f.address}>{f.address || 'No detailed address'}</p>
                                                </td>

                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold
                                                        ${f.familySize >= 7 ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                            f.familySize >= 4 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-slate-100 text-slate-700 border-slate-200'} border`}
                                                    >
                                                        {f.familySize} <span className="ml-1 opacity-70 font-normal">Mem</span>
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6 text-center">
                                                    {f.dnc ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> DNC Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Okay to Call
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center">
                                                <div className="inline-flex flex-col items-center justify-center">
                                                    <SearchIcon size={32} className="text-slate-200 mb-3" />
                                                    <p className="text-slate-500 font-medium">No results matched your search in {selectedDistrict}.</p>
                                                    <p className="text-slate-400 text-xs mt-1">Check that the area exists and spelling is correct.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
