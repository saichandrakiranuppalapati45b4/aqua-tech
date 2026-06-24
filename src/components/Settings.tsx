import React, { useState, useEffect } from 'react';
import {
  Lock, Pencil, Shield, HelpCircle,
  ExternalLink, ChevronRight, LogOut, FileText,
  Users, Droplet, Sun, Moon, Monitor
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SettingsProps {
  onSignOut: () => void;
  onNavigateToMembers: () => void;
  onNavigateToPonds: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSignOut, onNavigateToMembers, onNavigateToPonds }) => {
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

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
      {/* Title */}
      <div className="text-left animate-fade-in">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Manage your account & preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Profile</span>
        <div className="bg-white border border-[#E2E8F0]/80 p-4 rounded-2xl shadow-sm space-y-4 animate-card-enter">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3.5">
              {/* Avatar circle */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CCFBF1] to-[#99F6E4] text-[#0D9488] font-bold text-sm flex items-center justify-center select-none shadow-sm ring-2 ring-white">
                {getInitials(userName)}
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-800">{userName}</h4>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{userEmail}</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0F766E] transition-all cursor-pointer focus:outline-none">
              <Pencil size={14} />
            </button>
          </div>

          <button
            onClick={() => alert('Password change request sent.')}
            className="flex items-center justify-center gap-2 w-full h-11 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer focus:outline-none press-effect"
          >
            <Lock size={14} strokeWidth={2.5} />
            Change Password
          </button>
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Workspace</span>
        <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-[#F1F5F9] animate-card-enter animate-card-enter-1">
          {/* Active Workspace Info */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center shadow-md shadow-[#0F766E]/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22C17.5 22 21 17 21 12C21 6.5 12 2 12 2C12 2 3 6.5 3 12C3 17 6.5 22 12 22Z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Workspace</p>
              <h4 className="text-[12px] font-bold text-slate-800 mt-0.5">{workspaceName}</h4>
            </div>
          </div>

          {/* Workspace Members Row */}
          <button
            onClick={onNavigateToMembers}
            className="w-full p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <Users size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Workspace Members</span>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* Pond Management */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Pond Management</span>
        <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm overflow-hidden animate-card-enter animate-card-enter-2">
          {/* Pond Configuration Row */}
          <button
            onClick={onNavigateToPonds}
            className="w-full p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <Droplet size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Pond Configuration</span>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* App Appearance */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Appearance</span>
        <div className="bg-white border border-[#E2E8F0]/80 p-3.5 rounded-2xl shadow-sm animate-card-enter animate-card-enter-2">
          <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
            {themeOptions.map((option) => {
              const isActive = appearance === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setAppearance(option.id)}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none ${isActive
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <Icon size={13} strokeWidth={2.5} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Support & Legal */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Support & Legal</span>
        <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-[#F1F5F9] animate-card-enter animate-card-enter-3">
          {/* Help Center */}
          <a
            href="#help"
            onClick={(e) => { e.preventDefault(); alert('Opening Help Center...'); }}
            className="p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <HelpCircle size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Help Center</span>
            </div>
            <ExternalLink size={13} className="text-slate-300" />
          </a>

          {/* Privacy Policy */}
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert('Opening Privacy Policy...'); }}
            className="p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <Shield size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Privacy Policy</span>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </a>

          {/* Terms of Service */}
          <a
            href="#terms"
            onClick={(e) => { e.preventDefault(); alert('Opening Terms of Service...'); }}
            className="p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <FileText size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Terms of Service</span>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </a>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-1 animate-card-enter animate-card-enter-4">
        <button
          onClick={onSignOut}
          className="w-full h-12 bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none border border-red-100"
        >
          <LogOut size={15} strokeWidth={2.5} />
          Sign Out
        </button>
        <p className="text-[10px] font-semibold text-slate-300 text-center mt-4 tracking-wide">
          AquaBilling v2.4.0 · Made with 💚
        </p>
      </div>
    </div>
  );
};
