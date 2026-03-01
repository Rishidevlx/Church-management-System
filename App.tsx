import React, { useEffect, useState, useMemo } from 'react';
import { LoginForm } from './features/auth/LoginForm';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './features/dashboard/AdminDashboard';
import { AddMember } from './features/admin/AddMember';
import { MemberList } from './features/admin/MemberList';
import { AdvancedFilters } from './features/admin/AdvancedFilters';
import { BirthdayReports } from './features/admin/BirthdayReports';
import { AnniversaryReports } from './features/admin/AnniversaryReports';
import { FamilyReports } from './features/admin/FamilyReports';
import { AreaReports } from './features/admin/AreaReports';
import { Reminders, getDaysUntilNext } from './features/admin/Reminders';
import { PrintExport } from './features/admin/PrintExport';
import { Settings } from './features/admin/Settings';
import { SuperAdminDashboard } from './features/superadmin/SuperAdminDashboard';
import { extractDatePart } from './utils/dateUtils';
import { CreateAdmin } from './features/superadmin/CreateAdmin';
import { AdminList } from './features/superadmin/AdminList';
import { SystemSettings } from './features/superadmin/SystemSettings';
import { ActivityLogsList } from './features/superadmin/ActivityLogsList';
import { Member, Admin, ActivityLog, AdvancedFilterCriteria } from './types';
import { flattenToMatchingIndividuals } from './utils/filterUtils';
import { useNotification } from './context/NotificationContext';
import { API_URL } from './config';

// Placeholder Logo URL
const LOGO_URL = "https://www.freepik.com/free-vector/hand-drawn-church-logo-template_33802211.htm#fromView=search&page=1&position=3&uuid=b14b06a0-65c9-4a67-9fb9-b421ce9e9aa1&query=chruch+logo";


type ViewType = 'dashboard' | 'add-member' | 'member-list' | 'advanced-filters' | 'birthday' | 'anniversary' | 'family' | 'area' | 'reminders' | 'print' | 'settings' | 'super-dashboard' | 'create-admin' | 'admin-list' | 'logs';

function App() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | null>(() => localStorage.getItem('userRole') as any);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>(() => (localStorage.getItem('currentView') as ViewType) || 'dashboard');
  const { showNotification } = useNotification();

  // Shared Data State (Mock Database)
  const [globalLogo, setGlobalLogo] = useState<string>(LOGO_URL);
  const [globalName, setGlobalName] = useState<string>('Church Management');
  const [globalAddress, setGlobalAddress] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  // Filtered state for advanced search (can be heads or synthetic individuals)
  const [activeCriteria, setActiveCriteria] = useState<AdvancedFilterCriteria | null>(null);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem('notifPrefs');
      if (stored) return JSON.parse(stored);
    } catch (_) { }
    return { birthdays: true, anniversaries: true, dashboardAlerts: true };
  });

  const handleUpdateNotifs = (newPrefs: any) => {
    setNotifPrefs(newPrefs);
    localStorage.setItem('notifPrefs', JSON.stringify(newPrefs));
  };

  // Shared reminder interaction state — shared between Dashboard & Reminders
  const [wishedIds, setWishedIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const toggleWished = (id: string) => setWishedIds(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });
  const toggleStarred = (id: string) => setStarredIds(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const filteredMembers = useMemo(() => {
    if (!activeCriteria || (activeCriteria.quickFilter === 'none' && !activeCriteria.keyword && !activeCriteria.membershipNo && activeCriteria.areas.length === 0 && !activeCriteria.maritalStatus && !activeCriteria.ageFrom && !activeCriteria.ageTo && !activeCriteria.dobStart && !activeCriteria.dobEnd && !activeCriteria.anniversaryStart && !activeCriteria.anniversaryEnd && !activeCriteria.includeDNC)) {
      return null;
    }
    return flattenToMatchingIndividuals(members, activeCriteria);
  }, [members, activeCriteria]);

  // Super Admin State
  const [admins, setAdmins] = useState<Admin[]>([
    { id: '1', name: 'Super Admin', username: 'superadmin', email: 'super@ecclesia.com', phone: '9876543210', status: 'active', lastLogin: new Date().toISOString(), createdAt: new Date().toISOString() }
  ]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Generate random particles for the left panel
  const [particles] = useState(() =>
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 100 + 50}px`,
      height: `${Math.random() * 100 + 50}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 15}s`,
      opacity: Math.random() * 0.1 + 0.05,
    }))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginSuccess = (email: string, role: 'super_admin' | 'admin') => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView('dashboard');

    // Persist session
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  };

  const fetchInitialData = async (role: string) => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch Members
      const memberRes = await fetch(`${API_URL}/api/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const memberData = await memberRes.json();
      if (memberData.success) {
        // Clean all date fields: strip time/timezone from ISO strings → 'yyyy-mm-dd'
        const cleanedMembers = memberData.members.map((m: any) => ({
          ...m,
          dob: extractDatePart(m.dob),
          doa: extractDatePart(m.doa),
          familyMembers: (m.familyMembers || []).map((fm: any) => ({
            ...fm,
            dob: extractDatePart(fm.dob),
            doa: extractDatePart(fm.doa),
          }))
        }));
        setMembers(cleanedMembers);
      }

      // Fetch System Settings
      try {
        const settingsRes = await fetch(`${API_URL}/api/settings`);
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          if (settingsData.settings.global_logo) {
            setGlobalLogo(settingsData.settings.global_logo);
          }
          if (settingsData.settings.name) {
            setGlobalName(settingsData.settings.name);
          }
          if (settingsData.settings.address) {
            setGlobalAddress(settingsData.settings.address);
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }

      // Fetch Logs if super admin
      if (role === 'super_admin') {
        const logRes = await fetch(`${API_URL}/api/logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const logData = await logRes.json();
        if (logData.success) setActivityLogs(logData.logs);

        const adminRes = await fetch(`${API_URL}/api/admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const adminData = await adminRes.json();
        if (adminData.success) {
          const mappedAdmins = adminData.admins.map((a: any) => ({
            id: a.id.toString(),
            name: a.name,
            username: a.username || a.name.split(' ').join('').toLowerCase() + a.id,
            email: a.email,
            phone: a.phone || 'N/A',
            status: a.status,
            lastLogin: a.last_login,
            createdAt: a.created_at
          }));
          setAdmins(mappedAdmins);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData(userRole || 'admin');
    }
  }, [isAuthenticated, userRole]);

  const addActivityLog = async (action: string, module: string, description: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminEmail: userEmail,
          adminName: userRole === 'super_admin' ? 'Super Admin' : 'Church Admin',
          action,
          module,
          description,
          ipAddress: '127.0.0.1'
        })
      });
      // Refresh logs if in view
      if (currentView === 'logs' || currentView === 'super-dashboard') {
        const logRes = await fetch(`${API_URL}/api/logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const logData = await logRes.json();
        if (logData.success) setActivityLogs(logData.logs);
      }
    } catch (error) {
      console.error('Error posting log:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setCurrentView('dashboard');

    // Clear session
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentView');

    showNotification("Logged out successfully");
  };

  const handleAddMember = async (member: Member) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(member)
      });
      const data = await response.json();
      if (data.success) {
        setMembers(prev => [member, ...prev]);
        addActivityLog('Add Member', 'Members', `Added new member: ${member.name}`);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleUpdateMember = async (member: Member) => {
    // Fail-safe: Ensure we are only saving full Member records, not synthetic individuals
    const targetMember = (member as any)._originalMember || member;

    // If it's a family member being treated as a head, stop it from corrupting the DB
    if ((member as any)._isFamilyMember && !(member as any)._originalMember) {
      showNotification("Error: Cannot save partial family record. Please edit the main member.", "error");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      // Clean up synthetic fields before sending to backend
      const { uniqueKey, _isFamilyMember, _originalMember, personName, ...cleanMember } = targetMember as any;

      const response = await fetch(`${API_URL}/api/members/${targetMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanMember)
      });
      const data = await response.json();
      if (data.success) {
        setMembers(prev => prev.map(m => m.id === targetMember.id ? cleanMember as Member : m));
        addActivityLog('Update Member', 'Members', `Updated member details for: ${targetMember.name}`);
      }
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const token = localStorage.getItem('token');
    const memberName = members.find(m => m.id === id)?.name || id;
    try {
      const response = await fetch(`${API_URL}/api/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMembers(prev => prev.filter(m => m.id !== id));
        addActivityLog('Delete Member', 'Members', `Deleted member: ${memberName}`);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  const handleGlobalSearch = (query: string) => {
    setActiveCriteria({
      keyword: query,
      membershipNo: '',
      areas: [],
      maritalStatus: '',
      gender: '',
      ageFrom: '',
      ageTo: '',
      dobStart: '',
      dobEnd: '',
      anniversaryStart: '',
      anniversaryEnd: '',
      includeDNC: false,
      quickFilter: 'none'
    });
    handleNavigate('member-list');
  };

  // Render Logic based on current view
  const renderContent = () => {
    if (userRole === 'admin') {
      switch (currentView) {
        case 'add-member':
          return <AddMember onAddMember={handleAddMember} onCancel={() => handleNavigate('dashboard')} existingMembers={members} />;
        case 'member-list':
          return (
            <MemberList
              members={filteredMembers !== null ? filteredMembers : members}
              onDelete={handleDeleteMember}
              onEdit={handleUpdateMember}
              isFiltered={activeCriteria !== null}
              onClearFilters={() => setActiveCriteria(null)}
            />
          );
        case 'advanced-filters':
          return (
            <div className="space-y-6">
              <AdvancedFilters members={members} onApplyFilters={(sel) => setActiveCriteria(sel as any)} />
              <MemberList
                members={filteredMembers !== null ? filteredMembers : members}
                onDelete={handleDeleteMember}
                onEdit={handleUpdateMember}
                hideHeaderAndFilters={true}
                isFiltered={activeCriteria !== null}
                onClearFilters={() => setActiveCriteria(null)}
              />
            </div>
          );
        case 'birthday':
          return <BirthdayReports members={members} onUpdateMember={handleUpdateMember} />;
        case 'anniversary':
          return <AnniversaryReports members={members} onUpdateMember={handleUpdateMember} />;
        case 'family':
          return <FamilyReports members={members} onUpdateMember={handleUpdateMember} />;
        case 'area':
          return <AreaReports members={members} />;
        case 'reminders':
          return <Reminders members={members} onUpdateMember={handleUpdateMember} wishedIds={wishedIds} starredIds={starredIds} onToggleWished={toggleWished} onToggleStarred={toggleStarred} notifPrefs={notifPrefs} />;
        case 'print':
          return <PrintExport members={members} />;
        case 'settings':
          return <Settings notifPrefs={notifPrefs} onUpdateNotifs={handleUpdateNotifs} />;
        case 'dashboard':
        default:
          return <AdminDashboard onNavigate={handleNavigate} memberCount={members.length} members={members} wishedIds={wishedIds} starredIds={starredIds} onToggleWished={toggleWished} onToggleStarred={toggleStarred} onUpdateMember={handleUpdateMember} notifPrefs={notifPrefs} />;
      }
    } else if (userRole === 'super_admin') {
      switch (currentView) {
        case 'create-admin':
          return <CreateAdmin admins={admins} onAddAdmin={(a) => {
            // Trigger a re-fetch of admins instead of just local update
            fetchInitialData('super_admin');
            setCurrentView('admin-list');
          }} onAddLog={(l) => addActivityLog(l.action, l.module, l.description)} />;
        case 'admin-list':
          return <AdminList admins={admins} onUpdateAdmin={(a) => setAdmins(prev => prev.map(old => old.id === a.id ? a : old))} onDeleteAdmin={(id) => setAdmins(prev => prev.filter(a => a.id !== id))} onAddLog={(l) => addActivityLog(l.action, l.module, l.description)} />;
        case 'super-settings':
          return <SystemSettings onAddLog={(l) => addActivityLog(l.action, l.module, l.description)} globalLogo={globalLogo} onUpdateLogo={setGlobalLogo} onUpdateName={setGlobalName} onUpdateAddress={setGlobalAddress} />;
        case 'logs':
          return <ActivityLogsList logs={activityLogs} />;
        case 'super-dashboard':
        case 'dashboard':
        default:
          return <SuperAdminDashboard admins={admins} logs={activityLogs} families={members.length} members={members.length + members.reduce((acc, m) => acc + (m.familyMembers?.length || 0), 0)} todayBirthdays={members.filter(m => getDaysUntilNext(m.dob)?.days === 0).length} todayAnniversaries={members.filter(m => getDaysUntilNext(m.doa)?.days === 0).length} />;
      }
    }
    // Fallback
    return <AdminDashboard onNavigate={handleNavigate} memberCount={members.length} members={members} notifPrefs={notifPrefs} />;
  };

  // Count today's reminders (birthdays + anniversaries) for bell badge
  const reminderCount = React.useMemo(() => {
    if (!notifPrefs.dashboardAlerts) return 0;

    let count = 0;
    for (const member of members) {
      if (notifPrefs.birthdays && getDaysUntilNext(member.dob)?.days === 0) count++;
      if (notifPrefs.anniversaries && getDaysUntilNext(member.doa)?.days === 0) count++;
      if (member.familyMembers) {
        for (const fm of member.familyMembers) {
          if (notifPrefs.birthdays && getDaysUntilNext(fm.dob)?.days === 0) count++;
          if (notifPrefs.anniversaries && getDaysUntilNext(fm.doa)?.days === 0) count++;
        }
      }
    }
    return count;
  }, [members, notifPrefs]);

  // If Authenticated, Show Dashboard Layout
  if (isAuthenticated && userRole) {
    return (
      <DashboardLayout
        role={userRole}
        userEmail={userEmail}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
        reminderCount={reminderCount}
        globalLogo={globalLogo}
        globalName={globalName}
        onSearch={handleGlobalSearch}
      >
        {renderContent()}
      </DashboardLayout>
    );
  }

  // If Not Authenticated, Show Login Page
  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden font-sans">

      {/* LEFT PANEL - Decorative (Desktop Only) */}
      <div className="hidden lg:flex w-[45%] xl:w-[50%] relative bg-brand-900 flex-col justify-between p-12 text-white overflow-hidden">

        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 z-0">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-indigo-950 opacity-95"></div>

          {/* Animated Blobs (Large, Soft) */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Floating Particles/Bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute bg-white rounded-full animate-float"
                style={{
                  left: p.left,
                  bottom: '-150px', // Start below screen
                  width: '4px',
                  height: '4px',
                  boxShadow: `0 0 ${p.width} ${p.width} rgba(255, 255, 255, ${p.opacity})`, // Create soft glow
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              />
            ))}
          </div>

          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'0 0 2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
              {/* Logo Image with White Filter for Dark Background */}
              <img src={globalLogo} alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">{globalName}</span>
          </div>
        </div>

        <div className={`relative z-10 max-w-lg transition-all duration-1000 delay-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8 text-white drop-shadow-lg">
            Shepherd your flock with clarity and grace.
          </h2>
          <div className="flex gap-5 pl-1">
            <div className="w-1.5 bg-brand-400 rounded-full h-auto min-h-[60px] shadow-[0_0_15px_rgba(96,165,250,0.6)]"></div>
            <div>
              <p className="text-brand-50 text-xl italic leading-relaxed font-light">
                "I am the good shepherd. The good shepherd lays down his life for the sheep."
              </p>
              <p className="mt-4 text-brand-300 font-medium tracking-wide">— John 10:11</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-brand-200/70 font-medium">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          {globalName} Software v2.4.0
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto bg-white">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-brand-800">
          <div className="p-1.5 bg-brand-100 rounded-lg">
            <img src={globalLogo} alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-lg">{globalName}</span>
        </div>

        <div className={`w-full max-w-[420px] transition-all duration-700 transform ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-base">
              Please enter your credentials to access the portal.
            </p>
          </div>

          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}

export default App;