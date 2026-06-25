import React, { useState, useEffect } from 'react';
import { 
  UserPlus, MoreVertical, Search, ArrowLeft
} from 'lucide-react';
import { InviteMember } from './InviteMember';
import { supabase } from '../lib/supabaseClient';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer' | 'admin';
  avatarUrl?: string;
  isPending?: boolean;
}

interface MembersProps {
  onBack?: () => void;
}

export const Members: React.FC<MembersProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Real members from DB
  const [members, setMembers] = useState<MemberItem[]>([]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: workspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('id, name, owner_id')
        .eq('owner_id', user.id);

      if (wsError) throw wsError;

      if (workspaces && workspaces.length > 0) {
        const activeWs = workspaces[0];
        setWorkspaceId(activeWs.id);

        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', activeWs.id);

        if (membersError) throw membersError;

        let mappedMembers: MemberItem[] = [];

        if (membersData && membersData.length > 0) {
          const userIds = membersData.map(m => m.user_id).filter(Boolean);
          
          if (!userIds.includes(activeWs.owner_id)) {
            userIds.push(activeWs.owner_id);
          }

          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

          if (profilesError) throw profilesError;

          membersData.forEach(m => {
            const profile = profilesData?.find(p => p.id === m.user_id);
            mappedMembers.push({
              id: m.id,
              name: profile?.full_name || 'Collaborator',
              email: profile?.email || 'unknown@company.com',
              role: m.role as any,
            });
          });

          // Add Owner profile if not already mapped from workspace_members
          const ownerProfile = profilesData?.find(p => p.id === activeWs.owner_id);
          if (ownerProfile && !mappedMembers.some(m => m.email === ownerProfile.email)) {
            mappedMembers.unshift({
              id: `owner-${ownerProfile.id}`,
              name: ownerProfile.full_name || 'Sunil Varma',
              email: ownerProfile.email || 'sunilvarma9993@gmail.com',
              role: 'owner',
            });
          }
        } else {
          // If no workspace_members, show the owner profile as fallback
          const { data: ownerProfileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', activeWs.owner_id)
            .single();

          mappedMembers = [{
            id: `owner-${activeWs.owner_id}`,
            name: ownerProfileData?.full_name || 'Sunil Varma',
            email: ownerProfileData?.email || 'sunilvarma9993@gmail.com',
            role: 'owner',
          }];
        }

        setMembers(mappedMembers);
      }
    } catch (err: any) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to fetch members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddInvite = (email: string, role: string) => {
    setIsInviting(false);
    fetchMembers();
    alert(`Invitation sent to ${email} as ${role}!`);
  };

  if (isInviting) {
    return (
      <InviteMember 
        workspaceId={workspaceId || ''}
        onBack={() => setIsInviting(false)}
        onInviteSent={handleAddInvite}
      />
    );
  }

  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.role.toLowerCase().includes(term)
    );
  });

  const getRoleBadge = (role: MemberItem['role']) => {
    switch (role) {
      case 'owner':
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#0F766E] text-white rounded-md uppercase tracking-wider">
            Owner
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#CCFBF1] text-[#0D9488] rounded-md uppercase tracking-wider">
            Admin
          </span>
        );
      case 'editor':
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#CCFBF1] text-[#0D9488] rounded-md uppercase tracking-wider">
            Editor
          </span>
        );
      case 'viewer':
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#E2E8F0] text-slate-600 rounded-md uppercase tracking-wider">
            Viewer
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#E2E8F0] text-slate-600 rounded-md uppercase tracking-wider">
            Viewer
          </span>
        );
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

  return (
    <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="text-left animate-fade-in flex items-center gap-3.5 border-b border-[#F1F5F9] pb-3.5">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-[17px] font-bold text-slate-850 tracking-tight">Workspace Members</h1>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse-soft">
          <div className="h-11 bg-slate-200 rounded-xl w-full" />
          <div className="h-11 bg-slate-200 rounded-xl w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-200 rounded-2xl" />
            <div className="h-20 bg-slate-200 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-44 bg-slate-200 rounded-2xl w-full" />
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-2xl text-left">
          ⚠️ Error loading workspace members: {error}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative animate-card-enter">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members by name or email"
              className="block w-full h-11 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
            />
          </div>

          {/* Invite Member Action */}
          <button
            onClick={() => setIsInviting(true)}
            className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none animate-card-enter"
          >
            <UserPlus size={16} />
            Invite Member
          </button>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-4 animate-card-enter animate-card-enter-1">
            {/* Total Members */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
              <span className="text-[11px] font-bold text-slate-500">Total Members</span>
              <p className="text-[22px] font-extrabold text-[#0F766E] mt-1">{members.length}</p>
            </div>

            {/* Pending Invites */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
              <span className="text-[11px] font-bold text-slate-500">Pending Invites</span>
              <p className="text-[22px] font-extrabold text-[#0F766E] mt-1">{members.filter(m => m.isPending).length}</p>
            </div>
          </div>

          {/* Workspace Directory Section */}
          <div className="space-y-3 text-left animate-card-enter animate-card-enter-2">
            <h3 className="text-sm font-bold text-slate-800 pl-1">Workspace Directory</h3>
            
            {/* Members List Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-[#F1F5F9]">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No matching members found.</div>
                ) : (
                  filteredMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Avatar circle */}
                        {member.avatarUrl ? (
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100 select-none"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#FFE4E6] text-[#E11D48] font-bold text-xs flex items-center justify-center select-none shadow-sm">
                            {getInitials(member.name)}
                          </div>
                        )}
                        
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-800">{member.name}</h4>
                            {getRoleBadge(member.role)}
                          </div>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {member.role !== 'owner' && (
                        <button className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Need to Scale Promo Card */}
          <div className="bg-[#E6F4F1] p-5 rounded-2xl text-left space-y-4 animate-card-enter animate-card-enter-3">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[#0F766E]">Need to scale?</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Your current plan allows for up to 50 workspace members. Upgrade to Enterprise for unlimited seats and advanced SSO integrations.
              </p>
            </div>
            <button 
              onClick={() => alert('Upgrade billing flow triggered.')}
              className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F766E] font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer focus:outline-none"
            >
              View Billing Plans
            </button>
          </div>
        </>
      )}
    </div>
  );
};
