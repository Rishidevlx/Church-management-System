import React from 'react';
import { 
  LayoutDashboardIcon, UserPlusIcon, UsersIcon, SettingsIcon, 
  ActivityIcon, LogOutIcon, LockIcon, XIcon,
  FilterIcon, GiftIcon, HeartIcon, MapPinIcon, 
  CalendarIcon, ClockIcon, PrinterIcon
} from '../Icons';

interface SidebarProps {
  role: 'super_admin' | 'admin';
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'add-member' | 'member-list') => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose, onLogout, onNavigate, currentView }) => {
  
  const superAdminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={20} /> },
    { id: 'create-admin', label: 'Create Admin', icon: <UserPlusIcon size={20} /> },
    { id: 'admin-list', label: 'Admin List', icon: <UsersIcon size={20} /> },
    { id: 'settings', label: 'System Settings', icon: <SettingsIcon size={20} /> },
    { id: 'logs', label: 'Activity Logs', icon: <ActivityIcon size={20} /> },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={20} /> },
    { id: 'add-member', label: 'Add Member', icon: <UserPlusIcon size={20} /> },
    { id: 'member-list', label: 'Member List', icon: <UsersIcon size={20} /> },
    { id: 'filters', label: 'Advanced Filters', icon: <FilterIcon size={20} /> },
    { id: 'birthday', label: 'Birthday Reports', icon: <GiftIcon size={20} /> },
    { id: 'anniversary', label: 'Anniversary Reports', icon: <HeartIcon size={20} /> },
    { id: 'family', label: 'Family Reports', icon: <UsersIcon size={20} /> },
    { id: 'area', label: 'Area-wise Reports', icon: <MapPinIcon size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarIcon size={20} /> },
    { id: 'reminders', label: 'Reminders', icon: <ClockIcon size={20} /> },
    { id: 'print', label: 'Print / Export', icon: <PrinterIcon size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  const menuItems = role === 'super_admin' ? superAdminMenu : adminMenu;

  const handleNavigation = (id: string) => {
    // Only implemented views for now
    if (['dashboard', 'add-member', 'member-list'].includes(id)) {
        onNavigate(id as any);
    }
    onClose(); // Close sidebar on mobile
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header (Logo) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-lg tracking-tight">
            Church<span className="text-slate-500 font-normal">Management</span>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
            {role === 'super_admin' ? 'Super Admin Controls' : 'Church Operations'}
          </div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${currentView === item.id 
                  ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <span className={`transition-colors ${currentView === item.id ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Footer (Logout) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOutIcon size={20} />
            Logout System
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
