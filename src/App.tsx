import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Bell, LayoutGrid, FileText, 
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'billing-records' | 'usage' | 'workspace-members' | 'settings'>('dashboard');
  const [editBillId, setEditBillId] = useState<string | null>(null);

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
        return (
          <Dashboard 
            onEditBill={(id) => {
              setEditBillId(id);
              setActiveTab('bills');
            }}
            onViewAllBills={() => {
              setEditBillId(null);
              setActiveTab('billing-records');
            }}
          />
        );
      case 'billing-records':
        return (
          <BillingRecords 
            onCreateClick={() => {
              setEditBillId(null);
              setActiveTab('bills');
            }}
            onEditBill={(id) => {
              setEditBillId(id);
              setActiveTab('bills');
            }}
          />
        );
      case 'bills':
        return (
          <AddBill 
            editBillId={editBillId}
            onSave={() => {
              setEditBillId(null);
              setActiveTab('billing-records');
            }}
            onViewRecords={() => {
              setEditBillId(null);
              setActiveTab('billing-records');
            }}
          />
        );
      case 'workspace-members':
        return <Members onBack={() => setActiveTab('settings')} />;
      case 'usage':
        return (
          <Analytics 
            onCreateClick={() => {
              setEditBillId(null);
              setActiveTab('bills');
            }}
            onEditBill={(id) => {
              setEditBillId(id);
              setActiveTab('bills');
            }}
          />
        );
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
          <div className="flex items-center gap-1.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5 C 5.5 7, 7.5 3, 10 5 C 12.5 7, 14.5 3, 17 5 C 19.5 7, 20.5 4, 21 4.5" />
              <path d="M3 10 C 5.5 12, 7.5 8, 10 10 C 12.5 12, 14.5 8, 17 10 C 19.5 12, 20.5 9, 21 9.5" />
              <path d="M3 15 C 5.5 17, 7.5 13, 10 15 C 12.5 17, 14.5 13, 17 15 C 19.5 17, 20.5 14, 21 14.5" />
              <path d="M3 20 C 5.5 22, 7.5 18, 10 20 C 12.5 22, 14.5 18, 17 20 C 19.5 22, 20.5 19, 21 19.5" />
            </svg>
            <span className="font-bold text-[#0F766E] text-base tracking-wide uppercase">ABMS</span>
          </div>
          <div className="flex items-center gap-3.5">
            <button className="text-slate-600 hover:text-[#0F766E] relative transition-colors focus:outline-none cursor-pointer">
              <Bell size={22} />
            </button>
          </div>
        </header>

        {/* Dynamic content area */}
        {renderActiveTabContent()}

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F1F5F9] px-4 py-2 flex justify-around items-center shadow-lg z-50 h-[68px]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
            { id: 'bills', label: 'Bills', icon: FileText },
            { id: 'usage', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const isActive = 
              (item.id === 'dashboard' && activeTab === 'dashboard') ||
              (item.id === 'bills' && (activeTab === 'bills' || activeTab === 'billing-records')) ||
              (item.id === 'usage' && activeTab === 'usage') ||
              (item.id === 'settings' && (activeTab === 'settings' || activeTab === 'workspace-members'));
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'bills') {
                    setEditBillId(null);
                  }
                  setActiveTab(item.id as any);
                }}
                className={`focus:outline-none cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 w-20 py-1 ${
                  isActive 
                    ? 'text-[#0F766E]' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold tracking-wide capitalize ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        
      </div>
    </div>
  );
}

export default App;
