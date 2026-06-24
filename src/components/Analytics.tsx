import React, { useState, useEffect } from 'react';
import { MoreVertical, AlertTriangle, TrendingUp } from 'lucide-react';
import { DailyExpenseChart } from './DailyExpenseChart';
import { WeeklyOverviewChart } from './WeeklyOverviewChart';
import { MedicineDistributionChart } from './MedicineDistributionChart';
import { YearlyProjectionChart } from './YearlyProjectionChart';
import { BillingRecords } from './BillingRecords';
import { supabase } from '../lib/supabaseClient';

interface AnalyticsProps {
  onCreateClick?: () => void;
  onEditBill?: (id: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onCreateClick, onEditBill }) => {
  const [activeCategory, setActiveCategory] = useState<'overview' | 'sheets'>('overview');
  const [bills, setBills] = useState<any[]>([]);

  useEffect(() => {
    const fetchBillsData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('owner_id', user.id);

          if (workspaces && workspaces.length > 0) {
            const workspaceId = workspaces[0].id;
            const { data: billsData } = await supabase
              .from('bills')
              .select('*')
              .eq('workspace_id', workspaceId)
              .order('date', { ascending: false });

            if (billsData) {
              setBills(billsData);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching bills in Analytics:', err);
      }
    };
    fetchBillsData();
  }, []);

  const categories = [
    { id: 'overview', label: 'Overview' },
    { id: 'sheets', label: 'Sheets' },
  ] as const;

  const last7DaysTotal = bills.reduce((sum, b) => {
    const billDate = new Date(b.date);
    const diffTime = new Date().getTime() - billDate.getTime();
    if (diffTime >= 0 && diffTime <= 7 * 24 * 60 * 60 * 1000) {
      return sum + Number(b.final_price);
    }
    return sum;
  }, 0);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const TabBar = () => (
    <div className="flex gap-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap focus:outline-none ${
              isActive 
                ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-sm shadow-[#0F766E]/15' 
                : 'bg-white border-[#E2E8F0] text-slate-400 hover:border-[#CBD5E1] hover:text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );

  if (activeCategory === 'sheets') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]/60">
          <TabBar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <BillingRecords onCreateClick={onCreateClick} onEditBill={onEditBill} />
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC] select-none text-left">
      {/* Title */}
      <div className="animate-fade-in">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Financial Insights</h1>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Overview of aqua-farm expenditures and medical supplies.</p>
      </div>

      {/* Category Tabs */}
      <div className="pb-1">
        <TabBar />
      </div>

      {/* Card 1: Daily Expense */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm p-4 space-y-4 animate-card-enter">
        <div className="flex justify-between items-start">
          <div className="text-left">
            <h3 className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">Daily Expense</h3>
            <span className="text-[10px] font-semibold text-slate-400">Last 7 days trend</span>
          </div>
          <div className="text-right">
            <span className="text-[15px] font-extrabold text-[#0F766E]">{formatCurrency(last7DaysTotal)}</span>
            <div className="flex items-center justify-end gap-0.5 text-[9px] font-bold text-emerald-500 mt-0.5">
              <TrendingUp size={10} />
              <span>12%</span>
            </div>
          </div>
        </div>
        <div className="h-[140px] w-full">
          <DailyExpenseChart bills={bills} />
        </div>
      </div>

      {/* Card 2: Weekly Overview */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm p-4 space-y-4 animate-card-enter animate-card-enter-1">
        <div className="flex justify-between items-center">
          <h3 className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">Weekly Overview</h3>
          <button className="w-7 h-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
            <MoreVertical size={14} />
          </button>
        </div>
        <div className="h-[190px] w-full">
          <WeeklyOverviewChart bills={bills} />
        </div>
      </div>

      {/* Card 3: Medicine Distribution */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm p-4 space-y-3 animate-card-enter animate-card-enter-2">
        <h3 className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">Medicine Distribution</h3>
        <div className="py-2">
          <MedicineDistributionChart bills={bills} />
        </div>
      </div>

      {/* Card 4: Yearly Projection */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm p-4 space-y-4 animate-card-enter animate-card-enter-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[12px] font-bold text-slate-700 tracking-wide uppercase">Yearly Projection</h3>
          <button className="px-2.5 py-1 text-[9px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer focus:outline-none border border-[#E2E8F0]">
            Monthly
          </button>
        </div>
        <div className="h-[140px] w-full">
          <YearlyProjectionChart bills={bills} />
        </div>
      </div>

      {/* Critical Alerts Section */}
      <div className="space-y-2.5 pt-1 pb-4">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Critical Alerts</span>
        
        {/* Warning Alert Card */}
        <div className="flex items-center justify-between bg-[#FFF7ED] border border-[#FFEDD5] p-4 rounded-2xl animate-card-enter animate-card-enter-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FED7AA]/50 text-[#F97316] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} strokeWidth={2} />
            </div>
            <div className="text-left">
              <h4 className="text-[12px] font-bold text-slate-800">Feed Stock Low</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                Projected to run out in 3 days.
              </p>
            </div>
          </div>
          <button 
            onClick={() => alert('Feed Stock reorder triggered.')}
            className="text-[10px] font-bold text-[#F97316] hover:text-[#EA580C] bg-[#FFF7ED] border border-[#FDBA74] px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none"
          >
            Reorder
          </button>
        </div>
      </div>
    </main>
  );
};
