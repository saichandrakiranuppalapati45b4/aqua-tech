import React, { useState, useEffect } from 'react';
import { 
  Lock, Pencil, Shield, HelpCircle, 
  ExternalLink, ChevronRight, LogOut, FileText,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SettingsProps {
  onSignOut: () => void;
  onNavigateToMembers: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSignOut, onNavigateToMembers }) => {
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john@aquafarm.com');
  const [workspaceName, setWorkspaceName] = useState('Aqua Farm HQ');
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || 'Sunil Varma');
          setUserEmail(user.email || 'sunilvarma9993@gmail.com');
          
          // Fetch workspace name
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('name')
            .eq('owner_id', user.id);

          if (workspaces && workspaces.length > 0) {
            setWorkspaceName(workspaces[0].name);
          }
        }
      } catch (err) {
        console.error('Error fetching user settings:', err);
      }
    };

    fetchUserData();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full flex-1 p-4 pb-24 space-y-6 overflow-y-auto bg-[#F8FAFC]">
      {/* Title */}
      <div className="text-left animate-fade-in flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="3" className="stroke-linecap-round">
          <path d="M3 6.5 C 5.5 8.5, 7.5 4.5, 10 6.5 C 12.5 8.5, 14.5 4.5, 17 6.5 C 19.5 8.5, 20.5 5.5, 21 6" />
          <path d="M3 12.5 C 5.5 14.5, 7.5 10.5, 10 12.5 C 12.5 14.5, 14.5 10.5, 17 12.5 C 19.5 14.5, 20.5 11.5, 21 12" />
        </svg>
        <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Settings</h1>
      </div>

      {/* Profile Settings */}
      <div className="space-y-2.5 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Profile Settings</span>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm space-y-4 animate-card-enter">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3.5">
              {/* Avatar circle */}
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] text-[#0D9488] font-bold text-sm flex items-center justify-center select-none shadow-sm">
                {getInitials(userName)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{userName}</h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{userEmail}</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0F766E] transition-all cursor-pointer">
              <Pencil size={15} />
            </button>
          </div>

          <button 
            onClick={() => alert('Password change request sent.')}
            className="flex items-center justify-center gap-2 w-full h-11 border border-[#E2E8F0] hover:bg-slate-50 text-teal-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Lock size={14} />
            Change Password
          </button>
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="space-y-2.5 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Workspace Settings</span>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden divide-y divide-[#F1F5F9] animate-card-enter animate-card-enter-1">
          {/* Active Workspace Info */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-md shadow-[#0F766E]/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="stroke-linecap-round">
                <path d="M12 22C17.5 22 21 17 21 12C21 6.5 12 2 12 2C12 2 3 6.5 3 12C3 17 6.5 22 12 22Z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Workspace</p>
              <h4 className="text-xs font-bold text-slate-800 mt-0.5">{workspaceName}</h4>
            </div>
          </div>

          {/* Workspace Members Row */}
          <button 
            onClick={onNavigateToMembers}
            className="w-full p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-600">
              <Users size={18} />
              <span className="text-xs font-bold text-slate-700">Workspace Members</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* App Appearance */}
      <div className="space-y-2.5 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">App Appearance</span>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm animate-card-enter animate-card-enter-2">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const isActive = appearance === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setAppearance(mode)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer focus:outline-none ${
                    isActive 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Support & Legal */}
      <div className="space-y-2.5 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Support & Legal</span>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden divide-y divide-[#F1F5F9] animate-card-enter animate-card-enter-3">
          {/* Help Center */}
          <a 
            href="#help" 
            onClick={(e) => { e.preventDefault(); alert('Opening Help Center...'); }}
            className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-600">
              <HelpCircle size={18} />
              <span className="text-xs font-bold text-slate-700">Help Center</span>
            </div>
            <ExternalLink size={14} className="text-slate-400" />
          </a>

          {/* Privacy Policy */}
          <a 
            href="#privacy" 
            onClick={(e) => { e.preventDefault(); alert('Opening Privacy Policy...'); }}
            className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-600">
              <Shield size={18} />
              <span className="text-xs font-bold text-slate-700">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </a>

          {/* Terms of Service */}
          <a 
            href="#terms" 
            onClick={(e) => { e.preventDefault(); alert('Opening Terms of Service...'); }}
            className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-600">
              <FileText size={18} />
              <span className="text-xs font-bold text-slate-700">Terms of Service</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2 animate-card-enter animate-card-enter-3">
        <button 
          onClick={onSignOut}
          className="w-full h-11 bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none"
        >
          <LogOut size={15} />
          Sign Out
        </button>
        <p className="text-[10px] font-bold text-slate-400 text-center mt-4">
          AquaBilling v2.4.0-pro
        </p>
      </div>
    </div>
  );
};
