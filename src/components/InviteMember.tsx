import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Mail, Send, Star, Shield, 
  Pencil, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface InviteMemberProps {
  workspaceId: string;
  onBack: () => void;
  onInviteSent: (email: string, role: string) => void;
}

export const InviteMember: React.FC<InviteMemberProps> = ({ workspaceId, onBack, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'editor' | 'viewer'>('admin');
  const [userInitials, setUserInitials] = useState('JD');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || 'Sunil Varma';
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials);
        }
      } catch (err) {
        console.error('Error fetching user initials:', err);
      }
    };
    fetchUser();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter an email address.');
      return;
    }
    
    setIsSending(true);
    try {
      // 1. Check if user profile exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        alert(`User with email "${email}" is not registered in the system. They must sign up first.`);
        setIsSending(false);
        return;
      }

      // 2. Check if user is already a member of the workspace
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', profileData.id)
        .maybeSingle();

      if (memberCheckError) throw memberCheckError;

      if (existingMember) {
        alert(`User with email "${email}" is already a member of this workspace.`);
        setIsSending(false);
        return;
      }

      // 3. Insert user into workspace_members table
      const { error: insertError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: profileData.id,
          role: selectedRole
        });

      if (insertError) throw insertError;

      setIsSending(false);
      onInviteSent(email, selectedRole);
    } catch (err: any) {
      console.error('Error inviting member:', err);
      alert(`Failed to send invitation: ${err.message || 'Unknown error'}`);
      setIsSending(false);
    }
  };

  const roles = [
    {
      id: 'owner',
      title: 'Owner',
      description: 'Full system access, billing control, and member management.',
      icon: Star,
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Can manage all assets, members, and most workspace settings.',
      icon: Shield,
    },
    {
      id: 'editor',
      title: 'Editor',
      description: 'Can create and edit bills, manage inventory, and view reports.',
      icon: Pencil,
    },
    {
      id: 'viewer',
      title: 'Viewer',
      description: 'Read-only access to dashboards and financial statements.',
      icon: Eye,
    },
  ] as const;

  return (
    <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="text-left animate-fade-in flex justify-between items-center border-b border-[#F1F5F9] pb-3.5">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[17px] font-bold text-slate-850 tracking-tight">Invite Member</h1>
        </div>
        
        {/* User avatar on far right */}
        <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center select-none shadow-sm">
          {userInitials}
        </div>
      </div>

      {/* Top Banner Card */}
      <div className="bg-[#0b635c] text-white p-5 rounded-2xl relative overflow-hidden text-left shadow-md flex flex-col justify-center min-h-[120px] animate-card-enter">
        {/* Abstract Background Circle Graphic */}
        <div className="absolute right-[-15px] top-[-15px] w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute right-[15px] bottom-[-25px] w-24 h-24 rounded-full bg-white/5 pointer-events-none"></div>
        
        <h4 className="text-base font-bold tracking-tight">Expand your team</h4>
        <p className="text-[11px] text-teal-100/90 font-medium leading-relaxed mt-1 max-w-[85%]">
          Add new collaborators to your aquaculture management workspace to streamline billing and inventory tracking.
        </p>
      </div>

      {/* Form Details Card */}
      <form onSubmit={handleSend} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm text-left space-y-5 animate-card-enter animate-card-enter-1">
        <h3 className="text-sm font-bold text-slate-800 border-b border-[#F1F5F9] pb-2">Member Details</h3>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="block w-full h-11 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
            />
          </div>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">
            The invite link will be valid for 48 hours.
          </p>
        </div>

        {/* Assign Role Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 tracking-wide">
            Assign Role
          </label>
          
          <div className="space-y-2.5">
            {roles.map((role) => {
              const isSelected = selectedRole === role.id;
              const RoleIcon = role.icon;
              
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`border p-3.5 rounded-2xl text-left flex items-start justify-between cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-[#F0FDFD] border-[#0F766E] shadow-sm' 
                      : 'bg-white border-[#E2E8F0] hover:border-slate-350'
                  }`}
                >
                  <div className="flex gap-3 text-slate-750">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'text-[#0F766E]' : 'text-slate-400'
                    }`}>
                      <RoleIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{role.title}</h4>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-normal max-w-[90%]">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Custom Radio Button */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#0F766E] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#0F766E]"></div>
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Send Invitation Button */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none disabled:opacity-75"
        >
          <Send size={14} className="rotate-45 -mt-0.5" />
          {isSending ? 'Sending...' : 'Send Invitation'}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer pt-1"
        >
          Cancel
        </button>
      </form>

    </div>
  );
};
