import React, { useState } from 'react';
import { SearchIcon, TrashIcon, UserIcon, UsersIcon, PhoneIcon, EyeIcon, FileTextIcon, CrossIcon, FilterIcon } from '../../components/Icons';
import { Member } from '../../types';
import { AddMember } from './AddMember'; // Import AddMember for Edit Modal

interface MemberListProps {
  members: Member[];
  onDelete: (id: string) => void;
  onEdit: (member: Member) => void; // This will trigger the modal
}

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
                            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{member.name}</h2>
                            <p className="text-slate-500 text-sm font-medium">{member.id} • {member.visitorType}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 group"
                        aria-label="Close"
                    >
                        <CrossIcon size={24} className="text-slate-500 group-hover:text-red-600" />
                    </button>
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
                                <div><span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">DOB</span><span className="font-semibold text-slate-800">{member.dob || '-'}</span></div>
                                <div><span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Anniversary</span><span className="font-semibold text-slate-800">{member.doa || '-'}</span></div>
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
                                Family Members ({member.familyCount})
                            </h3>
                        </div>
                        
                        {member.familyMembers.length > 0 ? (
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
                                                    <td className="p-4 text-slate-600">{fm.dob || '-'}</td>
                                                    <td className="p-4 text-slate-600">{fm.doa || '-'}</td>
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


export const MemberList: React.FC<MemberListProps> = ({ members, onDelete, onEdit }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGGRP, setFilterGGRP] = useState('All');
  const [filterMarital, setFilterMarital] = useState('All');
  const [filterDOB, setFilterDOB] = useState('');
  const [filterAnniversary, setFilterAnniversary] = useState('');

  // FILTER LOGIC
  const filteredMembers = members.filter(member => {
      // 1. Search (Name, Contact, ID - Head OR Family)
      const term = searchTerm.toLowerCase();
      const matchesHead = 
          member.name.toLowerCase().includes(term) || 
          member.contactNo.includes(term) ||
          member.id.includes(term);
      
      const matchesFamily = member.familyMembers.some(fm => 
          fm.name.toLowerCase().includes(term) || 
          fm.contactNo.includes(term)
      );

      if (!matchesHead && !matchesFamily) return false;

      // 2. GGRP
      if (filterGGRP !== 'All') {
          if (filterGGRP === 'Yes' && !member.ggrp) return false;
          if (filterGGRP === 'No' && member.ggrp) return false;
      }

      // 3. Marital Status
      if (filterMarital !== 'All') {
          if (member.maritalStatus !== filterMarital) return false;
      }

      // 4. DOB
      if (filterDOB && member.dob !== filterDOB) return false;

      // 5. Anniversary
      if (filterAnniversary && member.doa !== filterAnniversary) return false;

      return true;
  });

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

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Member Directory</h2>
           <p className="text-slate-500 text-sm mt-1">Total Registered Members: {members.length}</p>
        </div>
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
                  <span className="text-xs text-slate-500 font-medium">DOB:</span>
                  <input type="date" value={filterDOB} onChange={(e) => setFilterDOB(e.target.value)} className="bg-transparent py-1 text-sm text-slate-900 outline-none cursor-pointer" />
              </div>
               <div className="flex items-center gap-2 bg-slate-50 px-2 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Anniv:</span>
                  <input type="date" value={filterAnniversary} onChange={(e) => setFilterAnniversary(e.target.value)} className="bg-transparent py-1 text-sm text-slate-900 outline-none cursor-pointer" />
              </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">GGRP</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Member Details</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-64">Notes</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="group hover:bg-slate-50/80 transition-all duration-200">
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
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{member.familyCount} Family Members</p>
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
                    <td className="py-4 px-6">
                        {member.notes ? (
                            <p className="text-xs text-slate-600 line-clamp-2 max-w-[200px] bg-yellow-50/50 p-2 rounded border border-yellow-100/50">
                                {member.notes}
                            </p>
                        ) : (
                            <span className="text-xs text-slate-400 italic opacity-50">Add note...</span>
                        )}
                    </td>
                    <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                                onClick={() => setSelectedMember(member)}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="View Details"
                            >
                                <EyeIcon size={18} />
                            </button>
                            <button 
                                onClick={() => onEdit(member)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Member"
                            >
                                <FileTextIcon size={18} />
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