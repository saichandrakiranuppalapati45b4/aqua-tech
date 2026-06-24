import React, { useState, useEffect } from 'react';
import {
  Search, ChevronDown, Plus, Pill, FlaskConical,
  ShieldAlert, ChevronLeft, ChevronRight, Package
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface RecordItem {
  id: string;
  medicine_name: string;
  category: string;
  mrp: number;
  discount: number;
  final_price: number;
  date: string;
}

interface BillingRecordsProps {
  onCreateClick?: () => void;
  onEditBill?: (id: string) => void;
}


export const BillingRecords: React.FC<BillingRecordsProps> = ({ onCreateClick, onEditBill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbBills, setDbBills] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBills = async () => {
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

            if (billsData && billsData.length > 0) {
              const mapped: RecordItem[] = billsData.map((b) => {
                // Determine category based on medicine name terms
                let category = 'Other';
                const name = b.medicine_name.toLowerCase();
                if (name.includes('aquapure') || name.includes('water')) {
                  category = 'Water Conditioner';
                } else if (name.includes('growth') || name.includes('supplement')) {
                  category = 'Nutritional Supplement';
                } else if (name.includes('proto') || name.includes('anti')) {
                  category = 'Antiparasitic';
                } else if (name.includes('oxy') || name.includes('otc') || name.includes('antibiotic')) {
                  category = 'Antibiotic';
                }

                return {
                  id: b.id,
                  medicine_name: b.medicine_name,
                  category,
                  mrp: Number(b.mrp),
                  discount: Number(b.discount),
                  final_price: Number(b.final_price),
                  date: b.date
                };
              });
              setDbBills(mapped);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Only display actual database records
  const allRecords = dbBills;

  // Client-side search filtering
  const filteredRecords = allRecords.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.medicine_name.toLowerCase().includes(term) ||
      rec.category.toLowerCase().includes(term)
    );
  });

  // Calculate summary metrics based on filtered records
  const totalCount = filteredRecords.length;
  const grossExpenditure = filteredRecords.reduce((acc, curr) => acc + curr.final_price, 0);
  const totalSavings = filteredRecords.reduce((acc, curr) => acc + (curr.mrp - curr.final_price), 0);

  const getRecordIcon = (category: string) => {
    const iconProps = { size: 18, strokeWidth: 2 };
    switch (category) {
      case 'Water Conditioner':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] text-[#FB7185] flex items-center justify-center flex-shrink-0">
            <Pill {...iconProps} />
          </div>
        );
      case 'Nutritional Supplement':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#2DD4BF] flex items-center justify-center flex-shrink-0">
            <Package {...iconProps} />
          </div>
        );
      case 'Antiparasitic':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#60A5FA] flex items-center justify-center flex-shrink-0">
            <FlaskConical {...iconProps} />
          </div>
        );
      case 'Antibiotic':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#F87171] flex items-center justify-center flex-shrink-0">
            <ShieldAlert {...iconProps} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] text-slate-400 flex items-center justify-center flex-shrink-0">
            <Pill {...iconProps} />
          </div>
        );
    }
  };

  const totalPages = Math.ceil(filteredRecords.length / 10);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const displayedRecords = filteredRecords.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
      {/* Title */}
      <div className="text-left animate-fade-in">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Billing Records</h1>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
          Manage and track pharmaceutical expenses.
        </p>
      </div>

      {/* Create New Bill Action */}
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer focus:outline-none"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create New Bill
        </button>
      )}

      {/* Search & Filter Panel Card */}
      <div className="bg-white border border-[#E2E8F0]/80 p-4 rounded-2xl shadow-sm text-left space-y-3 animate-card-enter">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search medicine..."
            className="block w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          {['Date Range', 'Category', 'Price'].map((filter) => (
            <button key={filter} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E2E8F0] text-slate-500 rounded-lg hover:border-slate-300 hover:text-slate-600 transition-all cursor-pointer focus:outline-none">
              {filter} <ChevronDown size={11} />
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-[#0F766E] hover:text-[#14B8A6] px-1.5 cursor-pointer transition-colors font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Records Card */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm overflow-hidden animate-card-enter animate-card-enter-1">
        {/* Scrollable Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Medicine</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">MRP</th>
                <th className="px-4 py-3 text-right">Disc.</th>
                <th className="px-4 py-3 text-right">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3.5">
                      <div className="h-3 rounded animate-shimmer" />
                    </td>
                  </tr>
                ))
              ) : displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    <div className="flex flex-col items-center gap-1">
                      <Package size={20} className="text-slate-300" />
                      <span>No matching records found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => onEditBill?.(rec.id)}
                    className="hover:bg-slate-50/60 transition-colors text-xs text-slate-800 cursor-pointer"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {getRecordIcon(rec.category)}
                        <span className="font-bold text-slate-800 text-[11px]">{rec.medicine_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{rec.category}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-500 text-[11px]">
                      {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-600 whitespace-nowrap text-[11px]">
                      ₹{rec.mrp.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={`text-[11px] font-bold ${rec.discount > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {rec.discount > 0 ? `${rec.discount}%` : '–'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#0F766E] whitespace-nowrap text-[11px]">
                      ₹{rec.final_price.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="bg-slate-50/50 p-3.5 border-t border-[#F1F5F9] space-y-2.5">
          <p className="text-[10px] font-bold text-slate-400 text-center">
            Showing <span className="text-slate-600">{totalCount > 0 ? startIndex + 1 : 0}–{Math.min(endIndex, totalCount)}</span> of <span className="text-slate-600">{totalCount}</span>
          </p>
          <div className="flex justify-center items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-lg border border-[#E2E8F0] hover:bg-white flex items-center justify-center text-slate-400 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>

            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`dots-${idx}`} className="text-slate-300 text-xs px-1">
                    ···
                  </span>
                );
              }
              const pageNum = Number(page);
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg border font-bold text-[10px] flex items-center justify-center focus:outline-none cursor-pointer transition-all ${isActive
                      ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                      : 'border-[#E2E8F0] hover:bg-white text-slate-500'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-7 h-7 rounded-lg border border-[#E2E8F0] hover:bg-white flex items-center justify-center text-slate-400 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 animate-card-enter animate-card-enter-2">
        <div className="bg-white border border-[#E2E8F0]/80 p-3.5 rounded-2xl shadow-sm text-left">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Bills</span>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{totalCount}</p>
          <p className="text-[8px] font-bold text-emerald-500 mt-0.5">Total count</p>
        </div>

        <div className="bg-white border border-[#E2E8F0]/80 p-3.5 rounded-2xl shadow-sm text-left">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Spent</span>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">₹{grossExpenditure >= 1000 ? `${(grossExpenditure/1000).toFixed(1)}k` : grossExpenditure.toFixed(0)}</p>
          <p className="text-[8px] font-semibold text-slate-400 mt-0.5">Year to date</p>
        </div>

        <div className="bg-white border border-[#E2E8F0]/80 p-3.5 rounded-2xl shadow-sm text-left">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">Saved</span>
          <p className="text-lg font-extrabold text-emerald-600 mt-0.5">₹{totalSavings >= 1000 ? `${(totalSavings/1000).toFixed(1)}k` : totalSavings.toFixed(0)}</p>
          <p className="text-[8px] font-bold text-emerald-500 mt-0.5">Via discounts</p>
        </div>
      </div>
    </div>
  );
};
