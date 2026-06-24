import React, { useState } from 'react';
import { 
  UserPlus, MoreVertical, Search, ArrowLeft
} from 'lucide-react';
import { InviteMember } from './InviteMember';

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

  // Stock members matching the mockup exactly
  const [members, setMembers] = useState<MemberItem[]>([
    {
      id: 'member-1',
      name: 'Johnathan Rivers',
      email: 'john.rivers@aquaflow.com',
      role: 'owner',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'member-2',
      name: 'Sarah Chen',
      email: 's.chen@aquaflow.com',
      role: 'editor',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'member-3',
      name: 'Marcus Bell',
      email: 'm.bell@aquaflow.com',
      role: 'viewer'
    },
    {
      id: 'member-4',
      name: 'Liam O\'Connor',
      email: 'liam.oc@aquaflow.com',
      role: 'editor',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  const handleAddInvite = (email: string, role: string) => {
    // Add new pending member to the local state list
    const newMember: MemberItem = {
      id: `member-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role as any,
      isPending: true
    };
    setMembers((prev) => [...prev, newMember]);
    setIsInviting(false);
    alert(`Invitation sent to ${email} as ${role}!`);
  };

  if (isInviting) {
    return (
      <InviteMember 
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
          <p className="text-[22px] font-extrabold text-[#0F766E] mt-1">{24 + members.filter(m => m.isPending).length}</p>
        </div>

        {/* Pending Invites */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
          <span className="text-[11px] font-bold text-slate-500">Pending Invites</span>
          <p className="text-[22px] font-extrabold text-[#0F766E] mt-1">{3 + members.filter(m => m.isPending).length}</p>
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

    </div>
  );
};
