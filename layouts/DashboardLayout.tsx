import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'super_admin' | 'admin';
  userEmail: string;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'add-member' | 'member-list') => void;
  currentView: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, userEmail, onLogout, onNavigate, currentView }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        role={role} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen transition-all duration-300">
        <Header 
          role={role} 
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fadeIn">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
