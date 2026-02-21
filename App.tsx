import React, { useEffect, useState } from 'react';
import { LoginForm } from './features/auth/LoginForm';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './features/dashboard/AdminDashboard';
import { AddMember } from './features/admin/AddMember';
import { MemberList } from './features/admin/MemberList';
import { Member } from './types';

// Placeholder Logo URL
const LOGO_URL = "https://www.freepik.com/free-vector/hand-drawn-church-logo-template_33802211.htm#fromView=search&page=1&position=3&uuid=b14b06a0-65c9-4a67-9fb9-b421ce9e9aa1&query=chruch+logo";


type ViewType = 'dashboard' | 'add-member' | 'member-list';

function App() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState('');
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Shared Data State (Mock Database)
  const [members, setMembers] = useState<Member[]>([]);

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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setCurrentView('dashboard');
  };

  const handleAddMember = (member: Member) => {
    // Check if member already exists (update)
    const exists = members.some(m => m.id === member.id);
    if (exists) {
        setMembers(prev => prev.map(m => m.id === member.id ? member : m));
    } else {
        setMembers(prev => [member, ...prev]);
    }
  };

  const handleUpdateMember = (member: Member) => {
      // Update existing member (called from MemberList edit modal)
      setMembers(prev => prev.map(m => m.id === member.id ? member : m));
  };

  const handleDeleteMember = (id: string) => {
      setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleNavigate = (view: ViewType) => {
      setCurrentView(view);
  }

  // Render Logic based on current view
  const renderContent = () => {
      if (userRole === 'admin') {
          switch (currentView) {
              case 'add-member':
                  return <AddMember onAddMember={handleAddMember} onCancel={() => handleNavigate('dashboard')} existingMembers={members} />;
              case 'member-list':
                  return <MemberList members={members} onDelete={handleDeleteMember} onEdit={handleUpdateMember} />;
              case 'dashboard':
              default:
                  return <AdminDashboard onNavigate={handleNavigate} memberCount={members.length} />;
          }
      }
      // Fallback for super_admin or other roles (reusing dashboard for now)
      return <AdminDashboard onNavigate={handleNavigate} memberCount={members.length} />;
  };

  // If Authenticated, Show Dashboard Layout
  if (isAuthenticated && userRole) {
    return (
      <DashboardLayout 
        role={userRole} 
        userEmail={userEmail} 
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
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
              <img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">Church Management</span>
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
           Church Management Software v2.4.0
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto bg-white">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-brand-800">
           <div className="p-1.5 bg-brand-100 rounded-lg">
              <img src={LOGO_URL} alt="Logo" className="w-5 h-5 object-contain" />
            </div>
           <span className="font-bold text-lg">Church Management</span>
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