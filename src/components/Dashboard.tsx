import { useState, useEffect } from 'react';
import { 
  FileText, Wallet, Tag, Calendar, 
  MoreVertical, Pill, ShieldAlert, FlaskConical, 
  ChevronRight
} from 'lucide-react';
import { ExpenseChart } from './ExpenseChart';
import { supabase } from '../lib/supabaseClient';

interface BillItem {
  id: string;
  medicine_name: string;
  date: string;
  dateObject: Date;
  final_price: number;
  discount: number;
  mrp: number;
}

interface DashboardProps {
  onEditBill?: (id: string) => void;
  onViewAllBills?: () => void;
  workspaceId?: string | null;
  canEdit?: boolean;
}

export const Dashboard = ({ onEditBill, onViewAllBills, workspaceId, canEdit = true }: DashboardProps) => {
  const [userName, setUserName] = useState('Farmer');
  const [bills, setBills] = useState<BillItem[]>([]);
  const [filterRange, setFilterRange] = useState<'week' | 'month' | '3months' | '6months' | 'year' | 'all'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || 'Farmer');
        
        try {
          let activeWorkspaceId = workspaceId;
          if (!activeWorkspaceId) {
            const { data: workspaces, error: wsError } = await supabase
              .from('workspaces')
              .select('id')
              .eq('owner_id', user.id);
              
            if (wsError) throw wsError;
            
            if (workspaces && workspaces.length > 0) {
              activeWorkspaceId = workspaces[0].id;
            }
          }
          
          if (activeWorkspaceId) {
            const { data: billsData, error: billsError } = await supabase
              .from('bills')
              .select('*')
              .eq('workspace_id', activeWorkspaceId)
              .order('date', { ascending: false });
              
            if (billsError) throw billsError;
            
            if (billsData) {
              setBills(billsData.map(b => ({
                id: b.id,
                medicine_name: b.medicine_name,
                date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                dateObject: new Date(b.date),
                final_price: Number(b.final_price),
                discount: Number(b.discount),
                mrp: Number(b.mrp)
              })));
            }
          }
        } catch (err) {
          console.error('Error fetching bills from Supabase:', err);
          setMockData();
        } finally {
          setIsLoading(false);
        }
      } else {
        setMockData();
        setIsLoading(false);
      }
    };

    const setMockData = () => {
      setBills([
        {
          id: '1',
          medicine_name: 'Amoxicillin Aqua',
          date: 'Oct 12, 2023',
          dateObject: new Date('2023-10-12'),
          final_price: 142.50,
          discount: 10,
          mrp: 158.33
        },
        {
          id: '2',
          medicine_name: 'Virkon-S Disinfectant',
          date: 'Oct 10, 2023',
          dateObject: new Date('2023-10-10'),
          final_price: 210.00,
          discount: 0,
          mrp: 210.00
        },
        {
          id: '3',
          medicine_name: 'PH Stabilizer Kit',
          date: 'Oct 08, 2023',
          dateObject: new Date('2023-10-08'),
          final_price: 85.00,
          discount: 5,
          mrp: 89.47
        }
      ]);
    };

    getUserData();
  }, [workspaceId]);

  const getFilteredBills = () => {
    const now = new Date();
    return bills.filter(bill => {
      const billDate = new Date(bill.dateObject || bill.date);
      switch (filterRange) {
        case 'week': {
          const currentDay = now.getDay();
          const distanceToMon = currentDay === 0 ? 6 : currentDay - 1;
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - distanceToMon);
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);
          
          return billDate >= startOfWeek && billDate < endOfWeek;
        }
        case 'month': {
          return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
        }
        case '3months': {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return billDate >= threeMonthsAgo;
        }
        case '6months': {
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return billDate >= sixMonthsAgo;
        }
        case 'year': {
          return billDate.getFullYear() === now.getFullYear();
        }
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredBills = getFilteredBills();

  // Compute dynamic stats
  const totalBillsCount = filteredBills.length;
  const totalExpenses = filteredBills.reduce((sum, b) => sum + b.final_price, 0);
  const totalDiscountSaved = filteredBills.reduce((sum, b) => sum + (b.mrp - b.final_price), 0);

  const now = new Date();
  const currentMonthBills = bills.filter(b => {
    return b.dateObject.getMonth() === now.getMonth() && b.dateObject.getFullYear() === now.getFullYear();
  });
  const monthlyExpense = currentMonthBills.reduce((sum, b) => sum + b.final_price, 0);

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value.toFixed(2)}`;
  };

  const statCards = [
    { label: 'Total Bills', value: String(totalBillsCount), icon: FileText, color: 'from-[#0F766E] to-[#14B8A6]', bgIcon: 'bg-[#F0FDFA]', textIcon: 'text-[#0F766E]' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: Wallet, color: 'from-[#7C3AED] to-[#A78BFA]', bgIcon: 'bg-[#F5F3FF]', textIcon: 'text-[#7C3AED]' },
    { label: 'Savings', value: formatCurrency(totalDiscountSaved), icon: Tag, color: 'from-[#059669] to-[#34D399]', bgIcon: 'bg-[#ECFDF5]', textIcon: 'text-[#059669]' },
    { label: 'This Month', value: formatCurrency(monthlyExpense), icon: Calendar, color: 'from-[#0284C7] to-[#38BDF8]', bgIcon: 'bg-[#F0F9FF]', textIcon: 'text-[#0284C7]' },
  ];

  const getBillIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('amoxicillin') || lowercase.includes('oxy') || lowercase.includes('antibiotic')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center flex-shrink-0">
          <Pill size={18} strokeWidth={2} />
        </div>
      );
    } else if (lowercase.includes('virkon') || lowercase.includes('disinfect')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#F43F5E] flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={18} strokeWidth={2} />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center flex-shrink-0">
          <FlaskConical size={18} strokeWidth={2} />
        </div>
      );
    }
  };

  return (
    <main className="flex-1 p-4 pb-24 space-y-5 overflow-y-auto select-none">
      
      {/* Welcome Header & Date Filter */}
      <div className="flex justify-between items-center text-left animate-fade-in relative z-30">
        <div>
          <p className="text-[11px] text-slate-400 font-semibold">Welcome back,</p>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">{userName} 👋</h1>
        </div>
        
        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] hover:border-slate-350 text-slate-700 font-bold text-[10px] px-3.5 py-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] cursor-pointer"
          >
            <span>
              {filterRange === 'week' && 'This Week'}
              {filterRange === 'month' && 'This Month'}
              {filterRange === '3months' && 'This 3 Months'}
              {filterRange === '6months' && 'This 6 Months'}
              {filterRange === 'year' && 'This Year'}
              {filterRange === 'all' && 'All'}
            </span>
            <svg 
              className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isFilterDropdownOpen && (
            <>
              {/* Backdrop overlay to close dropdown on click outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsFilterDropdownOpen(false)}
              />
              {/* Floating Menu */}
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1.5 z-50 text-[10px] font-bold text-slate-700 animate-fade-in text-left">
                {[
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: '3months', label: 'This 3 Months' },
                  { value: '6months', label: 'This 6 Months' },
                  { value: 'year', label: 'This Year' },
                  { value: 'all', label: 'All' },
                ].map((option) => {
                  const isSelected = filterRange === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterRange(option.value as any);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center border-none ${
                        isSelected ? 'text-[#0F766E] bg-teal-50/40' : 'text-slate-650'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards (Horizontal Scrollable) */}
      <div className="flex overflow-x-auto gap-3 pb-1 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`min-w-[155px] flex-1 bg-white border border-[#E2E8F0]/80 p-4 rounded-2xl shadow-sm text-left snap-start card-hover animate-card-enter`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-9 h-9 ${stat.bgIcon} ${stat.textIcon} rounded-xl flex items-center justify-center mb-2.5`}>
                <Icon size={17} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{stat.label}</span>
              <p className="text-[20px] font-extrabold text-slate-800 mt-0.5 tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Expense Trends Graph Section */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm p-4 text-left animate-card-enter animate-card-enter-1">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">Expense Trends</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {filterRange === 'week' && 'Weekly overview'}
              {filterRange === 'month' && 'Monthly overview'}
              {filterRange === '3months' && '3-Month overview'}
              {filterRange === '6months' && '6-Month overview'}
              {filterRange === 'year' && 'Yearly overview'}
              {filterRange === 'all' && 'All-time overview'}
            </p>
          </div>
          <button className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
            <MoreVertical size={16} />
          </button>
        </div>
        <div className="h-[210px] w-full">
          <ExpenseChart bills={bills} filterRange={filterRange} />
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="space-y-3 animate-card-enter animate-card-enter-2">
        <div className="flex justify-between items-center">
          <h3 className="text-[14px] font-bold text-slate-800">Recent Bills</h3>
          <button 
            onClick={onViewAllBills}
            className="text-[11px] font-bold text-[#0F766E] hover:text-[#14B8A6] flex items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Bills List */}
        <div className="space-y-2">
          {isLoading ? (
            // Skeleton loader
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-[#E2E8F0]/80 p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl animate-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded animate-shimmer" />
                    <div className="h-2 w-20 rounded animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 text-xs font-semibold">
              No bills found for the selected period.
            </div>
          ) : (
            filteredBills.slice(0, 5).map((bill) => (
              <div 
                key={bill.id} 
                onClick={() => canEdit && onEditBill?.(bill.id)}
                className={`flex justify-between items-center bg-white border border-[#E2E8F0]/80 p-3 rounded-2xl shadow-sm transition-all ${
                  canEdit 
                    ? 'hover:shadow-md cursor-pointer card-hover press-effect' 
                    : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getBillIcon(bill.medicine_name)}
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-slate-800 leading-snug">{bill.medicine_name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{bill.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-slate-800">₹{bill.final_price.toFixed(2)}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${bill.discount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {bill.discount > 0 ? `-${bill.discount}% Off` : `MRP ₹${bill.mrp.toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Advanced Analytics Promo Banner */}
      <div className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white p-5 rounded-2xl relative overflow-hidden text-left shadow-lg shadow-[#0F766E]/15 flex justify-between items-center animate-card-enter animate-card-enter-3">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -right-2 w-16 h-16 bg-white/5 rounded-full" />
        
        <div className="space-y-1.5 max-w-[65%] z-10">
          <h4 className="text-sm font-bold tracking-tight">Advanced Analytics</h4>
          <p className="text-[11px] text-teal-100/80 font-medium leading-relaxed">
            Unlock predictive yield insights for next season.
          </p>
        </div>
        
        {/* Mini chart on right */}
        <div className="flex items-end gap-[3px] h-10 z-10 opacity-60">
          <div className="w-2.5 bg-white/40 rounded-t-sm" style={{ height: '30%' }}></div>
          <div className="w-2.5 bg-white/40 rounded-t-sm" style={{ height: '55%' }}></div>
          <div className="w-2.5 bg-white/40 rounded-t-sm" style={{ height: '45%' }}></div>
          <div className="w-2.5 bg-white/60 rounded-t-sm" style={{ height: '75%' }}></div>
          <div className="w-2.5 bg-white/80 rounded-t-sm" style={{ height: '100%' }}></div>
        </div>
      </div>

    </main>
  );
};
