import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  User, LayoutGrid, FileText,
  BarChart3, Settings as SettingsIcon,
  AlertCircle, CheckCircle2, HelpCircle
} from 'lucide-react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AddBill } from './components/AddBill';
import { Analytics } from './components/Analytics';
import { BillingRecords } from './components/BillingRecords';
import { Settings } from './components/Settings';
import { Members } from './components/Members';
import { Ponds } from './components/Ponds';
import { ConfirmInvite } from './components/ConfirmInvite';
import { supabase } from './lib/supabaseClient';
import { registerModalCallback, showConfirm } from './lib/modal';
import './App.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'billing-records' | 'usage' | 'workspace-members' | 'ponds' | 'settings'>('dashboard');
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [pondsInitialTab, setPondsInitialTab] = useState<'ponds' | 'species' | 'categories'>('ponds');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'editor' | 'viewer' | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  useEffect(() => {
    registerModalCallback((state) => {
      setModalState(state);
    });
  }, []);


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

  useEffect(() => {
    const fetchUserRoleAndWorkspace = async () => {
      if (!session || !session.user) {
        setWorkspaceId(null);
        setUserRole(null);
        return;
      }

      try {
        const user = session.user;
        
        // 1. Query workspaces owned by this user
        const { data: workspaces, error: wsError } = await supabase
          .from('workspaces')
          .select('id, name, owner_id')
          .eq('owner_id', user.id);

        if (wsError) throw wsError;

        if (workspaces && workspaces.length > 0) {
          setWorkspaceId(workspaces[0].id);
          setUserRole('owner');
          return;
        }

        // 2. Check workspace_members
        const { data: memberRecords, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id, role')
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        if (memberRecords && memberRecords.length > 0) {
          const record = memberRecords[0];
          setWorkspaceId(record.workspace_id);
          setUserRole(record.role as any);
        } else {
          setWorkspaceId(null);
          setUserRole('viewer');
        }
      } catch (err) {
        console.error('Error fetching user role and workspace:', err);
        setWorkspaceId(null);
        setUserRole('viewer');
      }
    };

    fetchUserRoleAndWorkspace();
  }, [session]);

  const canEdit = userRole !== 'viewer';

  const handleSignOut = async () => {
    const confirmLogout = await showConfirm('Are you sure you want to sign out?');
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
            workspaceId={workspaceId}
            canEdit={canEdit}
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
            workspaceId={workspaceId}
            canEdit={canEdit}
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
            workspaceId={workspaceId}
          />
        );
      case 'workspace-members':
        return <Members onBack={() => setActiveTab('settings')} canEdit={canEdit} workspaceId={workspaceId} />;
      case 'ponds':
        return (
          <Ponds 
            onBack={() => setActiveTab('settings')} 
            initialTab={pondsInitialTab} 
            workspaceId={workspaceId}
            canEdit={canEdit}
          />
        );
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
            workspaceId={workspaceId}
            canEdit={canEdit}
          />
        );
      case 'settings':
        return (
          <Settings
            onSignOut={handleSignOut}
            onNavigateToMembers={() => setActiveTab('workspace-members')}
            onNavigateToPonds={() => {
              setPondsInitialTab('ponds');
              setActiveTab('ponds');
            }}
            onNavigateToSpecies={() => {
              setPondsInitialTab('species');
              setActiveTab('ponds');
            }}
            onNavigateToCategories={() => {
              setPondsInitialTab('categories');
              setActiveTab('ponds');
            }}
          />
        );
      default:
        return (
          <Dashboard 
            workspaceId={workspaceId}
            canEdit={canEdit}
          />
        );
    }
  };

  const handleModalConfirm = () => {
    if (modalState) {
      modalState.onConfirm();
      setModalState(null);
    }
  };

  const handleModalCancel = () => {
    if (modalState) {
      modalState.onCancel();
      setModalState(null);
    }
  };

  const isConfirmInvite = window.location.pathname === '/confirm-invite';

  if (isConfirmInvite) {
    return <ConfirmInvite onBackToLogin={() => { window.location.href = '/'; }} />;
  }

  if (loading) {
    return (
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#ECFDF5]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0F766E]/20">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 7 C 5.5 9, 7.5 5, 10 7 C 12.5 9, 14.5 5, 17 7 C 19.5 9, 20.5 6, 21 6.5" />
                <path d="M3 12 C 5.5 14, 7.5 10, 10 12 C 12.5 14, 14.5 10, 17 12 C 19.5 14, 20.5 11, 21 11.5" />
                <path d="M3 17 C 5.5 19, 7.5 15, 10 17 C 12.5 19, 14.5 15, 17 17 C 19.5 19, 20.5 16, 21 16.5" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#5EEAD4] rounded-full animate-pulse-soft" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-[#0F766E] tracking-wider uppercase">ABMS</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="w-full h-svh bg-[#F1F5F9] select-none flex justify-center items-center overflow-hidden">
      {/* Container to restrict width for clean mobile look, while centering it */}
      <div className="w-full max-w-[480px] bg-[#F8FAFC] h-full flex flex-col relative shadow-xl md:border-x md:border-[#E2E8F0] overflow-hidden">

        {/* Top Header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F1F5F9] px-4 py-3 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-sm shadow-[#0F766E]/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M3 7 C 5.5 9, 7.5 5, 10 7 C 12.5 9, 14.5 5, 17 7 C 19.5 9, 20.5 6, 21 6.5" />
                <path d="M3 12 C 5.5 14, 7.5 10, 10 12 C 12.5 14, 14.5 10, 17 12 C 19.5 14, 20.5 11, 21 11.5" />
                <path d="M3 17 C 5.5 19, 7.5 15, 10 17 C 12.5 19, 14.5 15, 17 17 C 19.5 19, 20.5 16, 21 16.5" />
              </svg>
            </div>
            <span className="font-extrabold text-[#0F766E] text-[15px] tracking-wide uppercase">ABMS</span>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#0F766E] transition-all focus:outline-none cursor-pointer"
            title="View Profile / Settings"
          >
            <User size={18} strokeWidth={2} />
          </button>
        </header>

        {/* Dynamic content area */}
        {renderActiveTabContent()}

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0]/60 px-2 flex justify-around items-center z-50 h-[66px]">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutGrid },
            ...(canEdit ? [{ id: 'bills', label: 'Bills', icon: FileText }] : []),
            { id: 'usage', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const isActive =
              (item.id === 'dashboard' && activeTab === 'dashboard') ||
              (item.id === 'bills' && (activeTab === 'bills' || activeTab === 'billing-records')) ||
              (item.id === 'usage' && activeTab === 'usage') ||
              (item.id === 'settings' && (activeTab === 'settings' || activeTab === 'workspace-members' || activeTab === 'ponds'));
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
                className={`focus:outline-none cursor-pointer transition-all duration-250 flex flex-col items-center justify-center gap-0.5 w-[72px] py-1.5 rounded-xl press-effect ${isActive
                    ? 'text-[#0F766E]'
                    : 'text-slate-400 hover:text-slate-500'
                  }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#0F766E] mt-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Custom Alert/Confirm Modal */}
        {modalState && modalState.isOpen && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-5 text-left animate-fade-in select-none">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-2xl w-full max-w-[340px] text-center space-y-4 animate-scale-up">
              <div className="flex justify-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  modalState.type === 'confirm' 
                    ? 'bg-teal-50 text-[#0F766E]' 
                    : modalState.message.toLowerCase().includes('success') || modalState.message.toLowerCase().includes('saved') || modalState.message.toLowerCase().includes('activated') || modalState.message.toLowerCase().includes('updated') || modalState.message.toLowerCase().includes('successfully')
                      ? 'bg-emerald-50 text-emerald-600'
                      : modalState.message.toLowerCase().includes('fail') || modalState.message.toLowerCase().includes('error') || modalState.message.toLowerCase().includes('cannot') || modalState.message.toLowerCase().includes('timed out')
                        ? 'bg-rose-50 text-rose-500'
                        : 'bg-teal-50 text-[#0F766E]'
                }`}>
                  {modalState.type === 'confirm' ? (
                    <HelpCircle size={24} strokeWidth={2.5} />
                  ) : modalState.message.toLowerCase().includes('success') || modalState.message.toLowerCase().includes('saved') || modalState.message.toLowerCase().includes('activated') || modalState.message.toLowerCase().includes('updated') || modalState.message.toLowerCase().includes('successfully') ? (
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  ) : (
                    <AlertCircle size={24} strokeWidth={2.5} />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  {modalState.type === 'confirm' ? 'Confirm Action' : 'Notification'}
                </h3>
                <p className="text-[12px] font-bold text-slate-500 leading-relaxed max-w-[90%] mx-auto">
                  {modalState.message}
                </p>
              </div>

              <div className="flex gap-2.5 pt-1.5">
                {modalState.type === 'confirm' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleModalCancel}
                      className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleModalConfirm}
                      className="flex-1 h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer focus:outline-none"
                    >
                      OK
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleModalConfirm}
                    className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer focus:outline-none"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
