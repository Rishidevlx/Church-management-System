import React, { useState } from 'react';
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
  onNavigate: (view: 'dashboard' | 'add-member' | 'member-list' | 'advanced-filters' | 'birthday') => void;
  currentView: string;
  globalLogo?: string;
  globalName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose, onLogout, onNavigate, currentView, globalLogo, globalName }) => {
  const [isHovered, setIsHovered] = useState(false);

  const superAdminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={20} /> },
    { id: 'create-admin', label: 'Create Admin', icon: <UserPlusIcon size={20} /> },
    { id: 'admin-list', label: 'Admin List', icon: <UsersIcon size={20} /> },
    { id: 'super-settings', label: 'System Settings', icon: <SettingsIcon size={20} /> },
    { id: 'logs', label: 'Activity Logs', icon: <ActivityIcon size={20} /> },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={20} /> },
    { id: 'add-member', label: 'Add Member', icon: <UserPlusIcon size={20} /> },
    { id: 'member-list', label: 'Member List', icon: <UsersIcon size={20} /> },
    { id: 'advanced-filters', label: 'Advanced Filters', icon: <FilterIcon size={20} /> },
    { id: 'birthday', label: 'Birthday Reports', icon: <GiftIcon size={20} /> },
    { id: 'anniversary', label: 'Anniversary Reports', icon: <HeartIcon size={20} /> },
    { id: 'family', label: 'Family Reports', icon: <UsersIcon size={20} /> },
    { id: 'area', label: 'Area-wise Reports', icon: <MapPinIcon size={20} /> },
    { id: 'reminders', label: 'Reminders', icon: <ClockIcon size={20} /> },
    { id: 'print', label: 'Print / Export', icon: <PrinterIcon size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  const menuItems = role === 'super_admin' ? superAdminMenu : adminMenu;

  const handleNavigation = (id: string) => {
    // Only implemented views for now
    if (['dashboard', 'add-member', 'member-list', 'advanced-filters', 'birthday', 'anniversary', 'family', 'area', 'reminders', 'print', 'settings', 'create-admin', 'admin-list', 'logs', 'super-settings'].includes(id)) {
      onNavigate(id as any);
    }
    onClose(); // Close sidebar on mobile
  };

  const displayName = globalName || 'Church Management';
  const nameParts = displayName.split(' ');
  const firstPart = nameParts[0];
  const restPart = nameParts.slice(1).join(' ');

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
      <div
        className={`
          fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200 z-50
          transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${!isOpen ? (isHovered ? 'lg:w-72 shadow-2xl' : 'lg:w-[88px]') : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header (Logo) */}
        <div className={`h-16 flex items-center px-6 border-b border-slate-100 transition-all duration-300 ${!isOpen && !isHovered ? 'justify-center' : 'justify-between'}`}>
          {(!isOpen && !isHovered) ? (
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700 font-bold shadow-sm overflow-hidden">
              {globalLogo ? <img src={globalLogo} alt="Logo" className="w-6 h-6 object-contain" /> : firstPart[0]}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-brand-700 font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">
              {globalLogo ? <img src={globalLogo} alt="Logo" className="w-7 h-7 object-contain flex-shrink-0" /> : null}
              {firstPart}<span className="text-slate-500 font-normal">{restPart}</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-2 scrollbar-hide ${!isOpen && !isHovered ? 'px-3' : 'px-4'}`}>
          {(!isOpen && !isHovered) ? (
            <div className="h-4 mb-4 flex justify-center border-b border-slate-100 w-8 mx-auto"></div>
          ) : (
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2 whitespace-nowrap overflow-hidden">
              {role === 'super_admin' ? 'Super Admin Controls' : 'Church Operations'}
            </div>
          )}

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${!isOpen && !isHovered ? 'justify-center' : 'gap-3'}
                ${currentView === item.id
                  ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
              title={(!isOpen && !isHovered) ? item.label : undefined}
            >
              <span className={`transition-colors flex-shrink-0 ${currentView === item.id ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              {(isOpen || isHovered) && (
                <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer (Logout) */}
        <div className={`p-4 border-t border-slate-100 bg-slate-50/50 ${!isOpen && !isHovered ? 'flex justify-center' : ''}`}>
          <button
            onClick={onLogout}
            title={(!isOpen && !isHovered) ? 'Logout System' : undefined}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors
              ${!isOpen && !isHovered ? 'justify-center' : 'gap-3'}
            `}
          >
            <span className="flex-shrink-0"><LogOutIcon size={20} /></span>
            {(isOpen || isHovered) && <span className="whitespace-nowrap">Logout System</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
