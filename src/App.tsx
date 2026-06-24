import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Menu, Bell, Home, FileSpreadsheet, 
  BarChart3, Settings as SettingsIcon
} from 'lucide-react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AddBill } from './components/AddBill';
import { Analytics } from './components/Analytics';
import { BillingRecords } from './components/BillingRecords';
import { Settings } from './components/Settings';
import { Members } from './components/Members';
import { supabase } from './lib/supabaseClient';
import './App.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'add-invoice' | 'usage' | 'workspace-members' | 'settings'>('dashboard');

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen to auth state changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const confirmLogout = window.confirm('Are you sure you want to sign out?');
    if (confirmLogout) {
      await supabase.auth.signOut();
      setActiveTab('dashboard');
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoices':
        return <BillingRecords onCreateClick={() => setActiveTab('add-invoice')} />;
      case 'add-invoice':
        return <AddBill onSave={() => setActiveTab('invoices')} />;
      case 'workspace-members':
        return <Members onBack={() => setActiveTab('settings')} />;
      case 'usage':
        return <Analytics onCreateClick={() => setActiveTab('add-invoice')} />;
      case 'settings':
        return <Settings onSignOut={handleSignOut} onNavigateToMembers={() => setActiveTab('workspace-members')} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="3" className="stroke-linecap-round animate-bounce">
            <path d="M3 6.5 C 5.5 8.5, 7.5 4.5, 10 6.5 C 12.5 8.5, 14.5 4.5, 17 6.5 C 19.5 8.5, 20.5 5.5, 21 6" />
          </svg>
          <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Loading ABMS...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="w-full h-svh bg-[#F8FAFC] select-none flex justify-center items-center overflow-hidden">
      {/* Container to restrict width for clean mobile look, while centering it */}
      <div className="w-full max-w-[480px] bg-[#F8FAFC] h-full flex flex-col relative shadow-lg md:border-x md:border-[#E2E8F0] overflow-hidden">
        
        {/* Top Header */}
        <header className="sticky top-0 bg-white border-b border-[#F1F5F9] px-4 py-3 flex justify-between items-center z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="text-slate-600 hover:text-[#0F766E] transition-colors focus:outline-none cursor-pointer">
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="3" className="stroke-linecap-round">
                <path d="M3 6.5 C 5.5 8.5, 7.5 4.5, 10 6.5 C 12.5 8.5, 14.5 4.5, 17 6.5 C 19.5 8.5, 20.5 5.5, 21 6" />
                <path d="M3 12.5 C 5.5 14.5, 7.5 10.5, 10 12.5 C 12.5 14.5, 14.5 10.5, 17 12.5 C 19.5 14.5, 20.5 11.5, 21 12" />
              </svg>
              <span className="font-bold text-[#0F766E] text-base tracking-wide uppercase">ABMS</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <button className="text-slate-600 hover:text-[#0F766E] relative transition-colors focus:outline-none cursor-pointer">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic content area */}
        {renderActiveTabContent()}

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F1F5F9] px-4 py-2.5 flex justify-between items-center shadow-lg z-50 h-[68px]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'invoices', label: 'Invoices', icon: FileSpreadsheet },
            { id: 'usage', label: 'Usage', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const isActive = 
              (item.id === 'dashboard' && activeTab === 'dashboard') ||
              (item.id === 'invoices' && (activeTab === 'invoices' || activeTab === 'add-invoice')) ||
              (item.id === 'usage' && activeTab === 'usage') ||
              (item.id === 'settings' && (activeTab === 'settings' || activeTab === 'workspace-members'));
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`focus:outline-none cursor-pointer transition-all duration-300 flex items-center justify-center ${
                  isActive 
                    ? 'bg-[#CCFBF1] text-[#0F766E] px-4 py-2 rounded-full gap-2 font-bold text-xs scale-105 shadow-sm' 
                    : 'text-slate-400 hover:text-[#0F766E] p-2'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <span className="text-[10px] tracking-wide font-extrabold uppercase">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
      </div>
    </div>
  );
}

export default App;
