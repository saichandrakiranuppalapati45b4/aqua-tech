import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, UserPlus, MoreVertical
} from 'lucide-react';
import { InviteMember } from './InviteMember';
import { supabase } from '../lib/supabaseClient';
import { showAlert, showConfirm } from '../lib/modal';

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
  canEdit?: boolean;
  workspaceId?: string | null;
}

export const Members: React.FC<MembersProps> = ({ onBack, canEdit = true, workspaceId: propWorkspaceId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Real members from DB
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let activeWsId = propWorkspaceId || workspaceId;
      let ownerId = '';

      if (!activeWsId) {
        // 1. Query workspaces owned by this user
        const { data: workspaces, error: wsError } = await supabase
          .from('workspaces')
          .select('id, owner_id')
          .eq('owner_id', user.id);

        if (wsError) throw wsError;

        if (workspaces && workspaces.length > 0) {
          activeWsId = workspaces[0].id;
          ownerId = workspaces[0].owner_id;
        } else {
          // 2. Check workspace_members
          const { data: memberRecords, error: memberError } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id);

          if (memberError) throw memberError;

          if (memberRecords && memberRecords.length > 0) {
            activeWsId = memberRecords[0].workspace_id;
          }
        }
      }

      if (activeWsId) {
        setWorkspaceId(activeWsId);

        // Fetch workspace owner_id if we don't have it yet
        if (!ownerId) {
          const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('owner_id')
            .eq('id', activeWsId)
            .single();

          if (wsError) throw wsError;
          ownerId = wsData.owner_id;
        }

        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', activeWsId);

        if (membersError) throw membersError;

        let mappedMembers: MemberItem[] = [];

        if (membersData && membersData.length > 0) {
          const userIds = membersData.map(m => m.user_id).filter(Boolean);
          
          if (!userIds.includes(ownerId)) {
            userIds.push(ownerId);
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
          const ownerProfile = profilesData?.find(p => p.id === ownerId);
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
            .eq('id', ownerId)
            .single();

          mappedMembers = [{
            id: `owner-${ownerId}`,
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

  const handleAddUserSuccess = async (email: string, role: string) => {
    setIsInviting(false);
    fetchMembers();
    await showAlert(`User ${email} has been added successfully as ${role === 'editor' ? 'Can Edit' : 'Can Not Edit'}!`);
  };

  const handleUpdateAccess = async (memberId: string, newRole: 'editor' | 'viewer') => {
    setActiveMenuMemberId(null);
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (updateError) throw updateError;
      
      await showAlert('Access updated successfully!');
      fetchMembers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      await showAlert(`Failed to update access: ${err.message}`);
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    setActiveMenuMemberId(null);
    const confirmRemove = await showConfirm(`Are you sure you want to remove ${memberName} from this workspace?`);
    if (!confirmRemove) return;

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .rpc('delete_user_completely', { member_row_id: memberId });

      if (deleteError) throw deleteError;

      await showAlert('Member removed successfully.');
      fetchMembers();
    } catch (err: any) {
      console.error('Error removing member:', err);
      await showAlert(`Failed to remove member: ${err.message}`);
      setLoading(false);
    }
  };

  if (isInviting) {
    return (
      <InviteMember 
        workspaceId={workspaceId || ''}
        onBack={() => setIsInviting(false)}
        onInviteSent={handleAddUserSuccess}
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
            Admin
          </span>
        );
      case 'admin':
      case 'editor':
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#ECFDF5] text-[#059669] rounded-md uppercase tracking-wider">
            Can Edit
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#F1F5F9] text-[#475569] rounded-md uppercase tracking-wider">
            Can Not Edit
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
    <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC] relative">
      {/* Member Management Popup Modal */}
      {activeMenuMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay (semi-transparent glass backdrop) */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveMenuMemberId(null)}
          />
          
          {/* Modal content card */}
          {(() => {
            const member = members.find(m => m.id === activeMenuMemberId);
            if (!member) return null;
            return (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-[340px] p-5 text-left relative z-10 animate-card-enter space-y-4">
                {/* Header with name and avatar */}
                <div className="flex items-center gap-3.5 pb-3 border-b border-[#F1F5F9]">
                  <div className="w-10 h-10 rounded-full bg-[#FFE4E6] text-[#E11D48] font-bold text-xs flex items-center justify-center shadow-sm select-none">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{member.name}</h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{member.email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 mb-1">
                    Manage Access
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleUpdateAccess(member.id, member.role === 'viewer' ? 'editor' : 'viewer')}
                    className="w-full h-11 px-4 bg-slate-50 hover:bg-slate-100/80 active:scale-[0.99] text-slate-700 font-bold text-xs rounded-xl flex items-center justify-between border border-[#E2E8F0]/65 transition-all"
                  >
                    <span>Change Permission</span>
                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#ECFDF5] text-[#059669] rounded-md uppercase tracking-wider">
                      {member.role === 'viewer' ? 'Set: Can Edit' : 'Set: Can Not Edit'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="w-full h-11 px-4 bg-red-50 hover:bg-red-100 active:scale-[0.99] text-red-650 font-bold text-xs rounded-xl flex items-center justify-between border border-red-100 transition-all"
                  >
                    <span>Remove Member</span>
                    <span className="text-[10px]">⚠️</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveMenuMemberId(null)}
                  className="w-full h-10 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
                >
                  Cancel
                </button>
              </div>
            );
          })()}
        </div>
      )}
      
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

          {/* Add User Action */}
          <button
            onClick={() => {
              if (canEdit) {
                setIsInviting(true);
              } else {
                showAlert("You do not have access to add the user.");
              }
            }}
            className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none animate-card-enter"
          >
            <UserPlus size={16} />
            Add User
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
                      className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors relative"
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

                      {member.role !== 'owner' && canEdit && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMemberId(member.id);
                          }}
                          className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-colors cursor-pointer focus:outline-none"
                        >
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
              onClick={async () => { await showAlert('Upgrade billing flow triggered.'); }}
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
