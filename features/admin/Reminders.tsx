import React, { useState, useMemo } from 'react';
import {
    GiftIcon, HeartIcon, PhoneIcon, MapPinIcon, UsersIcon,
    ClockIcon, StarIcon, MessageSquareIcon, EyeIcon, CheckCircle2Icon, PrinterIcon
} from '../../components/Icons';
import { Member, TAMIL_NADU_DISTRICTS } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { NotesModal } from './NotesModal';
import { printMemberForm } from '../../utils/printUtils';

interface RemindersProps {
    members: Member[];
    onUpdateMember?: (m: Member) => void;
    wishedIds: Set<string>;
    starredIds: Set<string>;
    onToggleWished: (id: string) => void;
    onToggleStarred: (id: string) => void;
}

export interface ReminderRecord {
    id: string;
    type: 'birthday' | 'anniversary';
    name: string;
    relationship: string;
    contactNo: string;
    area: string;
    dateStr: string;
    daysUntil: number;
    isHead: boolean;
    dnc: boolean;
    familyId: string;
    headName: string;
    ageOrYears: number;
    memberId: string; // head member's DB id for notes/star
}

// ─── Date Utility ─────────────────────────────────────────────────────────────
export const getDaysUntilNext = (dateStr: string | undefined): { days: number; years: number } | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthYear = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const currentYear = today.getFullYear();
    let nextDate = new Date(currentYear, month, day);
    if (nextDate.getTime() < today.getTime()) {
        nextDate = new Date(currentYear + 1, month, day);
    }
    const diffTime = nextDate.getTime() - today.getTime();
    const daysUntil = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const yearsCalculated = nextDate.getFullYear() - birthYear;
    return { days: daysUntil, years: yearsCalculated };
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Reminders: React.FC<RemindersProps> = ({ members, onUpdateMember, wishedIds, starredIds, onToggleWished, onToggleStarred }) => {
    const [includeDNC, setIncludeDNC] = useState(true);
    const [districtFilter, setDistrictFilter] = useState('');
    const [selectedMemberForNotes, setSelectedMemberForNotes] = useState<Member | null>(null);

    // ─── Build Today's Records ─────────────────────────────────────────────────
    const todayReminders = useMemo(() => {
        const records: ReminderRecord[] = [];

        members.forEach(member => {
            // Head DOB
            const headDOB = getDaysUntilNext(member.dob);
            if (headDOB && headDOB.days === 0) {
                records.push({
                    id: `${member.id}_head_dob`,
                    type: 'birthday',
                    name: member.name,
                    relationship: 'Head of Family',
                    contactNo: member.contactNo,
                    area: member.district || member.churchArea || '',
                    dateStr: member.dob,
                    daysUntil: 0,
                    isHead: true,
                    dnc: member.dnc || false,
                    familyId: member.id,
                    headName: member.name,
                    ageOrYears: headDOB.years,
                    memberId: member.id,
                });
            }

            // Head DOA
            const headDOA = getDaysUntilNext(member.doa);
            if (headDOA && headDOA.days === 0) {
                records.push({
                    id: `${member.id}_head_doa`,
                    type: 'anniversary',
                    name: member.name,
                    relationship: 'Head of Family',
                    contactNo: member.contactNo,
                    area: member.district || member.churchArea || '',
                    dateStr: member.doa,
                    daysUntil: 0,
                    isHead: true,
                    dnc: member.dnc || false,
                    familyId: member.id,
                    headName: member.name,
                    ageOrYears: headDOA.years,
                    memberId: member.id,
                });
            }

            // Family members
            member.familyMembers?.forEach((fm, index) => {
                const fmDOB = getDaysUntilNext(fm.dob);
                if (fmDOB && fmDOB.days === 0) {
                    records.push({
                        id: `${member.id}_fm_${index}_dob`,
                        type: 'birthday',
                        name: fm.name,
                        relationship: fm.relationship,
                        contactNo: fm.contactNo || member.contactNo,
                        area: member.district || member.churchArea || '',
                        dateStr: fm.dob,
                        daysUntil: 0,
                        isHead: false,
                        dnc: member.dnc || false,
                        familyId: member.id,
                        headName: member.name,
                        ageOrYears: fmDOB.years,
                        memberId: member.id,
                    });
                }

                const fmDOA = getDaysUntilNext(fm.doa);
                if (fmDOA && fmDOA.days === 0) {
                    records.push({
                        id: `${member.id}_fm_${index}_doa`,
                        type: 'anniversary',
                        name: fm.name,
                        relationship: fm.relationship,
                        contactNo: fm.contactNo || member.contactNo,
                        area: member.district || member.churchArea || '',
                        dateStr: fm.doa,
                        daysUntil: 0,
                        isHead: false,
                        dnc: member.dnc || false,
                        familyId: member.id,
                        headName: member.name,
                        ageOrYears: fmDOA.years,
                        memberId: member.id,
                    });
                }
            });
        });

        return records;
    }, [members]);

    // ─── Filtered Records ──────────────────────────────────────────────────────
    const activeRecords = useMemo(() =>
        todayReminders
            .filter(r => includeDNC || !r.dnc)
            .filter(r => !districtFilter || r.area === districtFilter),
        [todayReminders, includeDNC, districtFilter]
    );

    const birthdays = activeRecords.filter(r => r.type === 'birthday');
    const anniversaries = activeRecords.filter(r => r.type === 'anniversary');

    // ─── Actions (delegated to shared App-level state) ─────────────────────────
    const toggleWished = onToggleWished;
    const toggleStar = onToggleStarred;


    const openNotes = (memberId: string) => {
        const m = members.find(m => m.id === memberId);
        if (m) setSelectedMemberForNotes(m);
    };

    // ─── Section Table ─────────────────────────────────────────────────────────
    const renderSectionTable = ({ title, records, color, icon }: {
        title: string;
        records: ReminderRecord[];
        color: 'brand' | 'pink';
        icon: React.ReactNode;
    }) => {
        const isBrand = color === 'brand';
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between
                    ${isBrand ? 'border-brand-100 bg-brand-50/50' : 'border-pink-100 bg-pink-50/50'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border
                            ${isBrand ? 'bg-white border-brand-200 text-brand-600' : 'bg-white border-pink-200 text-pink-600'}`}>
                            {icon}
                        </div>
                        <h3 className="font-black text-slate-800">{title}</h3>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border
                        ${isBrand ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-pink-50 text-pink-700 border-pink-200'}`}>
                        {records.length} today
                    </span>
                </div>

                {/* Table — scrollable tbody capped at 10 rows (~520px) */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[220px]">Name</th>
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[130px]">Relation</th>
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell w-[110px]">Date</th>
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell w-[130px]">District</th>
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell w-[130px]">Contact</th>
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[100px]">Status</th>
                                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-[160px]">Actions</th>
                            </tr>
                        </thead>
                    </table>
                    {/* Scrollable body wrapper — max 10 rows */}
                    <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
                        <table className="w-full text-sm text-left table-fixed">
                            <colgroup>
                                <col className="w-[220px]" />
                                <col className="w-[130px]" />
                                <col className="hidden md:table-column w-[110px]" />
                                <col className="hidden lg:table-column w-[130px]" />
                                <col className="hidden md:table-column w-[130px]" />
                                <col className="w-[100px]" />
                                <col className="w-[160px]" />
                            </colgroup>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((item, idx) => {
                                    const isWished = wishedIds.has(item.id);
                                    const isStarred = starredIds.has(item.id);
                                    return (
                                        <tr key={item.id}
                                            className={`transition-colors group
                                            ${isWished ? 'bg-emerald-50/50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
                                            hover:bg-slate-50`}>

                                            {/* Name */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2.5">
                                                    {/* Avatar circle */}
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border
                                                    ${isBrand ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-slate-800 text-sm leading-tight ${isWished ? 'line-through text-slate-400' : ''}`}>
                                                            {item.name}
                                                        </p>
                                                        {!item.isHead && (
                                                            <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5">
                                                                <UsersIcon size={10} /> C/o {item.headName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Relation */}
                                            <td className="py-3.5 px-5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border
                                                ${item.isHead
                                                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {item.relationship}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-5 hidden md:table-cell">
                                                <span className="text-sm font-bold text-slate-700">{formatDate(item.dateStr)}</span>
                                                {item.ageOrYears > 0 && (
                                                    <span className="block text-[11px] text-slate-400 font-semibold mt-0.5">
                                                        {item.type === 'birthday' ? `Age ${item.ageOrYears}` : `${item.ageOrYears} yrs`}
                                                    </span>
                                                )}
                                            </td>

                                            {/* District */}
                                            <td className="py-3.5 px-5 hidden lg:table-cell">
                                                {item.area ? (
                                                    <span className="flex items-center gap-1 text-xs text-slate-600">
                                                        <MapPinIcon size={12} className="text-slate-400 shrink-0" />
                                                        {item.area}
                                                    </span>
                                                ) : <span className="text-slate-300 text-xs italic">—</span>}
                                            </td>

                                            {/* Contact */}
                                            <td className="py-3.5 px-5 hidden md:table-cell">
                                                {item.contactNo
                                                    ? <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                                        <PhoneIcon size={11} className="text-slate-400" /> {item.contactNo}
                                                    </span>
                                                    : <span className="text-slate-300 text-xs italic">No number</span>
                                                }
                                                {item.dnc && <span className="block text-[10px] font-bold text-red-400 mt-0.5">DNC</span>}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-5 text-center">
                                                <button
                                                    onClick={() => toggleWished(item.id)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all
                                                    ${isWished
                                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                                                >
                                                    <CheckCircle2Icon size={12} />
                                                    {isWished ? 'Wished' : 'Mark'}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* View Details */}
                                                    <button
                                                        title="View Family Details"
                                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm"
                                                    >
                                                        <EyeIcon size={15} />
                                                    </button>

                                                    {/* Print Form */}
                                                    <button
                                                        onClick={() => {
                                                            const m = members.find(m => m.id === item.memberId);
                                                            if (m) printMemberForm(m);
                                                        }}
                                                        title="Print Pre-filled Form"
                                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
                                                    >
                                                        <PrinterIcon size={15} />
                                                    </button>

                                                    {/* Call */}
                                                    <a
                                                        href={item.contactNo && !item.dnc ? `tel:${item.contactNo}` : undefined}
                                                        onClick={e => (!item.contactNo || item.dnc) && e.preventDefault()}
                                                        title={item.dnc ? 'DNC Active' : 'Call'}
                                                        className={`p-2 rounded-lg border transition-all shadow-sm
                                                        ${item.contactNo && !item.dnc
                                                                ? 'bg-white border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50'
                                                                : 'bg-slate-50 border-slate-100 text-slate-300 pointer-events-none'}`}
                                                    >
                                                        <PhoneIcon size={15} />
                                                    </a>

                                                    {/* Star */}
                                                    <button
                                                        onClick={() => toggleStar(item.id)}
                                                        title={isStarred ? 'Unstar' : 'Mark as Priority'}
                                                        className={`p-2 rounded-lg border transition-all shadow-sm
                                                        ${isStarred
                                                                ? 'bg-amber-50 border-amber-300 text-amber-500 hover:bg-amber-100'
                                                                : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50'}`}
                                                    >
                                                        <StarIcon size={15} className={isStarred ? 'fill-amber-400' : ''} />
                                                    </button>

                                                    {/* Notes */}
                                                    <button
                                                        onClick={() => openNotes(item.memberId)}
                                                        title="Add / View Notes"
                                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                                                    >
                                                        <MessageSquareIcon size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div> {/* end scrollable body */}
                </div>
            </div>
        );
    };

    // ─── Layout ────────────────────────────────────────────────────────────────
    const today = new Date();
    const dateLabel = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ClockIcon size={22} className="text-brand-600" /> Daily Reminders
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">{dateLabel}</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <div className={`px-5 py-3 rounded-xl flex flex-col items-center min-w-[90px] border ${birthdays.length > 0 ? 'bg-brand-600 text-white border-brand-700 shadow-md' : 'bg-white border-slate-200'}`}>
                        <span className={`text-2xl font-black ${birthdays.length > 0 ? '' : 'text-slate-700'}`}>{birthdays.length}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${birthdays.length > 0 ? 'text-brand-100' : 'text-slate-400'}`}>Birthdays</span>
                    </div>
                    <div className={`px-5 py-3 rounded-xl flex flex-col items-center min-w-[90px] border ${anniversaries.length > 0 ? 'bg-pink-500 text-white border-pink-600 shadow-md' : 'bg-white border-slate-200'}`}>
                        <span className={`text-2xl font-black ${anniversaries.length > 0 ? '' : 'text-slate-700'}`}>{anniversaries.length}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${anniversaries.length > 0 ? 'text-pink-100' : 'text-slate-400'}`}>Anniversaries</span>
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">District</label>
                    <select
                        value={districtFilter}
                        onChange={e => setDistrictFilter(e.target.value)}
                        className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                    >
                        <option value="">All Districts</option>
                        {TAMIL_NADU_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 py-2 px-3 rounded-xl border border-slate-200">
                    <input type="checkbox" checked={includeDNC} onChange={e => setIncludeDNC(e.target.checked)} className="rounded text-brand-600" />
                    <span className="text-sm font-bold text-slate-700">Include DNC</span>
                </label>
                {(districtFilter || includeDNC) && (
                    <button onClick={() => { setDistrictFilter(''); setIncludeDNC(false); }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        Reset
                    </button>
                )}
            </div>

            {/* ── Content ── */}
            {activeRecords.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <GiftIcon size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No events today</h3>
                    <p className="text-slate-400 mt-1 text-sm">No birthdays or anniversaries today. Check back tomorrow!</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {birthdays.length > 0 && renderSectionTable({
                        title: "Birthday Celebrations",
                        records: birthdays,
                        color: "brand",
                        icon: <GiftIcon size={16} />
                    })}
                    {anniversaries.length > 0 && renderSectionTable({
                        title: "Anniversary Celebrations",
                        records: anniversaries,
                        color: "pink",
                        icon: <HeartIcon size={16} />
                    })}
                </div>
            )}

            {/* ── Notes Modal ── */}
            {selectedMemberForNotes && (
                <NotesModal
                    member={selectedMemberForNotes}
                    onClose={() => setSelectedMemberForNotes(null)}
                    onUpdate={updated => {
                        onUpdateMember?.(updated);
                        setSelectedMemberForNotes(updated);
                    }}
                />
            )}
        </div>
    );
};
