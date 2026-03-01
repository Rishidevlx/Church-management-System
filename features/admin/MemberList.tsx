import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, TrashIcon, UserIcon, UsersIcon, PhoneIcon, EyeIcon, FileTextIcon, CrossIcon, FilterIcon, MessageSquareIcon, EditIcon, PrinterIcon } from '../../components/Icons';
import { Member } from '../../types';
import { AddMember } from './AddMember'; // Import AddMember for Edit Modal
import { useNotification } from '../../context/NotificationContext';

interface MemberListProps {
    members: any[];
    onDelete: (id: string) => void;
    onEdit: (member: Member) => void; // This will trigger the modal
    onUpdateMember?: (member: Member) => void;
    hideHeaderAndFilters?: boolean;
    isFiltered?: boolean;
    onClearFilters?: () => void;
}

import { NotesModal } from './NotesModal';
import { formatDate } from '../../utils/dateUtils';
import { printMemberForm } from '../../utils/printUtils';

// Modal Component for Full View
const ViewMemberModal: React.FC<{ member: Member; onClose: () => void }> = ({ member, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fadeIn text-slate-900 flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-50 rounded-full text-brand-600">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{member.name || member.personName}</h2>
                            <p className="text-slate-500 text-sm font-medium">{member.id} • {member.visitorType}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => printMemberForm(member)}
                            className="p-2.5 bg-brand-50 hover:bg-brand-100 hover:text-brand-600 rounded-lg transition-all duration-200 flex items-center gap-2 group border border-brand-100"
                            aria-label="Print Form"
                        >
                            <PrinterIcon size={18} className="text-brand-500 group-hover:text-brand-600" />
                            <span className="text-sm font-bold text-brand-600 hidden md:block">Print Form</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group border border-slate-200"
                            aria-label="Close"
                        >
                            <CrossIcon size={20} className="text-slate-500 group-hover:text-red-600" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* 1. Personal Details */}
                    <section>
                        <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-brand-600"></span>
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Full Name</span>
                                <span className="font-bold text-slate-900 text-lg">{member.name}</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Contact Number</span>
                                <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <PhoneIcon size={16} className="text-brand-500" />
                                    {member.contactNo}
                                </span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Occupation</span>
                                <span className="font-bold text-slate-900 text-lg">{member.occupation || '-'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">DOB</span><span className="font-semibold text-slate-800">{formatDate(member.dob)}</span></div>
                                <div><span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Anniversary</span><span className="font-semibold text-slate-800">{formatDate(member.doa)}</span></div>
                            </div>
                            <div><span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Marital Status</span><span className="font-semibold text-slate-800">{member.maritalStatus || '-'}</span></div>
                            <div><span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Check-In Time</span><span className="font-semibold text-slate-800">{member.checkInTime || '-'}</span></div>

                            <div className="md:col-span-3 mt-2">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Address</span>
                                <p className="font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{member.address || 'No address provided.'}</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Family Members */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-brand-600"></span>
                                Family Members ({member.familyCount || 0})
                            </h3>
                        </div>

                        {member.familyMembers && member.familyMembers.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 border-b border-slate-200">Name</th>
                                                <th className="p-4 border-b border-slate-200">Relation</th>
                                                <th className="p-4 border-b border-slate-200">DOB</th>
                                                <th className="p-4 border-b border-slate-200">Anniversary</th>
                                                <th className="p-4 border-b border-slate-200">Qualification</th>
                                                <th className="p-4 border-b border-slate-200">Occupation</th>
                                                <th className="p-4 border-b border-slate-200">Contact</th>
                                                <th className="p-4 border-b border-slate-200">Marital Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {member.familyMembers.map((fm, i) => (
                                                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-4 font-bold text-slate-900">{fm.name}</td>
                                                    <td className="p-4 text-slate-700">{fm.relationship}</td>
                                                    <td className="p-4 text-slate-600">{formatDate(fm.dob)}</td>
                                                    <td className="p-4 text-slate-600">{formatDate(fm.doa)}</td>
                                                    <td className="p-4 text-slate-600">{fm.qualification || '-'}</td>
                                                    <td className="p-4 text-slate-600">{fm.occupation || '-'}</td>
                                                    <td className="p-4 text-slate-600 font-medium">{fm.contactNo || '-'}</td>
                                                    <td className="p-4 text-slate-600">{fm.maritalStatus || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 italic">No family members listed.</p>
                            </div>
                        )}
                    </section>

                    {/* 3. Ministry & Spiritual Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <section>
                            <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-brand-600"></span>
                                Ministry Info
                            </h3>
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Visitor Type</span>
                                        <span className="font-bold text-slate-900">{member.visitorType}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Church Name</span>
                                        <span className="font-semibold text-slate-900">{member.churchName || '-'}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Church Area</span>
                                        <span className="font-semibold text-slate-900">{member.churchArea || '-'}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Ministry Involved</span>
                                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${member.involvedInMinistry ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {member.involvedInMinistry ? `Yes (${member.ministryType})` : 'No'}
                                        </span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Regular Goer?</span>
                                        <span className="font-semibold text-slate-900">{member.regularChurchGoer ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-brand-600"></span>
                                Spiritual Background
                            </h3>
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Baptism</span>
                                        <span className={`font-bold ${member.baptismStatus ? 'text-brand-600' : 'text-slate-400'}`}>{member.baptismStatus ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Holy Spirit Anointing</span>
                                        <span className={`font-bold ${member.holySpiritAnointing ? 'text-brand-600' : 'text-slate-400'}`}>{member.holySpiritAnointing ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Holy Communion</span>
                                        <span className={`font-bold ${member.holyCommunion ? 'text-brand-600' : 'text-slate-400'}`}>{member.holyCommunion ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">LOJ Events</span>
                                        <span className={`font-bold ${member.loveOfJesusEvents ? 'text-brand-600' : 'text-slate-400'}`}>{member.loveOfJesusEvents ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-500 text-sm font-medium">Church Activities</span>
                                        <span className="font-semibold text-slate-900">{member.churchActivities || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 4. Purpose & Additional */}
                    <section>
                        <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-brand-600"></span>
                            Purpose & Additional Info
                        </h3>
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-6">
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Purpose of Visit</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(member.purpose).map(([key, val]) => {
                                        if (val && key !== 'otherDetails') {
                                            return <span key={key} className="px-3 py-1.5 bg-white text-brand-700 text-xs rounded-lg border border-brand-100 shadow-sm font-semibold uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        }
                                        return null;
                                    })}
                                    {Object.values(member.purpose).every(v => !v || v === member.purpose.otherDetails) && <span className="text-slate-400 text-sm italic">No specific purpose selected.</span>}
                                </div>
                                {member.purpose.otherDetails && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                                        <span className="font-bold">Note:</span> {member.purpose.otherDetails}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                                <div><span className="text-slate-500 text-xs font-bold uppercase block mb-1">Tattoos</span><span className="font-semibold text-slate-900">{member.tattoos ? 'Yes' : 'No'}</span></div>
                                <div><span className="text-slate-500 text-xs font-bold uppercase block mb-1">Occult</span><span className="font-semibold text-slate-900">{member.occultPractices ? 'Yes' : 'No'}</span></div>
                                <div><span className="text-slate-500 text-xs font-bold uppercase block mb-1">Black Magic</span><span className="font-semibold text-slate-900">{member.blackMagicObjects ? 'Yes' : 'No'}</span></div>
                                <div><span className="text-slate-500 text-xs font-bold uppercase block mb-1">Astrology</span><span className="font-semibold text-slate-900">{member.astrology ? 'Yes' : 'No'}</span></div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Office Use */}
                    <section className="bg-slate-900 text-slate-300 rounded-xl p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-slate-700"></span>
                            Office Use Only
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                            <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Front Office</span><span className="font-semibold text-white">{member.frontOfficeIncharge || '-'}</span></div>
                            <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Counsellor</span><span className="font-semibold text-white">{member.counsellor || '-'}</span></div>
                            <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Prayer Warrior</span><span className="font-semibold text-white">{member.prayerWarrior || '-'}</span></div>
                            <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Follow-up</span><span className="font-semibold text-white">{member.followUpOfficer || '-'}</span></div>
                        </div>
                        <div className="flex gap-4 mt-6 pt-6 border-t border-slate-800">
                            {member.dnc && <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-500/30">DNC Enabled</span>}
                            {member.ggrp && <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">GGRP Member</span>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Edit Member Modal
const EditMemberModal: React.FC<{ member: Member; onClose: () => void; onUpdate: (m: Member) => void }> = ({ member, onClose, onUpdate }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-20">
                    <h2 className="text-lg font-bold text-slate-900">Edit Member Record</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800">
                        <CrossIcon size={20} />
                    </button>
                </div>
                <div className="p-4">
                    <AddMember
                        onAddMember={(updatedMember) => {
                            onUpdate(updatedMember);
                            onClose();
                        }}
                        initialData={member}
                        onCancel={onClose}
                        isModal={true}
                    />
                </div>
            </div>
        </div>
    );
};


export const MemberList: React.FC<MemberListProps> = ({ members, onDelete, onEdit, onUpdateMember, hideHeaderAndFilters = false, isFiltered = false, onClearFilters }) => {
    const { showNotification } = useNotification();
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [notesMember, setNotesMember] = useState<Member | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGGRP, setFilterGGRP] = useState('All');
    const [filterMarital, setFilterMarital] = useState('All');
    const [filterDobStart, setFilterDobStart] = useState('');
    const [filterDobEnd, setFilterDobEnd] = useState('');
    const [filterAnnivStart, setFilterAnnivStart] = useState('');
    const [filterAnnivEnd, setFilterAnnivEnd] = useState('');

    const isDateInRangeIgnoreYear = (dateStr: string, startStr: string, endStr: string) => {
        if (!dateStr) return false;

        // dateStr format is usually YYYY-MM-DD
        const [, , dMonth, dDay] = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
        if (!dMonth || !dDay) return false;

        const dateMonthDay = `${dMonth}-${dDay}`;

        let inRange = true;

        if (startStr) {
            const [, , sMonth, sDay] = startStr.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
            if (sMonth && sDay) {
                const startMonthDay = `${sMonth}-${sDay}`;
                inRange = inRange && (dateMonthDay >= startMonthDay);
            }
        }

        if (endStr) {
            const [, , eMonth, eDay] = endStr.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
            if (eMonth && eDay) {
                const endMonthDay = `${eMonth}-${eDay}`;
                inRange = inRange && (dateMonthDay <= endMonthDay);
            }
        }

        if (startStr && endStr) {
            const [, , sMonth, sDay] = startStr.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
            const [, , eMonth, eDay] = endStr.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
            if (sMonth && sDay && eMonth && eDay) {
                const startMonthDay = `${sMonth}-${sDay}`;
                const endMonthDay = `${eMonth}-${eDay}`;
                if (startMonthDay > endMonthDay) {
                    inRange = (dateMonthDay >= startMonthDay) || (dateMonthDay <= endMonthDay);
                }
            }
        }

        return inRange;
    };

    // FILTER LOGIC
    const filteredMembers = React.useMemo(() => {
        // If the members passed are already synthetic individuals (from AdvancedFilters),
        // we skip the internal flattening. We detect this via the uniqueKey or _isFamilyMember flag.
        if (members.length > 0 && ((members[0] as any).uniqueKey || (members[0] as any)._isFamilyMember !== undefined)) {
            return members as any[];
        }

        return members.flatMap(member => {
            // 1. Family-level Filter: GGRP
            if (filterGGRP !== 'All') {
                if (filterGGRP === 'Yes' && !member.ggrp) return [];
                if (filterGGRP === 'No' && member.ggrp) return [];
            }

            const term = searchTerm.toLowerCase();
            const hasIndividualFilters = term !== '' || filterMarital !== 'All' || filterDobStart !== '' || filterDobEnd !== '' || filterAnnivStart !== '' || filterAnnivEnd !== '';

            if (!hasIndividualFilters) {
                // Default view: Show the family head record
                return [{ ...member, uniqueKey: member.id, personName: member.name, isHead: true } as any];
            }

            let matchingIndividuals: any[] = [];

            // Check Head against individual filters
            let headMatches = headMatchesInternal(member, term, filterMarital, filterDobStart, filterDobEnd, filterAnnivStart, filterAnnivEnd);

            if (headMatches) {
                matchingIndividuals.push({
                    ...member,
                    uniqueKey: member.id,
                    personName: member.name,
                    isHead: true,
                    _originalMember: member
                });
            }

            // Check Family Members against individual filters
            member.familyMembers.forEach((fm, index) => {
                if (!fm.name && !fm.dob) return; // skip empty rows

                let fmMatches = fmMatchesInternal(fm, member, term, filterMarital, filterDobStart, filterDobEnd, filterAnnivStart, filterAnnivEnd);

                if (fmMatches) {
                    matchingIndividuals.push({
                        ...member,
                        personName: `${fm.name} (${fm.relationship} of ${member.name})`,
                        dob: fm.dob,
                        doa: fm.doa,
                        contactNo: fm.contactNo || member.contactNo,
                        maritalStatus: fm.maritalStatus,
                        occupation: fm.occupation,
                        _isFamilyMember: true,
                        _originalMember: member,
                        uniqueKey: `${member.id}-fm-${index}`,
                        isHead: false
                    });
                }
            });

            return matchingIndividuals;
        });
    }, [members, searchTerm, filterGGRP, filterMarital, filterDobStart, filterDobEnd, filterAnnivStart, filterAnnivEnd]);

    function headMatchesInternal(member: Member, term: string, marital: string, ds: string, de: string, as: string, ae: string) {
        if (term !== '') {
            const headMatchesTerm = member.name.toLowerCase().includes(term) || member.contactNo.includes(term) || member.id.toLowerCase().includes(term);
            if (!headMatchesTerm) return false;
        }
        if (marital !== 'All' && member.maritalStatus !== marital) return false;
        if ((ds || de) && !isDateInRangeIgnoreYear(member.dob, ds, de)) return false;
        if ((as || ae) && !isDateInRangeIgnoreYear(member.doa, as, ae)) return false;
        return true;
    }

    function fmMatchesInternal(fm: any, member: Member, term: string, marital: string, ds: string, de: string, as: string, ae: string) {
        if (term !== '') {
            const fmMatchesTerm = fm.name.toLowerCase().includes(term) || fm.contactNo.includes(term);
            if (!fmMatchesTerm) return false;
        }
        if (marital !== 'All' && fm.maritalStatus !== marital) return false;
        if ((ds || de) && !isDateInRangeIgnoreYear(fm.dob, ds, de)) return false;
        if ((as || ae) && !isDateInRangeIgnoreYear(fm.doa, as, ae)) return false;
        return true;
    }


    return (
        <div className="space-y-6">
            {/* View Modal */}
            {selectedMember && <ViewMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}

            {/* Edit Modal (Popup) */}
            {editingMember && (
                <EditMemberModal
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                    onUpdate={(updated) => {
                        onEdit(updated); // Pass back to parent to update state
                        setEditingMember(null);
                    }}
                />
            )}

            {/* Notes Modal (Popup) */}
            {notesMember && (
                <NotesModal
                    member={notesMember}
                    onClose={() => setNotesMember(null)}
                    // if onUpdateMember is passed from props we use it to save the note inside the app state.
                    // Assuming MemberList gets re-rendered or we have a way to propagate it.
                    // For now, let's call onEdit to reuse the same update flow but silently maybe? Wait, onEdit usually opens the edit modal in a typical setup, or in our case onEdit handles the save directly? Let's check App.tsx later.
                    onUpdate={(updated) => {
                        onEdit(updated);
                        setNotesMember(updated); // Update the currently viewing member in the state so the notes pop up updates in real-time
                    }}
                />
            )}

            {!hideHeaderAndFilters && (
                <>
                    {/* Header & Stats */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Member Directory</h2>
                            <p className="text-slate-500 text-sm mt-1">Total Registered Members: {members.length}</p>
                        </div>

                        {isFiltered && onClearFilters && (
                            <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 px-4 py-2 rounded-xl animate-bounce-subtle">
                                <div className="text-brand-700 text-sm font-bold">Advanced Filters Active</div>
                                <button
                                    onClick={onClearFilters}
                                    className="text-xs bg-brand-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[250px]">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search name, phone, family..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 flex-wrap">
                            <select value={filterGGRP} onChange={(e) => setFilterGGRP(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-brand-500 cursor-pointer">
                                <option value="All">GGRP: All</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>

                            <select value={filterMarital} onChange={(e) => setFilterMarital(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-brand-500 cursor-pointer">
                                <option value="All">Marital: All</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                            </select>

                            <div className="flex items-center gap-2 bg-slate-50 px-2 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">DOB:</span>
                                <input type="date" title="Start Date" value={filterDobStart} onChange={(e) => setFilterDobStart(e.target.value)} className="bg-transparent py-1 text-sm text-slate-900 outline-none cursor-pointer w-32" />
                                <span className="text-slate-400 text-xs">-</span>
                                <input type="date" title="End Date" value={filterDobEnd} onChange={(e) => setFilterDobEnd(e.target.value)} className="bg-transparent py-1 text-sm text-slate-900 outline-none cursor-pointer w-32" />
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-2 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Anniv:</span>
                                <input type="date" title="Start Date" value={filterAnnivStart} onChange={(e) => setFilterAnnivStart(e.target.value)} className="bg-transparent py-1 text-sm text-slate-900 outline-none cursor-pointer w-32" />
                                <span className="text-slate-400 text-xs">-</span>
                                <input type="date" title="End Date" value={filterAnnivEnd} onChange={(e) => setFilterAnnivEnd(e.target.value)} className="bg-transparent py-1 text-sm text-slate-900 outline-none cursor-pointer w-32" />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">GGRP</th>
                                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Member Details</th>
                                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Contact</th>
                                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member: any) => (
                                    <tr key={member.uniqueKey || member.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                                        <td className="py-4 px-6 text-center">
                                            {member.ggrp ? (
                                                <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
                                                    <span className="text-xs font-bold">✓</span>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded bg-slate-50 mx-auto border border-slate-100"></div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white text-brand-600 flex items-center justify-center font-bold text-sm border border-slate-200 shadow-sm">
                                                    {(member.personName || member.name || " ").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{member.personName || member.name}</p>
                                                    {!member._isFamilyMember ? (
                                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{member.familyCount} Family Members</p>
                                                    ) : (
                                                        <p className="text-xs text-brand-600 mt-0.5 font-bold uppercase tracking-wider">Family Member</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {member.visitorType || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                                <PhoneIcon size={14} className="text-slate-400" />
                                                {member.contactNo}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {member.dnc ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                    DNC
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => setSelectedMember(member._originalMember || member)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingMember(member._originalMember || member)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Member"
                                                >
                                                    <EditIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setNotesMember(member._originalMember || member)}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Admin Notes"
                                                >
                                                    <MessageSquareIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => printMemberForm(member._originalMember || member)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Print Details"
                                                >
                                                    <PrinterIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(member.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Member"
                                                >
                                                    <TrashIcon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <SearchIcon size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-600">No members found</p>
                                            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};