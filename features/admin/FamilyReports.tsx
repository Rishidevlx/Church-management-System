import React, { useState, useMemo } from 'react';
import { SearchIcon, FilterIcon, UsersIcon, PhoneIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon, MapPinIcon, HomeIcon, MessageSquareIcon, PrinterIcon } from '../../components/Icons';
import { Member, FamilyMember, TAMIL_NADU_DISTRICTS } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { NotesModal } from './NotesModal';
import { printMemberForm } from '../../utils/printUtils';

interface FamilyReportsProps {
    members: Member[];
    onViewFamily?: (member: Member) => void;
    onEditFamily?: (member: Member) => void;
    onUpdateMember?: (member: Member) => void;
}

interface FamilyRecord {
    headMember: Member;
    familySize: number;
    spouseName: string | null;
    isMissingPhone: boolean;
    isMissingDOB: boolean;
    isIncomplete: boolean; // Just generic check for address/area
    addedDaysAgo: number;
}

const getAge = (dobString: string | undefined): number | string => {
    if (!dobString) return '-';
    const [y, m, d] = dobString.split('-');
    if (!y || !m || !d) return '-';

    const dob = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const mDiff = today.getMonth() - dob.getMonth();

    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
};



export const FamilyReports: React.FC<FamilyReportsProps> = ({ members, onViewFamily, onEditFamily, onUpdateMember }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sizeFilter, setSizeFilter] = useState<string>('all'); // all, small, medium, large, custom
    const [sizeFrom, setSizeFrom] = useState('');
    const [sizeTo, setSizeTo] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [maritalFilter, setMaritalFilter] = useState(''); // all, married, single
    const [dataFilter, setDataFilter] = useState<string>('all'); // all, missing_phone, missing_dob, incomplete
    const [addedFilter, setAddedFilter] = useState<string>('all'); // all, today, 7days, month
    const [includeDNC, setIncludeDNC] = useState(false);

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // size sorting defaults to largest first

    // Detailed Modal State
    const [selectedFamily, setSelectedFamily] = useState<FamilyRecord | null>(null);
    const [selectedMemberForNotes, setSelectedMemberForNotes] = useState<Member | null>(null);

    // Transform raw members to enhanced FamilyRecords
    const familyRecords = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return members.map(member => {
            const familySize = 1 + (member.familyMembers?.length || 0);

            // Look for spouse
            const spouse = member.familyMembers?.find(
                fm => fm.relationship.toLowerCase() === 'spouse' || fm.relationship.toLowerCase() === 'wife' || fm.relationship.toLowerCase() === 'husband'
            );

            // Health Checks
            const isMissingPhone = !member.contactNo || member.contactNo.trim() === '';

            let isMissingDOB = !member.dob;
            if (!isMissingDOB && member.familyMembers) {
                isMissingDOB = member.familyMembers.some(fm => !fm.dob); // Any member missing dob flags the family
            }

            const isIncomplete = !member.address || !member.churchArea;

            // Added Days — handle both ISO string and date-only strings
            let addedDaysAgo = 9999;
            const createdRaw = (member as any).created_at || (member as any).createdAt;
            if (createdRaw) {
                const created = new Date(createdRaw);
                if (!isNaN(created.getTime())) {
                    created.setHours(0, 0, 0, 0);
                    const diffTime = today.getTime() - created.getTime();
                    addedDaysAgo = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                }
            }

            return {
                headMember: member,
                familySize,
                spouseName: spouse ? spouse.name : null,
                isMissingPhone,
                isMissingDOB,
                isIncomplete,
                addedDaysAgo
            } as FamilyRecord;
        });
    }, [members]);

    // Apply Filters
    const filteredFamilies = useMemo(() => {
        let result = familyRecords;

        // DNC - default exclude
        if (!includeDNC) {
            result = result.filter(f => !f.headMember.dnc);
        }

        // Search Term (Name / Mobile / ID)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(f =>
                f.headMember.name.toLowerCase().includes(term) ||
                (f.spouseName && f.spouseName.toLowerCase().includes(term)) ||
                f.headMember.id.toLowerCase().includes(term) ||
                (f.headMember.contactNo && f.headMember.contactNo.includes(term))
            );
        }

        // Size Filter
        if (sizeFilter !== 'all') {
            if (sizeFilter === 'small') result = result.filter(f => f.familySize >= 1 && f.familySize <= 3);
            else if (sizeFilter === 'medium') result = result.filter(f => f.familySize >= 4 && f.familySize <= 6);
            else if (sizeFilter === 'large') result = result.filter(f => f.familySize >= 7);
            else if (sizeFilter === 'custom') {
                if (sizeFrom) result = result.filter(f => f.familySize >= Number(sizeFrom));
                if (sizeTo) result = result.filter(f => f.familySize <= Number(sizeTo));
            }
        }

        // District Filter
        if (areaFilter) {
            result = result.filter(f => f.headMember.district === areaFilter);
        }

        // Marital Filter
        if (maritalFilter === 'married') {
            result = result.filter(f => f.headMember.maritalStatus === 'Married' || f.spouseName !== null);
        } else if (maritalFilter === 'single') {
            result = result.filter(f => f.headMember.maritalStatus === 'Single' || f.headMember.maritalStatus === 'Widowed');
        }

        // Data Health Filter
        if (dataFilter === 'missing_phone') {
            result = result.filter(f => f.isMissingPhone);
        } else if (dataFilter === 'missing_dob') {
            result = result.filter(f => f.isMissingDOB);
        } else if (dataFilter === 'incomplete') {
            result = result.filter(f => f.isIncomplete);
        }

        // Added Date Filter
        if (addedFilter === 'today') {
            result = result.filter(f => f.addedDaysAgo === 0);
        } else if (addedFilter === '7days') {
            result = result.filter(f => f.addedDaysAgo <= 7);
        } else if (addedFilter === 'month') {
            result = result.filter(f => f.addedDaysAgo <= 30);
        }

        // Sort by Size
        result.sort((a, b) => {
            return sortOrder === 'asc' ? a.familySize - b.familySize : b.familySize - a.familySize;
        });

        return result;
    }, [familyRecords, searchTerm, sizeFilter, sizeFrom, sizeTo, areaFilter, maritalFilter, dataFilter, addedFilter, includeDNC, sortOrder]);

    const handleReset = () => {
        setSearchTerm('');
        setSizeFilter('all');
        setSizeFrom('');
        setSizeTo('');
        setAreaFilter('');
        setMaritalFilter('');
        setDataFilter('all');
        setAddedFilter('all');
        setIncludeDNC(false);
    };

    // Calculate metrics for summary
    const totalFamiliesCount = familyRecords.length;

    return (
        <div className="space-y-6 relative">

            {/* --- FAMILY VIEW MODAL --- */}
            {selectedFamily && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5 flex items-center justify-between text-white relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-2xl font-bold shadow-sm backdrop-blur-sm">
                                    {selectedFamily.headMember.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedFamily.headMember.name}'s Family</h2>
                                    <p className="text-indigo-100 text-sm font-medium mt-0.5 opacity-90">ID: {selectedFamily.headMember.id} • {selectedFamily.familySize} Members</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFamily(null)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative z-10 group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:scale-110 transition-transform"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">

                            {/* Head Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                    <PhoneIcon className="text-slate-400 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</p>
                                        <p className="font-semibold text-slate-800 mt-1">{selectedFamily.headMember.contactNo || 'Not provided'}</p>
                                        <p className="text-xs text-slate-500 mt-1">{selectedFamily.headMember.email || 'No email'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                    <MapPinIcon className="text-slate-400 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</p>
                                        <p className="font-semibold text-slate-800 mt-1">{selectedFamily.headMember.churchArea || 'Area not specified'}</p>
                                        <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]" title={selectedFamily.headMember.address}>{selectedFamily.headMember.address || '-'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mt-0.5"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v6h6" /></svg>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marital Status</p>
                                        <p className="font-semibold text-slate-800 mt-1">{selectedFamily.headMember.maritalStatus}</p>
                                        {selectedFamily.headMember.doa && <p className="text-xs text-slate-500 mt-1">Anniv: {selectedFamily.headMember.doa}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Family Members Table inside Modal */}
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <UsersIcon className="text-purple-600" size={20} />
                                Family Members Structure
                            </h3>
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Relationship</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">DOB</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Age</th>
                                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* Head Row */}
                                        <tr className="bg-purple-50/30">
                                            <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                {selectedFamily.headMember.name}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-slate-600">Head of Family</td>
                                            <td className="py-3 px-4 text-sm text-slate-600">
                                                {selectedFamily.headMember.dob ? formatDate(selectedFamily.headMember.dob) : <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded">MISSING</span>}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-bold text-slate-700">{getAge(selectedFamily.headMember.dob)}</td>
                                            <td className="py-3 px-4 text-sm text-slate-600 capitalize">{selectedFamily.headMember.gender || '-'}</td>
                                        </tr>
                                        {/* Dependents Rows */}
                                        {selectedFamily.headMember.familyMembers?.map((fm, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-slate-700 pl-8 relative">
                                                    {/* Tree Connector styling */}
                                                    <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200"></div>
                                                    <div className="absolute left-3 top-1/2 w-3 h-px bg-slate-200"></div>
                                                    {fm.name}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600 capitalize">{fm.relationship}</td>
                                                <td className="py-3 px-4 text-sm text-slate-600">
                                                    {fm.dob ? formatDate(fm.dob) : <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded">MISSING</span>}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-slate-700">{getAge(fm.dob)}</td>
                                                <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                                                    {fm.gender === 'male' || fm.gender === 'female' ? fm.gender : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!selectedFamily.headMember.familyMembers || selectedFamily.headMember.familyMembers.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-center text-sm text-slate-400 italic">No dependents added to this family.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end gap-3 rounded-b-2xl">
                            {onEditFamily && (
                                <button
                                    onClick={() => {
                                        onEditFamily(selectedFamily.headMember);
                                        setSelectedFamily(null); // Optional: close modal when opening edit
                                    }}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:text-brand-600 hover:border-brand-300 transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                    Edit Family
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedFamily(null)}
                                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg shadow-md hover:bg-slate-800 hover:shadow-lg transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Header & Stats Card */}
            <div className="bg-white rounded-2xl border border-brand-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-xl border border-purple-200 text-purple-600 shadow-inner">
                        <HomeIcon size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Family Reports</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage family structures and data quality health checks</p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-5 py-3 rounded-xl shadow-md border border-purple-500/30 flex flex-col items-center justify-center min-w-[140px]">
                        <span className="text-3xl font-black">{totalFamiliesCount}</span>
                        <span className="text-xs font-medium text-purple-100 uppercase tracking-wider mt-0.5">Total Families</span>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Report Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Basic Search */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Head / Spouse / No / Phone</label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search family..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* District Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">District</label>
                        <select
                            value={areaFilter}
                            onChange={(e) => setAreaFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-purple-500 md:cursor-pointer"
                        >
                            <option value="">All Districts</option>
                            {TAMIL_NADU_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Added Date Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recently Added</label>
                        <select
                            value={addedFilter}
                            onChange={(e) => setAddedFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-purple-500 md:cursor-pointer"
                        >
                            <option value="all">Anytime</option>
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    {/* Family Size Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Family Size</label>
                        <select
                            value={sizeFilter}
                            onChange={(e) => {
                                setSizeFilter(e.target.value);
                                if (e.target.value !== 'custom') {
                                    setSizeFrom(''); setSizeTo('');
                                }
                            }}
                            className="w-full px-4 py-2 bg-purple-50 font-bold border border-purple-200 rounded-lg text-sm text-purple-700 focus:outline-none focus:border-purple-500 md:cursor-pointer"
                        >
                            <option value="all">All Sizes</option>
                            <option value="small">Small (1 - 3 members)</option>
                            <option value="medium">Medium (4 - 6 members)</option>
                            <option value="large">Large (7+ members)</option>
                            <option value="custom">Custom Range...</option>
                        </select>
                        {sizeFilter === 'custom' && (
                            <div className="flex items-center gap-2 mt-2 animate-fadeIn">
                                <input type="number" placeholder="Min" value={sizeFrom} onChange={(e) => setSizeFrom(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm outline-none focus:border-purple-500" />
                                <span className="text-slate-400 font-bold">-</span>
                                <input type="number" placeholder="Max" value={sizeTo} onChange={(e) => setSizeTo(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm outline-none focus:border-purple-500" />
                            </div>
                        )}
                    </div>

                    {/* Marital Status */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Head Status</label>
                        <select
                            value={maritalFilter}
                            onChange={(e) => setMaritalFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-purple-500 md:cursor-pointer"
                        >
                            <option value="">All Families</option>
                            <option value="married">Married Couple Head</option>
                            <option value="single">Single Head</option>
                        </select>
                    </div>

                    {/* Data Completion Health */}
                    <div>
                        <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Data Quality Checks</label>
                        <select
                            value={dataFilter}
                            onChange={(e) => setDataFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-red-50 font-bold border border-red-200 rounded-lg text-sm text-red-700 focus:outline-none focus:border-red-500 md:cursor-pointer"
                        >
                            <option value="all">No Quality Filter</option>
                            <option value="missing_phone">Missing Phone Number</option>
                            <option value="missing_dob">Missing DOB (Any Member)</option>
                            <option value="incomplete">Incomplete Address</option>
                        </select>
                    </div>

                    {/* Bottom Actions Row taking remaining space */}
                    <div className="flex flex-col sm:flex-row items-end justify-between lg:col-span-1 gap-4 h-full">
                        <label className="flex items-center gap-3 cursor-pointer group mb-1.5 w-full">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={includeDNC}
                                    onChange={(e) => setIncludeDNC(e.target.checked)}
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${includeDNC ? 'bg-red-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${includeDNC ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div>
                                <span className={`text-xs font-bold ${includeDNC ? 'text-red-600' : 'text-slate-500'}`}>Include DNC</span>
                            </div>
                        </label>

                        <button
                            onClick={handleReset}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">
                        Result: <span className="text-purple-600 font-black">{filteredFamilies.length}</span> Families found
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                        >
                            Sort by Size
                            {sortOrder === 'desc' ? <ArrowDownIcon size={14} /> : <ArrowUpIcon size={14} />}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-[280px]">Family Identity</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Spouse</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Size</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Contact & Area</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Data Health</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredFamilies.length > 0 ? (
                                filteredFamilies.map((f) => {
                                    return (
                                        <tr key={f.headMember.id} className="group transition-all duration-200 hover:bg-slate-50">

                                            {/* Name & ID Column */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-purple-700 bg-purple-100 shadow-sm border border-purple-200/50">
                                                        {f.headMember.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                                            {f.headMember.name}
                                                            {f.addedDaysAgo <= 7 && (
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-black bg-blue-100 text-blue-600">NEW</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-medium">Head • {f.headMember.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Spouse */}
                                            <td className="py-4 px-6 text-center">
                                                {f.spouseName ? (
                                                    <span className="text-sm font-medium text-slate-700">{f.spouseName}</span>
                                                ) : (
                                                    <span className="text-sm text-slate-300">-</span>
                                                )}
                                            </td>

                                            {/* Size */}
                                            <td className="py-4 px-6 text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm border border-slate-200">
                                                    {f.familySize}
                                                </div>
                                            </td>

                                            {/* Contact & Area */}
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center gap-1 text-slate-600 text-sm font-medium">
                                                    {f.headMember.dnc ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                                                            DNC Active
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 w-full justify-center">
                                                            <PhoneIcon size={12} className="text-slate-400" />
                                                            {f.headMember.contactNo || <span className="text-xs text-red-400 italic">No Phone</span>}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-slate-400 font-bold uppercase truncate max-w-[120px]">{f.headMember.churchArea || 'No Area'}</span>
                                                </div>
                                            </td>

                                            {/* Data Health Flags */}
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    {(!f.isMissingDOB && !f.isMissingPhone && !f.isIncomplete) ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">
                                                            Good
                                                        </span>
                                                    ) : (
                                                        <div className="flex gap-1 flex-wrap justify-center max-w-[150px]">
                                                            {f.isMissingPhone && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-100" title="Missing Head Phone">No Phone</span>}
                                                            {f.isMissingDOB && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100" title="Someone in family missing DOB">No DOB</span>}
                                                            {f.isIncomplete && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200" title="Missing address or area">Inc Data</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                                    {!f.headMember.dnc && f.headMember.contactNo && (
                                                        <a
                                                            href={`tel:${f.headMember.contactNo}`}
                                                            className="p-2 bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200 border border-transparent rounded-lg transition-all shadow-sm"
                                                            title="Call Head"
                                                        >
                                                            <PhoneIcon size={16} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedMemberForNotes(f.headMember)}
                                                        className="p-2 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-lg transition-all shadow-sm"
                                                        title="Member Notes"
                                                    >
                                                        <MessageSquareIcon size={16} />
                                                    </button>
                                                    {onEditFamily && (
                                                        <button
                                                            onClick={() => onEditFamily(f.headMember)}
                                                            className="p-2 bg-white hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 border border-transparent rounded-lg transition-all shadow-sm"
                                                            title="Edit Family"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => printMemberForm(f.headMember)}
                                                        className="p-2 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-transparent rounded-lg transition-all shadow-sm"
                                                        title="Print Form"
                                                    >
                                                        <PrinterIcon size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedFamily(f)}
                                                        className="p-2 bg-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 border border-transparent rounded-lg transition-all shadow-sm"
                                                        title="View Full Family"
                                                    >
                                                        <EyeIcon size={16} />
                                                        <span className="sr-only">View</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                                <HomeIcon size={24} className="text-purple-300" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-600">No families found</p>
                                            <p className="text-sm text-slate-400 mt-1">Try resolving your health checks or adjusting filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notes Modal */}
            {selectedMemberForNotes && onUpdateMember && (
                <NotesModal
                    member={selectedMemberForNotes}
                    onClose={() => setSelectedMemberForNotes(null)}
                    onUpdate={(updated) => { onUpdateMember(updated); setSelectedMemberForNotes(updated); }}
                />
            )}
        </div>
    );
};
