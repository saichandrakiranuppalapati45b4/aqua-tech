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
  final_price: number;
  discount: number;
  mrp: number;
}

interface DashboardProps {
  onEditBill?: (id: string) => void;
  onViewAllBills?: () => void;
}

export const Dashboard = ({ onEditBill, onViewAllBills }: DashboardProps) => {
  const [userName, setUserName] = useState('Farmer');
  const [bills, setBills] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || 'Farmer');
        
        try {
          const { data: workspaces, error: wsError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('owner_id', user.id);
            
          if (wsError) throw wsError;
          
          if (workspaces && workspaces.length > 0) {
            const workspaceId = workspaces[0].id;
            const { data: billsData, error: billsError } = await supabase
              .from('bills')
              .select('*')
              .eq('workspace_id', workspaceId)
              .order('date', { ascending: false });
              
            if (billsError) throw billsError;
            
            if (billsData) {
              setBills(billsData.map(b => ({
                id: b.id,
                medicine_name: b.medicine_name,
                date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
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
          final_price: 142.50,
          discount: 10,
          mrp: 158.33
        },
        {
          id: '2',
          medicine_name: 'Virkon-S Disinfectant',
          date: 'Oct 10, 2023',
          final_price: 210.00,
          discount: 0,
          mrp: 210.00
        },
        {
          id: '3',
          medicine_name: 'PH Stabilizer Kit',
          date: 'Oct 08, 2023',
          final_price: 85.00,
          discount: 5,
          mrp: 89.47
        }
      ]);
    };

    getUserData();
  }, []);

  const getBillIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('amoxicillin')) {
      return (
        <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0">
          <Pill size={20} />
        </div>
      );
    } else if (lowercase.includes('virkon')) {
      return (
        <div className="w-10 h-10 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={20} />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center flex-shrink-0">
          <FlaskConical size={20} />
        </div>
      );
    }
  };

  return (
    <main className="flex-1 p-4 pb-24 space-y-5 overflow-y-auto select-none">
      
      {/* Welcome Header */}
      <div className="text-left animate-fade-in">
        <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Farming Dashboard</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Operational summary for {userName}</p>
      </div>

      {/* Stats Cards (Horizontal Scrollable) */}
      <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
        
        {/* Stat Card 1: Total Bills */}
        <div className="min-w-[170px] flex-1 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left snap-start">
          <div className="w-8 h-8 bg-teal-50 text-[#0F766E] rounded-xl flex items-center justify-center mb-3">
            <FileText size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Bills</span>
          <p className="text-[22px] font-bold text-slate-800 mt-1">1,248</p>
        </div>

        {/* Stat Card 2: Total Expenses */}
        <div className="min-w-[170px] flex-1 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left snap-start">
          <div className="w-8 h-8 bg-teal-50 text-[#0F766E] rounded-xl flex items-center justify-center mb-3">
            <Wallet size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Expenses</span>
          <p className="text-[22px] font-bold text-slate-800 mt-1">₹42.5k</p>
        </div>

        {/* Stat Card 3: Discount Saved */}
        <div className="min-w-[170px] flex-1 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left snap-start">
          <div className="w-8 h-8 bg-teal-50 text-[#0F766E] rounded-xl flex items-center justify-center mb-3">
            <Tag size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Discount Saved</span>
          <p className="text-[22px] font-bold text-slate-800 mt-1">₹2.8k</p>
        </div>

        {/* Stat Card 4: Monthly Expense */}
        <div className="min-w-[170px] flex-1 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm text-left snap-start">
          <div className="w-8 h-8 bg-teal-50 text-[#0F766E] rounded-xl flex items-center justify-center mb-3">
            <Calendar size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Monthly Expense</span>
          <p className="text-[22px] font-bold text-slate-800 mt-1">₹8.3k</p>
        </div>
        
      </div>

      {/* Expense Trends Graph Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 text-left animate-card-enter">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">Expense Trends</h3>
          <button className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
            <MoreVertical size={18} />
          </button>
        </div>
        <div className="h-[210px] w-full">
          <ExpenseChart />
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="space-y-3 animate-card-enter animate-card-enter-1">
        <div className="flex justify-between items-center">
          <h3 className="text-[15px] font-bold text-slate-800">Recent Bills</h3>
          <button 
            onClick={onViewAllBills}
            className="text-xs font-bold text-[#0F766E] hover:text-[#14B8A6] flex items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Bills List */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="text-center py-4 text-slate-400 text-xs">Loading bills...</div>
          ) : (
            bills.map((bill) => (
              <div 
                key={bill.id} 
                onClick={() => onEditBill?.(bill.id)}
                className="flex justify-between items-center bg-white border border-[#E2E8F0] p-3 rounded-2xl shadow-sm transition-all hover:scale-[1.01] cursor-pointer hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  {getBillIcon(bill.medicine_name)}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">{bill.medicine_name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{bill.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">₹{bill.final_price.toFixed(2)}</p>
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
      <div className="bg-[#0F766E] text-white p-5 rounded-2xl relative overflow-hidden text-left shadow-md flex justify-between items-center animate-card-enter animate-card-enter-2">
        <div className="space-y-1.5 max-w-[70%] z-10">
          <h4 className="text-sm font-bold tracking-tight">Advanced Analytics</h4>
          <p className="text-[11px] text-teal-100 font-medium leading-relaxed">
            Unlock predictive yield insights for next season.
          </p>
        </div>
        
        {/* Graphic Mockup on Right */}
        <div className="flex items-end gap-1.5 h-12 w-20 opacity-20 overflow-hidden select-none">
          <div className="w-3.5 bg-white rounded-t-sm" style={{ height: '30%' }}></div>
          <div className="w-3.5 bg-white rounded-t-sm" style={{ height: '65%' }}></div>
          <div className="w-3.5 bg-white rounded-t-sm" style={{ height: '50%' }}></div>
          <div className="w-3.5 bg-white rounded-t-sm" style={{ height: '90%' }}></div>
        </div>
      </div>

    </main>
  );
};
