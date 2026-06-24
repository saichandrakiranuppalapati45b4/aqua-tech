import React, { useState } from 'react';
import { MoreVertical, AlertTriangle, TrendingUp } from 'lucide-react';
import { DailyExpenseChart } from './DailyExpenseChart';
import { WeeklyOverviewChart } from './WeeklyOverviewChart';
import { MedicineDistributionChart } from './MedicineDistributionChart';
import { YearlyProjectionChart } from './YearlyProjectionChart';
import { BillingRecords } from './BillingRecords';

interface AnalyticsProps {
  onCreateClick?: () => void;
  onEditBill?: (id: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onCreateClick, onEditBill }) => {
  const [activeCategory, setActiveCategory] = useState<'overview' | 'sheets'>('overview');

  const categories = [
    { id: 'overview', label: 'Overview' },
    { id: 'sheets', label: 'Sheets' },
  ] as const;

  if (activeCategory === 'sheets') {
    // If Sheets active, swap view content to BillingRecords component
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Render a category tabs header on top of sheets for seamless category switching */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="flex gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-sm' 
                      : 'bg-white border-[#E2E8F0] text-slate-500 hover:border-[#CBD5E1] hover:text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
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
        <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Financial Insights</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Overview of aqua-farm expenditures and medical supplies.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none -mx-4 px-4">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-sm' 
                  : 'bg-white border-[#E2E8F0] text-slate-500 hover:border-[#CBD5E1] hover:text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Card 1: Daily Expense */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 space-y-4 animate-card-enter">
        <div className="flex justify-between items-start">
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Daily Expense</h3>
            <span className="text-[10px] font-bold text-slate-400">Last 7 days trend</span>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#0F766E]">₹4,280</span>
            <div className="flex items-center justify-end gap-0.5 text-[9px] font-bold text-emerald-500 mt-0.5">
              <TrendingUp size={10} />
              <span>12%</span>
            </div>
          </div>
        </div>
        <div className="h-[140px] w-full">
          <DailyExpenseChart />
        </div>
      </div>

      {/* Card 2: Weekly Overview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 space-y-4 animate-card-enter animate-card-enter-1">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Weekly Overview</h3>
          <button className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
            <MoreVertical size={16} />
          </button>
        </div>
        <div className="h-[190px] w-full">
          <WeeklyOverviewChart />
        </div>
      </div>

      {/* Card 3: Medicine Distribution */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 space-y-3 animate-card-enter animate-card-enter-2">
        <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Medicine Distribution</h3>
        <div className="py-2">
          <MedicineDistributionChart />
        </div>
      </div>

      {/* Card 4: Yearly Projection */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 space-y-4 animate-card-enter animate-card-enter-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Yearly Projection</h3>
          <button className="px-2.5 py-1 text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer">
            Monthly
          </button>
        </div>
        <div className="h-[140px] w-full">
          <YearlyProjectionChart />
        </div>
      </div>

      {/* Critical Alerts Section */}
      <div className="space-y-2.5 pt-2 pb-4">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Critical Alerts</span>
        
        {/* Warning Alert Card */}
        <div className="flex items-center justify-between bg-red-50/50 border border-red-100 p-4 rounded-2xl animate-card-enter">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-800">Feed Stock Low</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                Projected to run out in 3 days based on current usage.
              </p>
            </div>
          </div>
          <button 
            onClick={() => alert('Feed Stock reorder triggered.')}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer focus:outline-none"
          >
            Reorder
          </button>
        </div>
      </div>
    </main>
  );
};
