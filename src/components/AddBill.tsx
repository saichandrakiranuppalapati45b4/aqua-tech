import { useState, useEffect, type FormEvent } from 'react';
import { Save, Lock, ClipboardList, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AddBillProps {
  editBillId?: string | null;
  onSave: () => void;
  onViewRecords?: () => void;
}

interface Pond {
  id: string;
  name: string;
  species: string;
  capacity: number;
}

interface ParsedRemarks {
  pond: string;
  category: string;
  remarks: string;
}

const parseRemarks = (rawRemarks: string | null | undefined): ParsedRemarks => {
  let pond = '';
  let category = '';
  let remarks = rawRemarks || '';

  while (true) {
    remarks = remarks.trim();
    if (remarks.startsWith('[Pond: ')) {
      const closeIdx = remarks.indexOf(']');
      if (closeIdx !== -1) {
        pond = remarks.substring(7, closeIdx);
        remarks = remarks.substring(closeIdx + 1);
        continue;
      }
    }
    if (remarks.startsWith('[Category: ')) {
      const closeIdx = remarks.indexOf(']');
      if (closeIdx !== -1) {
        category = remarks.substring(11, closeIdx);
        remarks = remarks.substring(closeIdx + 1);
        continue;
      }
    }
    break;
  }

  return { pond, category, remarks: remarks.trim() };
};

const formatRemarks = (pondName: string, categoryName: string, remarks: string): string => {
  let result = '';
  if (pondName) {
    result += `[Pond: ${pondName}]`;
  }
  if (categoryName) {
    result += `[Category: ${categoryName}]`;
  }
  if (remarks) {
    result += (result ? ' ' : '') + remarks.trim();
  }
  return result;
};

export const AddBill = ({ editBillId = null, onSave, onViewRecords }: AddBillProps) => {
  const [medicineName, setMedicineName] = useState('');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState('0');
  const [finalPrice, setFinalPrice] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('');
  const [tempPondName, setTempPondName] = useState('');

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('abms_categories_data');
    const defaultCategories = ['Water Conditioner', 'Nutritional Supplement', 'Antiparasitic', 'Antibiotic', 'Other'];
    setCategories(saved ? JSON.parse(saved) : defaultCategories);
  }, []);

  // Set default billing date to today (YYYY-MM-DD for HTML input)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setBillingDate(today);
  }, []);

  // Fetch ponds
  useEffect(() => {
    const loadPonds = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          const saved = localStorage.getItem('abms_ponds_data');
          setPonds(saved ? JSON.parse(saved) : []);
          return;
        }

        const { data: workspaces } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id);

        if (workspaces && workspaces.length > 0) {
          const { data, error } = await supabase
            .from('ponds')
            .select('*')
            .eq('workspace_id', workspaces[0].id)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching ponds, loading local storage:', error);
            const saved = localStorage.getItem('abms_ponds_data');
            setPonds(saved ? JSON.parse(saved) : []);
          } else {
            setPonds(data || []);
          }
        } else {
          const saved = localStorage.getItem('abms_ponds_data');
          setPonds(saved ? JSON.parse(saved) : []);
        }
      } catch (err) {
        console.error('Error loading ponds, loading local storage:', err);
        const saved = localStorage.getItem('abms_ponds_data');
        setPonds(saved ? JSON.parse(saved) : []);
      }
    };
    loadPonds();
  }, []);

  // Resolve tempPondName once ponds are loaded
  useEffect(() => {
    if (tempPondName && ponds.length > 0) {
      const matchedPond = ponds.find(p => p.name.toLowerCase() === tempPondName.toLowerCase());
      if (matchedPond) {
        setSelectedPondId(matchedPond.id);
      }
    }
  }, [tempPondName, ponds]);

  // Fetch bill details if editBillId is provided
  useEffect(() => {
    if (editBillId) {
      const fetchBill = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
          const { data: bill, error } = await supabase
            .from('bills')
            .select('*')
            .eq('id', editBillId)
            .single();

          if (error) throw error;
          if (bill) {
            setMedicineName(bill.medicine_name || '');
            setMrp(bill.mrp ? String(bill.mrp) : '');
            setDiscount(bill.discount !== undefined ? String(bill.discount) : '0');
            setFinalPrice(bill.final_price ? String(bill.final_price) : '');
            setBillingDate(bill.date || '');
            
            const parsed = parseRemarks(bill.remarks);
            setRemarks(parsed.remarks);
            setTempPondName(parsed.pond);
            
            let parsedCategory = parsed.category;
            if (!parsedCategory && bill.medicine_name) {
              const name = bill.medicine_name.toLowerCase();
              if (name.includes('aquapure') || name.includes('water')) {
                parsedCategory = 'Water Conditioner';
              } else if (name.includes('growth') || name.includes('supplement')) {
                parsedCategory = 'Nutritional Supplement';
              } else if (name.includes('proto') || name.includes('anti')) {
                parsedCategory = 'Antiparasitic';
              } else if (name.includes('oxy') || name.includes('otc') || name.includes('antibiotic')) {
                parsedCategory = 'Antibiotic';
              } else {
                parsedCategory = 'Other';
              }
            }
            setSelectedCategory(parsedCategory || 'Other');
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Error fetching bill details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchBill();
    } else {
      setMedicineName('');
      setMrp('');
      setDiscount('0');
      setFinalPrice('');
      const today = new Date().toISOString().split('T')[0];
      setBillingDate(today);
      setRemarks('');
      setErrorMsg(null);
      setSelectedPondId('');
      setTempPondName('');
      setSelectedCategory('');
    }
  }, [editBillId]);

  // Recalculate when MRP changes
  const handleMrpChange = (val: string) => {
    setMrp(val);
    const numericMrp = parseFloat(val) || 0;
    const numericDiscount = parseFloat(discount) || 0;
    
    if (numericMrp > 0) {
      const calculated = numericMrp - (numericMrp * numericDiscount) / 100;
      setFinalPrice(calculated.toFixed(2));
    } else {
      setFinalPrice('');
    }
  };

  // Recalculate when Discount changes
  const handleDiscountChange = (val: string) => {
    setDiscount(val);
    const numericMrp = parseFloat(mrp) || 0;
    const numericDiscount = parseFloat(val) || 0;
    
    if (numericMrp > 0) {
      const calculated = numericMrp - (numericMrp * numericDiscount) / 100;
      setFinalPrice(calculated.toFixed(2));
    } else {
      setFinalPrice('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const numericMrp = parseFloat(mrp);
    const numericDiscount = parseFloat(discount);
    const numericFinalPrice = parseFloat(finalPrice);

    if (!medicineName) {
      setErrorMsg('Medicine Name is required.');
      setIsLoading(false);
      return;
    }
    if (isNaN(numericMrp) || numericMrp <= 0) {
      setErrorMsg('MRP must be a number greater than 0.');
      setIsLoading(false);
      return;
    }
    if (isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
      setErrorMsg('Discount must be between 0% and 100%.');
      setIsLoading(false);
      return;
    }
    if (isNaN(numericFinalPrice) || numericFinalPrice < 0) {
      setErrorMsg('Final Price must be a valid positive number.');
      setIsLoading(false);
      return;
    }
    if (!billingDate) {
      setErrorMsg('Billing Date is required.');
      setIsLoading(false);
      return;
    }

    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User session not found. Please log in again.');

      const selectedPond = ponds.find(p => p.id === selectedPondId);
      const formattedRemarks = formatRemarks(
        selectedPond ? selectedPond.name : '',
        selectedCategory,
        remarks
      );

      if (editBillId) {
        // Update bill record
        const { error: updateError } = await supabase
          .from('bills')
          .update({
            medicine_name: medicineName,
            mrp: numericMrp,
            discount: numericDiscount,
            final_price: parseFloat(numericFinalPrice.toFixed(2)),
            date: billingDate,
            remarks: formattedRemarks || null
          })
          .eq('id', editBillId);

        if (updateError) throw updateError;
        alert('Bill updated successfully!');
      } else {
        // Fetch the workspace owned by this user
        const { data: workspaces, error: wsError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id);

        if (wsError) throw wsError;
        if (!workspaces || workspaces.length === 0) {
          throw new Error('No workspace found for this account. Please contact support.');
        }

        const workspaceId = workspaces[0].id;

        // Insert bill record
        const { error: insertError } = await supabase
          .from('bills')
          .insert({
            workspace_id: workspaceId,
            medicine_name: medicineName,
            mrp: numericMrp,
            discount: numericDiscount,
            final_price: parseFloat(numericFinalPrice.toFixed(2)),
            date: billingDate,
            remarks: formattedRemarks || null,
            created_by: user.id
          });

        if (insertError) throw insertError;
        alert('Bill saved successfully!');
      }

      onSave(); // Trigger view switch back
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the bill.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 p-4 pb-24 space-y-5 overflow-y-auto bg-[#F8FAFC]">
      {/* Title Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div className="text-left">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {editBillId ? 'Update Bill' : 'Add New Bill'}
          </h1>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            {editBillId ? 'Update medicine expenses for aquaculture operations.' : 'Log medicine expenses for aquaculture operations.'}
          </p>
        </div>
        {onViewRecords && (
          <button 
            onClick={onViewRecords}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E2E8F0] hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-white rounded-xl text-[11px] font-bold transition-all cursor-pointer focus:outline-none shadow-sm press-effect"
          >
            <ClipboardList size={14} />
            Records
          </button>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-sm p-5 text-left animate-card-enter">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center">
              Medicine Name <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Oxytetracycline"
              className="block w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
            />
          </div>

          {/* Select Pond */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center">
              Pond <span className="text-[9px] font-semibold text-slate-400 ml-1.5">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
                className={`w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent appearance-none bg-[#F8FAFC] focus:bg-white cursor-pointer transition-all ${selectedPondId ? 'text-slate-800' : 'text-slate-300'}`}
              >
                <option value="">Select Pond</option>
                {ponds.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                ))}
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Select Category */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center">
              Category <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent appearance-none bg-[#F8FAFC] focus:bg-white cursor-pointer transition-all ${selectedCategory ? 'text-slate-800' : 'text-slate-300'}`}
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* MRP and Discount (Grid layout) */}
          <div className="grid grid-cols-2 gap-3">
            {/* MRP */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center">
                MRP (₹) <span className="text-red-400 ml-0.5">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={mrp}
                onChange={(e) => handleMrpChange(e.target.value)}
                placeholder="0.00"
                className="block w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
              />
            </div>

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="0"
                className="block w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Final Price */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center gap-1">
              Final Price
              <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Auto</span>
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={finalPrice ? `₹ ${parseFloat(finalPrice).toFixed(2)}` : '₹ 0.00'}
                className="block w-full h-11 pl-4 pr-10 bg-slate-50/80 border border-[#E2E8F0] rounded-xl text-sm text-slate-500 cursor-not-allowed focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 pointer-events-none">
                <Lock size={14} />
              </div>
            </div>
          </div>

          {/* Billing Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center">
              Billing Date <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="block w-full h-11 pl-4 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all z-10 relative cursor-pointer"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none z-20">
                <Calendar size={14} />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide">
              Remarks <span className="text-[9px] font-semibold text-slate-400">(optional)</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add notes about usage or batch number..."
              rows={3}
              className="block w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm placeholder-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Save/Update Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {editBillId ? 'Updating...' : 'Saving...'}
              </span>
            ) : (
              <>
                <Save size={16} strokeWidth={2.5} />
                {editBillId ? 'Update Bill' : 'Save Bill'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Compliance Banner Panel */}
      <div className="h-[120px] rounded-2xl relative overflow-hidden text-left shadow-md flex items-end p-4 animate-card-enter animate-card-enter-1">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center select-none"
          style={{ backgroundImage: `url('/compliance_banner.png')` }}
        ></div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        {/* Banner Text */}
        <div className="z-10 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-white/90 font-semibold leading-relaxed">
            Digital records help maintain environmental compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
