import React, { useState, useMemo } from 'react';
import { SearchIcon, FilterIcon, GiftIcon, PhoneIcon, EyeIcon, MessageSquareIcon, CakeIcon, CalendarIcon, ClockIcon, AlertTriangleIcon, CheckCircle2Icon, SunriseIcon } from '../../components/Icons';
import { useNotification } from '../../context/NotificationContext';
import { Member, TAMIL_NADU_DISTRICTS } from '../../types';
import { NotesModal } from './NotesModal';
import { formatDate } from '../../utils/dateUtils';

interface BirthdayReportsProps {
    members: Member[];
    onViewMember?: (member: Member) => void;
    onUpdateMember?: (member: Member) => void;
}

interface BirthdayPerson {
    id: string;
    memberId: string;
    familyMemberIndex: number | null;
    headName: string;
    personName: string;
    dob: string;
    contactNo: string;
    district: string;
    area: string;
    maritalStatus: string;
    dnc: boolean;
    isHead: boolean;
    isStarred: boolean;
    ageTurning: number | null;
    daysUntil: number | null; // null = past/missed, 0 = today, 1 = tomorrow, etc.
    birthMonth: number | null;
}

const getBirthdayStats = (dobString: string): { daysUntil: number | null, ageTurning: number | null, birthMonth: number | null, daysPast: number | null } => {
    if (!dobString) return { daysUntil: null, ageTurning: null, birthMonth: null, daysPast: null };
    const match = dobString.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return { daysUntil: null, ageTurning: null, birthMonth: null, daysPast: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkYear = today.getFullYear();
    const birthMonth = Number(match[2]);
    const birthDay = Number(match[3]);

    let nextBday = new Date(checkYear, birthMonth - 1, birthDay);
    let turningAge = checkYear - Number(match[1]);

    // Check if birthday already passed this year
    const thisYearBday = new Date(checkYear, birthMonth - 1, birthDay);
    if (thisYearBday < today) {
        // Birthday passed — calculate days since (missed)
        const daysPast = Math.round((today.getTime() - thisYearBday.getTime()) / (1000 * 60 * 60 * 24));
        // Next year's birthday
        nextBday = new Date(checkYear + 1, birthMonth - 1, birthDay);
        turningAge = checkYear + 1 - Number(match[1]);
        const diffTime = nextBday.getTime() - today.getTime();
        const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return { daysUntil, ageTurning: turningAge, birthMonth, daysPast };
    }

    const diffTime = nextBday.getTime() - today.getTime();
    const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return { daysUntil, ageTurning: turningAge, birthMonth, daysPast: 0 };
};

const MONTHS = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

// Shared row component
const BirthdayRow: React.FC<{
    p: BirthdayPerson;
    badge?: React.ReactNode;
    rowStyle?: string;
    avatarStyle?: string;
    callBtnStyle?: string;
    members: Member[];
    onUpdateMember?: (m: Member) => void;
    onViewMember?: (m: Member) => void;
    setSelectedMemberForNotes: (m: Member) => void;
    showNotification: (msg: string, type: string) => void;
}> = ({ p, badge, rowStyle, avatarStyle, callBtnStyle, members, onUpdateMember, onViewMember, setSelectedMemberForNotes, showNotification }) => {
    const handleStarToggle = () => {
        if (!onUpdateMember) return;
        const member = members.find(m => m.id === p.memberId);
        if (!member) return;
        let updatedMember: Member;
        if (p.familyMemberIndex === null) {
            updatedMember = { ...member, isStarred: !member.isStarred };
        } else {
            const updatedFamilyMembers = member.familyMembers.map((fm, idx) =>
                idx === p.familyMemberIndex ? { ...fm, isStarred: !fm.isStarred } : fm
            );
            updatedMember = { ...member, familyMembers: updatedFamilyMembers };
        }
        onUpdateMember(updatedMember);
        const nowStarred = p.familyMemberIndex === null
            ? !member.isStarred
            : !member.familyMembers[p.familyMemberIndex!]?.isStarred;
        showNotification(nowStarred ? 'Starred for follow-up' : 'Star removed', 'success');
    };

    return (
        <tr className={`group transition-all duration-200 ${rowStyle || 'hover:bg-slate-50'}`}>
            <td className="py-3 px-5">{badge}</td>
            <td className="py-3 px-5">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${avatarStyle || 'bg-white text-slate-700 border-slate-200'}`}>
                        {p.personName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-800">{p.personName}</p>
                        {!p.isHead && (
                            <p className="text-xs text-slate-500 font-medium">Head: {p.headName}</p>
                        )}
                        {p.isHead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-600 mt-0.5 border border-brand-100">
                                HEAD OF FAMILY
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="py-3 px-5">
                <span className="text-sm font-bold text-slate-700">{formatDate(p.dob)}</span>
                <br />
                <span className="text-xs text-slate-500">Turns <span className="text-brand-600 font-bold">{p.ageTurning}</span> yrs</span>
            </td>
            <td className="py-3 px-5 text-center">
                <span className="text-xs text-slate-400 block">{p.memberId}</span>
                {p.dnc ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">DNC</span>
                ) : (
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1 justify-center">
                        <PhoneIcon size={11} className="text-slate-400" />{p.contactNo}
                    </span>
                )}
            </td>
            <td className="py-3 px-5 text-center text-sm text-slate-600 font-medium">{p.area || '-'}</td>
            <td className="py-3 px-5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                    {!p.dnc && p.contactNo && (
                        <a href={`tel:${p.contactNo}`}
                            className={`p-2 rounded-lg transition-colors shadow-sm border ${callBtnStyle || 'bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-600 border-transparent'}`}
                            title="Call Now">
                            <PhoneIcon size={15} />
                        </a>
                    )}
                    <button
                        onClick={handleStarToggle}
                        className={`p-2 rounded-lg transition-all border shadow-sm ${p.isStarred ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-slate-400 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 border-transparent'}`}
                        title={p.isStarred ? 'Starred' : 'Mark as Starred'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill={p.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                    <button
                        onClick={() => setSelectedMemberForNotes(members.find(m => m.id === p.memberId)!)}
                        className="p-2 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-lg transition-all shadow-sm"
                        title="Member Notes">
                        <MessageSquareIcon size={15} />
                    </button>
                    {onViewMember && (
                        <button
                            onClick={() => onViewMember(members.find(m => m.id === p.memberId)!)}
                            className="p-2 bg-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 border border-transparent rounded-lg transition-all shadow-sm"
                            title="View Profile">
                            <EyeIcon size={15} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const TableHeader = () => (
    <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">When</th>
            <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Person Name</th>
            <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Birth Date (Age)</th>
            <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Member Info</th>
            <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">District / Area</th>
            <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
        </tr>
    </thead>
);

const EmptyRow: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
    <tr>
        <td colSpan={6} className="py-10 text-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
                {icon}
                <p className="text-sm font-medium">{message}</p>
            </div>
        </td>
    </tr>
);

export const BirthdayReports: React.FC<BirthdayReportsProps> = ({ members, onViewMember, onUpdateMember }) => {
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [includeDNC, setIncludeDNC] = useState(false);
    const [selectedMemberForNotes, setSelectedMemberForNotes] = useState<Member | null>(null);

    // Build all birthday persons with daysPast info
    const allPersons = useMemo(() => {
        let persons: (BirthdayPerson & { daysPast: number | null })[] = [];
        members.forEach(member => {
            if (member.dob) {
                const stats = getBirthdayStats(member.dob);
                persons.push({
                    id: `${member.id}-head`,
                    memberId: member.id,
                    familyMemberIndex: null,
                    headName: member.name,
                    personName: member.name,
                    dob: member.dob,
                    contactNo: member.contactNo,
                    district: member.district || '',
                    area: member.churchArea || member.address || '',
                    maritalStatus: member.maritalStatus,
                    dnc: member.dnc,
                    isHead: true,
                    isStarred: !!member.isStarred,
                    ageTurning: stats.ageTurning,
                    daysUntil: stats.daysUntil,
                    birthMonth: stats.birthMonth,
                    daysPast: stats.daysPast
                });
            }
            (member.familyMembers || []).forEach((fm, index) => {
                if (fm.dob) {
                    const stats = getBirthdayStats(fm.dob);
                    persons.push({
                        id: `${member.id}-fm-${index}`,
                        memberId: member.id,
                        familyMemberIndex: index,
                        headName: member.name,
                        personName: `${fm.name} (${fm.relationship} of ${member.name})`,
                        dob: fm.dob,
                        contactNo: fm.contactNo || member.contactNo,
                        district: member.district || '',
                        area: member.churchArea || member.address || '',
                        maritalStatus: fm.maritalStatus,
                        dnc: member.dnc,
                        isHead: false,
                        isStarred: !!fm.isStarred,
                        ageTurning: stats.ageTurning,
                        daysUntil: stats.daysUntil,
                        birthMonth: stats.birthMonth,
                        daysPast: stats.daysPast
                    });
                }
            });
        });
        return persons;
    }, [members]);

    // Apply global search/district/month/DNC filters
    const filtered = useMemo(() => {
        let r = allPersons;
        if (!includeDNC) r = r.filter(p => !p.dnc);
        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            r = r.filter(p =>
                p.personName.toLowerCase().includes(t) ||
                p.headName.toLowerCase().includes(t) ||
                p.memberId.toLowerCase().includes(t) ||
                p.contactNo.includes(t)
            );
        }
        if (districtFilter) r = r.filter(p => p.district === districtFilter);
        if (monthFilter) r = r.filter(p => p.birthMonth === Number(monthFilter));
        return r;
    }, [allPersons, searchTerm, districtFilter, monthFilter, includeDNC]);

    // Sections
    const todayList = filtered.filter(p => p.daysUntil === 0).sort((a, b) => (a.personName > b.personName ? 1 : -1));
    const tomorrowList = filtered.filter(p => p.daysUntil === 1).sort((a, b) => (a.personName > b.personName ? 1 : -1));
    const next7List = filtered.filter(p => p.daysUntil !== null && p.daysUntil >= 2 && p.daysUntil <= 7).sort((a, b) => (a.daysUntil! - b.daysUntil!));
    // Missed = ONLY yesterday's birthday (daysPast === 1) and not yet starred
    const missedList = filtered.filter(p => p.daysPast === 1 && !p.isStarred);

    const sharedRowProps = { members, onUpdateMember, onViewMember, setSelectedMemberForNotes, showNotification };

    const SectionTable: React.FC<{
        title: string;
        icon: React.ReactNode;
        titleClass: string;
        borderClass: string;
        bgClass: string;
        countBadgeClass: string;
        persons: typeof todayList;
        emptyMsg: string;
        renderBadge: (p: typeof todayList[0]) => React.ReactNode;
        rowStyle?: (p: typeof todayList[0]) => string;
        avatarStyle?: string;
        callBtnStyle?: string;
    }> = ({ title, icon, titleClass, borderClass, bgClass, countBadgeClass, persons, emptyMsg, renderBadge, rowStyle, avatarStyle, callBtnStyle }) => (
        <div className={`rounded-2xl border ${borderClass} shadow-sm overflow-hidden`}>
            <div className={`px-5 py-4 ${bgClass} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className={`font-black text-base tracking-tight ${titleClass}`}>{title}</h3>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${countBadgeClass}`}>
                    {persons.length} {persons.length === 1 ? 'person' : 'people'}
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <TableHeader />
                    <tbody className="divide-y divide-slate-100">
                        {persons.length > 0 ? persons.map(p => (
                            <BirthdayRow
                                key={p.id}
                                p={p}
                                badge={renderBadge(p)}
                                rowStyle={rowStyle ? rowStyle(p) : undefined}
                                avatarStyle={avatarStyle}
                                callBtnStyle={callBtnStyle}
                                {...sharedRowProps}
                            />
                        )) : (
                            <EmptyRow
                                icon={<GiftIcon size={28} className="text-slate-200" />}
                                message={emptyMsg}
                            />
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-brand-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <GiftIcon className="text-brand-600" size={24} />
                        Birthday Reports
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Track and manage upcoming birthdays</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-5 py-3 rounded-xl shadow-md flex flex-col items-center min-w-[100px]">
                        <span className="text-2xl font-black">{todayList.length}</span>
                        <span className="text-xs font-medium text-orange-100 uppercase tracking-wider">Today</span>
                    </div>
                    <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl flex flex-col items-center min-w-[100px]">
                        <span className="text-2xl font-black text-slate-700">{tomorrowList.length}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tomorrow</span>
                    </div>
                    <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl flex flex-col items-center min-w-[100px]">
                        <span className="text-2xl font-black text-slate-700">{next7List.length}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next 7 Days</span>
                    </div>
                    {missedList.length > 0 && (
                        <div className="bg-red-50 border border-red-200 px-5 py-3 rounded-xl flex flex-col items-center min-w-[100px]">
                            <span className="text-2xl font-black text-red-600">{missedList.length}</span>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Missed</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <FilterIcon size={16} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Name / ID / Phone</label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input type="text" placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Month</label>
                        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-500">
                            <option value="">All Months</option>
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">District</label>
                        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-500">
                            <option value="">All Districts</option>
                            {TAMIL_NADU_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col justify-end gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={includeDNC} onChange={e => setIncludeDNC(e.target.checked)} />
                                <div className={`w-9 h-5 rounded-full transition-colors ${includeDNC ? 'bg-red-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${includeDNC ? 'left-5' : 'left-1'}`} />
                                </div>
                            </div>
                            <span className={`text-xs font-bold ${includeDNC ? 'text-red-600' : 'text-slate-500'}`}>Include DNC</span>
                        </label>
                        <button onClick={() => { setSearchTerm(''); setDistrictFilter(''); setMonthFilter(''); setIncludeDNC(false); }}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 1: TODAY */}
            <SectionTable
                title="Today's Birthdays"
                icon={<CakeIcon size={18} className="text-orange-600" />}
                titleClass="text-orange-700"
                borderClass="border-orange-200"
                bgClass="bg-gradient-to-r from-orange-50 to-amber-50"
                countBadgeClass="bg-orange-100 text-orange-700"
                persons={todayList}
                emptyMsg="No birthdays today"
                renderBadge={() => (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-500 text-white shadow-sm animate-pulse">
                        <CakeIcon size={11} /> TODAY
                    </span>
                )}
                rowStyle={() => 'bg-orange-50/40 hover:bg-orange-50'}
                avatarStyle="bg-orange-500 text-white border-orange-600"
                callBtnStyle="bg-green-500 text-white border-green-600 hover:bg-green-600"
            />

            {/* Section 2: TOMORROW */}
            <SectionTable
                title="Tomorrow's Birthdays"
                icon={<SunriseIcon size={18} className="text-blue-600" />}
                titleClass="text-blue-700"
                borderClass="border-blue-200"
                bgClass="bg-gradient-to-r from-blue-50 to-indigo-50"
                countBadgeClass="bg-blue-100 text-blue-700"
                persons={tomorrowList}
                emptyMsg="No birthdays tomorrow"
                renderBadge={() => (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        <SunriseIcon size={11} /> TOMORROW
                    </span>
                )}
                rowStyle={() => 'hover:bg-blue-50/30'}
                avatarStyle="bg-blue-500 text-white border-blue-600"
                callBtnStyle="bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-600 border-transparent"
            />

            {/* Section 3: NEXT 7 DAYS */}
            <SectionTable
                title="Upcoming — Next 7 Days"
                icon={<CalendarIcon size={18} className="text-purple-600" />}
                titleClass="text-purple-700"
                borderClass="border-purple-200"
                bgClass="bg-gradient-to-r from-purple-50 to-violet-50"
                countBadgeClass="bg-purple-100 text-purple-700"
                persons={next7List}
                emptyMsg="No upcoming birthdays in next 7 days"
                renderBadge={(p) => (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        <ClockIcon size={11} /> in {p.daysUntil} days
                    </span>
                )}
                rowStyle={() => 'hover:bg-purple-50/30'}
                callBtnStyle="bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-600 border-transparent"
            />

            {/* Section 4: MISSED WISHES — Yesterday only */}
            <div className="rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-rose-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangleIcon size={18} className="text-red-600" />
                        <h3 className="font-black text-base tracking-tight text-red-700">Missed Yesterday</h3>
                        <span className="text-xs text-red-400 font-semibold">(birthday was yesterday, not yet starred)</span>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-red-100 text-red-700">
                        {missedList.length} {missedList.length === 1 ? 'person' : 'people'}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <TableHeader />
                        <tbody className="divide-y divide-slate-100">
                            {missedList.length > 0 ? missedList.map(p => (
                                <BirthdayRow
                                    key={p.id}
                                    p={p}
                                    badge={
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                            <AlertTriangleIcon size={11} /> Yesterday
                                        </span>
                                    }
                                    rowStyle="hover:bg-red-50/30"
                                    callBtnStyle="bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-600 border-transparent"
                                    {...sharedRowProps}
                                />
                            )) : (
                                <EmptyRow
                                    icon={<CheckCircle2Icon size={28} className="text-green-300" />}
                                    message="No missed wishes from yesterday"
                                />
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
