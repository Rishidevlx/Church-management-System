import React, { useState } from 'react';
import { 
  UsersIcon, HomeIcon, CakeIcon, HeartIcon, 
  UserPlusIcon, 
  BriefcaseIcon, BellIcon,
  FilterIcon, ClockIcon
} from '../../components/Icons';

// --- Types ---
interface Stats {
  totalMembers: number;
  totalFamilies: number;
  todayBirthdays: number;
  todayAnniversaries: number;
}

interface Reminder {
  id: string;
  name: string;
  detail: string;
  type: 'birthday' | 'anniversary' | 'appointment';
}

interface AdminDashboardProps {
  onNavigate: (view: 'dashboard' | 'add-member' | 'member-list') => void;
  memberCount: number; // Receive member count from parent
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, memberCount }) => {
  // --- State ---
  const [stats] = useState<Stats>({
    totalMembers: memberCount,
    totalFamilies: 0,
    todayBirthdays: 0,
    todayAnniversaries: 0,
  });

  const [reminders] = useState<Reminder[]>([]);

  // --- Helpers ---
  const renderEmptyState = (message: string, icon: React.ReactNode) => (
    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
      <div className="bg-slate-50 p-3 rounded-full mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members */}
        <div 
          onClick={() => onNavigate('member-list')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{memberCount}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <UsersIcon size={20} />
            </div>
          </div>
        </div>

        {/* Families */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Families</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalFamilies}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <HomeIcon size={20} />
            </div>
          </div>
        </div>

        {/* Birthdays */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Birthdays</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.todayBirthdays}</h3>
            </div>
            <div className="p-2 bg-pink-50 text-pink-500 rounded-lg group-hover:bg-pink-100 transition-colors">
              <CakeIcon size={20} />
            </div>
          </div>
        </div>

        {/* Anniversaries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Anniversaries</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.todayAnniversaries}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg group-hover:bg-orange-100 transition-colors">
              <HeartIcon size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Slot 1: Add Member */}
        <button 
          onClick={() => onNavigate('add-member')}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-brand-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UserPlusIcon size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Add Member</span>
        </button>

        {/* Slot 2: Member List */}
        <button 
          onClick={() => onNavigate('member-list')}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-brand-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UsersIcon size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Member List</span>
        </button>

        {/* Slot 3: Advanced Filters */}
        <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-brand-300 transition-all group">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FilterIcon size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Filters</span>
        </button>

        {/* Slot 4: Reminders */}
        <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-brand-300 transition-all group">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ClockIcon size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Reminders</span>
        </button>
      </div>

      {/* 3. TODAY'S REMINDERS (Full Width) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BellIcon size={18} className="text-brand-600" />
            Today's Reminders
          </h3>
          <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            View All
          </button>
        </div>
        
        <div className="p-0">
          {reminders.length > 0 ? (
             <div className="p-4">
               {/* Map logic would go here */}
             </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* Birthdays Section */}
              <div className="p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                   <CakeIcon size={14} className="text-pink-500" /> Birthdays
                 </div>
                 {renderEmptyState("No birthdays today", <CakeIcon size={20} className="opacity-50" />)}
              </div>

              {/* Anniversaries Section */}
              <div className="p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                   <HeartIcon size={14} className="text-orange-500" /> Anniversaries
                 </div>
                 {renderEmptyState("No anniversaries today", <HeartIcon size={20} className="opacity-50" />)}
              </div>

              {/* Appointments Section */}
              <div className="p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                   <BriefcaseIcon size={14} className="text-slate-600" /> Appointments
                 </div>
                 {renderEmptyState("No appointments scheduled", <BriefcaseIcon size={20} className="opacity-50" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
