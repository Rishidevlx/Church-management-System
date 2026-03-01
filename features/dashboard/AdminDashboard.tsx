import React, { useMemo } from 'react';
import {
  UsersIcon, HomeIcon, CakeIcon, HeartIcon, UserPlusIcon,
  BriefcaseIcon, BellIcon, FilterIcon, ClockIcon,
  GiftIcon, PhoneIcon, MapPinIcon, StarIcon,
  CheckCircle2Icon, EyeIcon, MessageSquareIcon, PrinterIcon
} from '../../components/Icons';
import { getDaysUntilNext, ReminderRecord } from '../admin/Reminders';
import { Member } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { printMemberForm } from '../../utils/printUtils';

interface AdminDashboardProps {
  onNavigate: (view: 'dashboard' | 'add-member' | 'member-list' | 'advanced-filters' | 'birthday' | 'anniversary' | 'family' | 'area' | 'reminders') => void;
  memberCount: number;
  members: Member[];
  wishedIds: Set<string>;
  starredIds: Set<string>;
  onToggleWished: (id: string) => void;
  onToggleStarred: (id: string) => void;
  onUpdateMember?: (m: Member) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate, memberCount, members,
  wishedIds, starredIds, onToggleWished, onToggleStarred
}) => {

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalIndividuals = 0;
    let todayBirthdays = 0;
    let todayAnniversaries = 0;

    members.forEach(m => {
      totalIndividuals += 1 + (m.familyMembers?.length || 0);
      if (getDaysUntilNext(m.dob)?.days === 0) todayBirthdays++;
      if (getDaysUntilNext(m.doa)?.days === 0) todayAnniversaries++;
      m.familyMembers?.forEach(fm => {
        if (getDaysUntilNext(fm.dob)?.days === 0) todayBirthdays++;
        if (getDaysUntilNext(fm.doa)?.days === 0) todayAnniversaries++;
      });
    });

    return {
      totalIndividuals,
      totalFamilies: members.length,
      todayBirthdays,
      todayAnniversaries,
    };
  }, [members]);

  // ─── Today's Reminder Records (max 5 shown) ─────────────────────────────────
  const todayRecords = useMemo(() => {
    const records: ReminderRecord[] = [];

    members.forEach(member => {
      const headDOB = getDaysUntilNext(member.dob);
      if (headDOB?.days === 0) records.push({
        id: `${member.id}_head_dob`, type: 'birthday',
        name: member.name, relationship: 'Head of Family',
        contactNo: member.contactNo, area: member.district || member.churchArea || '',
        dateStr: member.dob, daysUntil: 0, isHead: true, dnc: member.dnc || false,
        familyId: member.id, headName: member.name, ageOrYears: headDOB.years,
        memberId: member.id,
      });

      const headDOA = getDaysUntilNext(member.doa);
      if (headDOA?.days === 0) {
        records.push({
          id: `${member.id}_head_doa`, type: 'anniversary',
          name: member.name, relationship: 'Head of Family',
          contactNo: member.contactNo, area: member.district || member.churchArea || '',
          dateStr: member.doa, daysUntil: 0, isHead: true, dnc: member.dnc || false,
          familyId: member.id, headName: member.name, ageOrYears: headDOA.years,
          memberId: member.id,
        });
      }

      member.familyMembers?.forEach((fm, index) => {
        const fmDOB = getDaysUntilNext(fm.dob);
        if (fmDOB?.days === 0) records.push({
          id: `${member.id}_fm_${index}_dob`, type: 'birthday',
          name: fm.name, relationship: fm.relationship,
          contactNo: fm.contactNo || member.contactNo,
          area: member.district || member.churchArea || '',
          dateStr: fm.dob, daysUntil: 0, isHead: false, dnc: member.dnc || false,
          familyId: member.id, headName: member.name, ageOrYears: fmDOB.years,
          memberId: member.id,
        });

        const fmDOA = getDaysUntilNext(fm.doa);
        if (fmDOA?.days === 0) records.push({
          id: `${member.id}_fm_${index}_doa`, type: 'anniversary',
          name: fm.name, relationship: fm.relationship,
          contactNo: fm.contactNo || member.contactNo,
          area: member.district || member.churchArea || '',
          dateStr: fm.doa, daysUntil: 0, isHead: false, dnc: member.dnc || false,
          familyId: member.id, headName: member.name, ageOrYears: fmDOA.years,
          memberId: member.id,
        });
      });
    });

    return records;
  }, [members]);

  const previewRecords = todayRecords.slice(0, 5);

  // ─── Mini table row ───────────────────────────────────────────────────────
  const MiniRow: React.FC<{ item: ReminderRecord; idx: number }> = ({ item, idx }) => {
    const isWished = wishedIds.has(item.id);
    const isStarred = starredIds.has(item.id);
    const isBirthday = item.type === 'birthday';
    return (
      <tr className={`group transition-colors border-b border-slate-100 last:border-0
                ${isWished ? 'bg-emerald-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-50`}>

        {/* Type + Name */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border
                            ${isBirthday ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`font-bold text-slate-800 text-sm leading-tight ${isWished ? 'line-through text-slate-400' : ''}`}>
                {item.name}
              </p>
              {!item.isHead && (
                <p className="text-[11px] text-slate-400 mt-0.5">C/o {item.headName}</p>
              )}
            </div>
          </div>
        </td>

        {/* Type badge */}
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                        ${isBirthday ? 'bg-brand-50 text-brand-600 border-brand-100' : 'bg-pink-50 text-pink-600 border-pink-100'}`}>
            {isBirthday ? <GiftIcon size={10} /> : <HeartIcon size={10} />}
            {isBirthday ? 'Birthday' : 'Anniversary'}
          </span>
        </td>

        {/* Contact */}
        <td className="py-3 px-4 hidden md:table-cell">
          {item.contactNo
            ? <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <PhoneIcon size={11} className="text-slate-400" />{item.contactNo}
            </span>
            : <span className="text-xs text-slate-300 italic">—</span>
          }
        </td>

        {/* District */}
        <td className="py-3 px-4 hidden lg:table-cell">
          {item.area
            ? <span className="flex items-center gap-1 text-xs text-slate-600">
              <MapPinIcon size={11} className="text-slate-400 shrink-0" />{item.area}
            </span>
            : <span className="text-xs text-slate-300 italic">—</span>
          }
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1">
            {/* Mark Wished */}
            <button
              onClick={() => onToggleWished(item.id)}
              title={isWished ? 'Undo Wished' : 'Mark Wished'}
              className={`p-1.5 rounded-lg border text-xs transition-all
                                ${isWished ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'}`}
            >
              <CheckCircle2Icon size={14} />
            </button>

            {/* Print Form */}
            <button
              onClick={() => {
                const m = members.find(mx => mx.id === item.memberId);
                if (m) printMemberForm(m);
              }}
              title="Print Pre-filled Form"
              className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
            >
              <PrinterIcon size={14} />
            </button>

            {/* Call */}
            <a href={item.contactNo && !item.dnc ? `tel:${item.contactNo}` : undefined}
              onClick={e => (!item.contactNo || item.dnc) && e.preventDefault()}
              title={item.dnc ? 'DNC' : 'Call'}
              className={`p-1.5 rounded-lg border transition-all
                                ${item.contactNo && !item.dnc ? 'bg-white border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50' : 'bg-slate-50 border-slate-100 text-slate-300 pointer-events-none'}`}
            >
              <PhoneIcon size={14} />
            </a>

            {/* Star */}
            <button
              onClick={() => onToggleStarred(item.id)}
              title={isStarred ? 'Unstar' : 'Priority'}
              className={`p-1.5 rounded-lg border transition-all
                                ${isStarred ? 'bg-amber-50 border-amber-300 text-amber-500 hover:bg-amber-100' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50'}`}
            >
              <StarIcon size={14} className={isStarred ? 'fill-amber-400' : ''} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => onNavigate('member-list')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalIndividuals}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><UsersIcon size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Families</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalFamilies}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors"><HomeIcon size={20} /></div>
          </div>
        </div>

        <div onClick={() => onNavigate('birthday')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Birthdays</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.todayBirthdays}</h3>
            </div>
            <div className="p-2 bg-pink-50 text-pink-500 rounded-lg group-hover:bg-pink-100 transition-colors"><CakeIcon size={20} /></div>
          </div>
        </div>

        <div onClick={() => onNavigate('anniversary')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Anniversaries</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.todayAnniversaries}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg group-hover:bg-orange-100 transition-colors"><HeartIcon size={20} /></div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Member', view: 'add-member' as const, icon: <UserPlusIcon size={20} />, color: 'bg-brand-50 text-brand-600' },
          { label: 'Member List', view: 'member-list' as const, icon: <UsersIcon size={20} />, color: 'bg-purple-50 text-purple-600' },
          { label: 'Filters', view: 'advanced-filters' as const, icon: <FilterIcon size={20} />, color: 'bg-teal-50 text-teal-600' },
          { label: 'Reminders', view: 'reminders' as const, icon: <ClockIcon size={20} />, color: 'bg-orange-50 text-orange-600' },
        ].map(({ label, view, icon, color }) => (
          <button key={view} onClick={() => onNavigate(view)}
            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-brand-300 transition-all group">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>{icon}</div>
            <span className="text-xs font-bold text-slate-700">{label}</span>
          </button>
        ))}
      </div>

      {/* 3. Today's Reminders — mini table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
              <BellIcon size={17} />
            </div>
            <h3 className="font-bold text-slate-800">Today's Reminders</h3>
            {todayRecords.length > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                {todayRecords.length} total
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline transition-colors"
          >
            View All →
          </button>
        </div>

        {todayRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <BellIcon size={20} className="opacity-30" />
            </div>
            <p className="text-sm font-semibold">No birthdays or anniversaries today</p>
            <p className="text-xs mt-1 text-slate-300">Check back tomorrow!</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Name</th>
                  <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Type</th>
                  <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left hidden md:table-cell">Contact</th>
                  <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left hidden lg:table-cell">District</th>
                  <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {previewRecords.map((item, idx) => (
                  <MiniRow key={item.id} item={item} idx={idx} />
                ))}
              </tbody>
            </table>

            {todayRecords.length > 5 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-semibold">
                  Showing 5 of {todayRecords.length} reminders
                </p>
                <button
                  onClick={() => onNavigate('reminders')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  + {todayRecords.length - 5} more → View All
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
