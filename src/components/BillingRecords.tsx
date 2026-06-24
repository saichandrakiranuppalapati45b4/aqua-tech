import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Plus, Pill, FlaskConical, 
  ShieldAlert, ChevronLeft, ChevronRight 
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
  isMock?: boolean;
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
  
  // Base sum from mockups + db sum
  const grossExpenditure = filteredRecords.reduce((acc, curr) => acc + curr.final_price, 0);
  const totalSavings = filteredRecords.reduce((acc, curr) => acc + (curr.mrp - curr.final_price), 0);

  const getRecordIcon = (category: string) => {
    switch (category) {
      case 'Water Conditioner':
        return (
          <div className="w-10 h-10 rounded-full bg-[#FFE4E6] text-[#FB7185] flex items-center justify-center flex-shrink-0">
            <Pill size={20} />
          </div>
        );
      case 'Nutritional Supplement':
        return (
          <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#2DD4BF] flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} />
          </div>
        );
      case 'Antiparasitic':
        return (
          <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#38BDF8] flex items-center justify-center flex-shrink-0">
            <FlaskConical size={20} />
          </div>
        );
      case 'Antibiotic':
        return (
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#F87171] flex items-center justify-center flex-shrink-0">
            <Pill size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-slate-400 flex items-center justify-center flex-shrink-0">
            <Pill size={20} />
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
        <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Billing Records</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Manage and track pharmaceutical expenses for aquaculture operations.
        </p>
      </div>

      {/* Create New Bill Action */}
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="w-full h-11 bg-[#0F766E] hover:bg-[#0D645D] active:scale-[0.98] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create New Bill
        </button>
      )}

      {/* Search & Filter Panel Card */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left space-y-3 animate-card-enter">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
            className="block w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <button className="flex items-center gap-1 px-3 py-2 bg-white border border-[#E2E8F0] text-slate-500 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
            Date Range <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-white border border-[#E2E8F0] text-slate-500 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
            Category <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-white border border-[#E2E8F0] text-slate-500 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
            Price <ChevronDown size={12} />
          </button>
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-[#0F766E] hover:text-[#14B8A6] px-1 cursor-pointer transition-colors ml-1"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Table Records Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden animate-card-enter animate-card-enter-1">
        {/* Horizontal Swipe Tip */}
        <div className="bg-slate-50 px-4 py-2 border-b border-[#E2E8F0] flex justify-between items-center text-[9px] font-bold text-slate-400">
          <span>Swipe left/right to view all columns ↔</span>
        </div>
        
        {/* Scrollable Table Container */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#E2E8F0] text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Medicine Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">MRP</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Final Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">Loading records...</td>
                </tr>
              ) : displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">No matching records found.</td>
                </tr>
              ) : (
                displayedRecords.map((rec) => (
                  <tr 
                    key={rec.id} 
                    onClick={() => onEditBill?.(rec.id)}
                    className="hover:bg-slate-50/50 transition-colors text-xs text-slate-800 cursor-pointer"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getRecordIcon(rec.category)}
                        <span className="font-bold text-slate-800">{rec.medicine_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-500">
                      {rec.category}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-500">
                      {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700 whitespace-nowrap">
                      ₹{rec.mrp.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-500 whitespace-nowrap">
                      {rec.discount > 0 ? `${rec.discount}%` : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-[#0F766E] whitespace-nowrap">
                      ₹{rec.final_price.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="bg-white p-4 border-t border-[#F1F5F9] space-y-3">
          <p className="text-[10px] font-bold text-slate-400 text-center">
            Showing <span className="text-slate-600">{totalCount > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalCount)}</span> of <span className="text-slate-600">{totalCount}</span> records
          </p>
          <div className="flex justify-center items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`dots-${idx}`} className="text-slate-400 text-xs px-1">
                    ...
                  </span>
                );
              }
              const pageNum = Number(page);
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg border font-bold text-xs flex items-center justify-center focus:outline-none cursor-pointer ${
                    isActive
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'border-[#E2E8F0] hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards List */}
      <div className="space-y-3.5 pt-1 pb-4 animate-card-enter animate-card-enter-2">
        {/* Card 1: Total Bill Count */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Bill Count</span>
          <p className="text-[22px] font-extrabold text-slate-800 mt-1">{totalCount}</p>
          <p className="text-[9px] font-bold text-emerald-500 mt-1 flex items-center gap-0.5">
            <span>+12% from last month</span>
          </p>
        </div>

        {/* Card 2: Gross Expenditure */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Gross Expenditure</span>
          <p className="text-[22px] font-extrabold text-slate-800 mt-1">₹{grossExpenditure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[9px] font-semibold text-slate-400 mt-1">Year to date</p>
        </div>

        {/* Card 3: Total Savings */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Savings</span>
          <p className="text-[22px] font-extrabold text-slate-800 mt-1">₹{totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[9px] font-bold text-emerald-500 mt-1">Through discounts</p>
        </div>

        {/* Card 4: Pending Clearances */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Pending Clearances</span>
          <p className="text-[22px] font-extrabold text-red-500 mt-1">3</p>
          <p className="text-[9px] font-bold text-red-400 mt-1">Action required</p>
        </div>
      </div>
    </div>
  );
};
