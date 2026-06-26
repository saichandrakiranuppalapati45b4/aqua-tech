import React, { useState, useEffect } from 'react';
import {
  Lock, Pencil, Shield, HelpCircle,
  ExternalLink, ChevronRight, LogOut, FileText,
  Users, Droplet, Sun, Moon, Monitor, Tag,
  ArrowLeft, Mail, User, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { showAlert } from '../lib/modal';

interface SettingsProps {
  onSignOut: () => void;
  onNavigateToMembers: () => void;
  onNavigateToPonds: () => void;
  onNavigateToSpecies: () => void;
  onNavigateToCategories: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onSignOut, 
  onNavigateToMembers, 
  onNavigateToPonds, 
  onNavigateToSpecies,
  onNavigateToCategories
}) => {
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john@aquafarm.com');
  const [workspaceName, setWorkspaceName] = useState('Aqua Farm HQ');
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light');
  
  const [settingsView, setSettingsView] = useState<'menu' | 'edit-profile' | 'change-password'>('menu');
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Profile fields
  const [editName, setEditName] = useState('');

  // Change Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name || 'Sunil Varma';
          setUserName(fullName);
          setEditName(fullName);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showAlert("Please enter a name.");
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: editName.trim() }
      });
      if (authError) throw authError;

      // 2. Update profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: editName.trim() })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }

      setUserName(editName.trim());
      await showAlert('Profile updated successfully!');
      setSettingsView('menu');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      await showAlert(`Failed to update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showAlert('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Password must be at least 6 characters long.');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;

      await showAlert('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setSettingsView('menu');
    } catch (err: any) {
      console.error('Error changing password:', err);
      let errMsg = err.message || 'Unknown error';
      if (err.status === 504 || errMsg === '{}') {
        errMsg = 'Supabase Auth server timed out (Status 504). This usually means the Custom SMTP / Resend provider is misconfigured in your Supabase Dashboard, preventing the email notification from being sent.';
      }
      await showAlert(`Failed to change password: ${errMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (settingsView === 'edit-profile') {
    return (
      <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
        {/* Header */}
        <div className="text-left animate-fade-in flex items-center gap-3.5 border-b border-[#F1F5F9] pb-3.5">
          <button 
            type="button"
            onClick={() => setSettingsView('menu')}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[17px] font-bold text-slate-850 tracking-tight">Edit Profile</h1>
        </div>

        {/* Profile Card */}
        <form onSubmit={handleUpdateProfile} className="bg-white border border-[#E2E8F0]/80 p-5 rounded-2xl shadow-sm text-left space-y-5 animate-card-enter">
          <div className="flex flex-col items-center space-y-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CCFBF1] to-[#99F6E4] text-[#0D9488] font-bold text-xl flex items-center justify-center select-none shadow-sm ring-2 ring-white">
              {getInitials(userName)}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avatar Initials</span>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="block w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              />
            </div>
          </div>

          {/* Email Address (disabled/read-only) */}
          <div className="space-y-1.5 opacity-75">
            <label className="text-xs font-bold text-slate-700 tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                disabled
                value={userEmail}
                className="block w-full h-11 pl-10 pr-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-slate-450 cursor-not-allowed focus:outline-none"
              />
            </div>
            <p className="text-[9px] font-semibold text-slate-400 mt-1">
              Email address cannot be changed directly. Contact support if needed.
            </p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none disabled:opacity-70"
          >
            {isUpdating ? 'Saving Changes...' : 'Save Changes'}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => setSettingsView('menu')}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer pt-1"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  if (settingsView === 'change-password') {
    return (
      <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
        {/* Header */}
        <div className="text-left animate-fade-in flex items-center gap-3.5 border-b border-[#F1F5F9] pb-3.5">
          <button 
            type="button"
            onClick={() => setSettingsView('menu')}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[17px] font-bold text-slate-850 tracking-tight">Change Password</h1>
        </div>

        {/* Form Card */}
        <form onSubmit={handleChangePassword} className="bg-white border border-[#E2E8F0]/80 p-5 rounded-2xl shadow-sm text-left space-y-5 animate-card-enter">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="block w-full h-11 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="block w-full h-11 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none disabled:opacity-70"
          >
            {isUpdating ? 'Updating Password...' : 'Update Password'}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => setSettingsView('menu')}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer pt-1"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

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
            <button 
              onClick={() => setSettingsView('edit-profile')}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0F766E] transition-all cursor-pointer focus:outline-none"
            >
              <Pencil size={14} />
            </button>
          </div>

          <button
            onClick={() => setSettingsView('change-password')}
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
        <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-[#F1F5F9] animate-card-enter animate-card-enter-2">
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

          {/* Species Row */}
          <button
            onClick={onNavigateToSpecies}
            className="w-full p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <Tag size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Species</span>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </button>

          {/* Categories Row */}
          <button
            onClick={onNavigateToCategories}
            className="w-full p-4 flex justify-between items-center hover:bg-slate-50/80 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3 text-slate-500">
              <Tag size={17} strokeWidth={2} />
              <span className="text-[12px] font-bold text-slate-700">Categories</span>
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
            onClick={async (e) => { e.preventDefault(); await showAlert('Opening Help Center...'); }}
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
            onClick={async (e) => { e.preventDefault(); await showAlert('Opening Privacy Policy...'); }}
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
            onClick={async (e) => { e.preventDefault(); await showAlert('Opening Terms of Service...'); }}
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
