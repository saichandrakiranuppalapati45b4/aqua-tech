import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MoreVertical, Plus, Trash2, Waves, Droplet, Pencil, Check, X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Pond {
  id: string;
  name: string;
  species: string;
  capacity: number;
  created_at: string;
  workspace_id: string;
}

interface PondsProps {
  onBack: () => void;
  initialTab?: 'ponds' | 'species' | 'categories';
}

const SPECIES_OPTIONS = [
  'White Shrimp',
  'Tilapia',
  'Catfish',
  'Salmon',
  'Pangasius',
  'Rohu',
  'Carp',
  'Other',
];

const DEFAULT_CATEGORIES = [
  'Water Conditioner',
  'Nutritional Supplement',
  'Antiparasitic',
  'Antibiotic',
  'Other'
];

export const Ponds: React.FC<PondsProps> = ({ onBack, initialTab }) => {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [pondName, setPondName] = useState('');
  const [species, setSpecies] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ponds' | 'species' | 'categories'>(initialTab || 'ponds');
  const [speciesOptions, setSpeciesOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('abms_species_options');
    return saved ? JSON.parse(saved) : SPECIES_OPTIONS;
  });
  const [newSpeciesName, setNewSpeciesName] = useState('');
  const [editingSpeciesIndex, setEditingSpeciesIndex] = useState<number | null>(null);
  const [editSpeciesValue, setEditSpeciesValue] = useState('');

  const [categoriesOptions, setCategoriesOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('abms_categories_data');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  useEffect(() => {
    fetchPonds();
  }, []);

  useEffect(() => {
    localStorage.setItem('abms_species_options', JSON.stringify(speciesOptions));
  }, [speciesOptions]);

  useEffect(() => {
    localStorage.setItem('abms_categories_data', JSON.stringify(categoriesOptions));
  }, [categoriesOptions]);

  const handleAddSpecies = () => {
    const trimmed = newSpeciesName.trim();
    if (!trimmed) return;

    if (speciesOptions.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      alert('This species already exists.');
      return;
    }

    setSpeciesOptions([...speciesOptions, trimmed]);
    setNewSpeciesName('');
  };

  const handleStartEditSpecies = (index: number, value: string) => {
    setEditingSpeciesIndex(index);
    setEditSpeciesValue(value);
  };

  const handleCancelEditSpecies = () => {
    setEditingSpeciesIndex(null);
    setEditSpeciesValue('');
  };

  const handleSaveEditSpecies = async (index: number) => {
    const oldName = speciesOptions[index];
    const newName = editSpeciesValue.trim();
    
    if (!newName) return;
    if (oldName === newName) {
      handleCancelEditSpecies();
      return;
    }

    if (speciesOptions.some((s, idx) => idx !== index && s.toLowerCase() === newName.toLowerCase())) {
      alert('This species already exists.');
      return;
    }

    await handleEditSpecies(oldName, newName);
    handleCancelEditSpecies();
  };

  const handleEditSpecies = async (oldName: string, newName: string) => {
    const updatedOptions = speciesOptions.map(s => s === oldName ? newName : s);
    setSpeciesOptions(updatedOptions);

    // Update existing ponds that use this species
    try {
      // Update local storage first
      const saved = localStorage.getItem('abms_ponds_data');
      if (saved) {
        const localPonds = JSON.parse(saved);
        const updatedPonds = localPonds.map((pond: Pond) => {
          if (pond.species === oldName) {
            return { ...pond, species: newName };
          }
          return pond;
        });
        localStorage.setItem('abms_ponds_data', JSON.stringify(updatedPonds));
        setPonds(updatedPonds);
      }

      // Try updating remote database
      const pondsToUpdate = ponds.filter(p => p.species === oldName);
      for (const pond of pondsToUpdate) {
        if (pond.id && pond.id.length === 36) { // standard UUID length is 36
          await supabase
            .from('ponds')
            .update({ species: newName })
            .eq('id', pond.id);
        }
      }
      await fetchPonds();
    } catch (err) {
      console.error('Error updating ponds species:', err);
    }
  };

  const handleDeleteSpecies = (speciesToDelete: string) => {
    const inUse = ponds.some(p => p.species === speciesToDelete);
    if (inUse) {
      alert(`Cannot delete "${speciesToDelete}" because it is currently assigned to one or more ponds.`);
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete "${speciesToDelete}"?`);
    if (!confirm) return;

    setSpeciesOptions(speciesOptions.filter(s => s !== speciesToDelete));
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categoriesOptions.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category already exists.');
      return;
    }

    setCategoriesOptions([...categoriesOptions, trimmed]);
    setNewCategoryName('');
  };

  const handleStartEditCategory = (index: number, value: string) => {
    setEditingCategoryIndex(index);
    setEditCategoryValue(value);
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryIndex(null);
    setEditCategoryValue('');
  };

  const handleSaveEditCategory = async (index: number) => {
    const oldName = categoriesOptions[index];
    const newName = editCategoryValue.trim();
    
    if (!newName) return;
    if (oldName === newName) {
      handleCancelEditCategory();
      return;
    }

    if (categoriesOptions.some((c, idx) => idx !== index && c.toLowerCase() === newName.toLowerCase())) {
      alert('This category already exists.');
      return;
    }

    const updatedOptions = categoriesOptions.map(c => c === oldName ? newName : c);
    setCategoriesOptions(updatedOptions);
    handleCancelEditCategory();
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${categoryToDelete}"?`);
    if (!confirm) return;

    setCategoriesOptions(categoriesOptions.filter(c => c !== categoryToDelete));
  };

  const fetchPonds = async () => {
    try {
      setLoading(true);
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
        const workspaceId = workspaces[0].id;
        const { data, error } = await supabase
          .from('ponds')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching ponds, loading local storage fallback:', error);
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
      console.error('Error fetching ponds, loading local storage fallback:', err);
      const saved = localStorage.getItem('abms_ponds_data');
      setPonds(saved ? JSON.parse(saved) : []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPond = async () => {
    if (!pondName.trim() || !species || !capacity) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id);

      if (workspaces && workspaces.length > 0) {
        const { error } = await supabase
          .from('ponds')
          .insert({
            name: pondName.trim(),
            species,
            capacity: parseFloat(capacity),
            workspace_id: workspaces[0].id,
          });

        if (error) {
          console.error('Error adding pond to remote, saving to local storage fallback:', error);
          
          // Save to local storage fallback
          const newPond: Pond = {
            id: Math.random().toString(36).substring(2, 9),
            name: pondName.trim(),
            species,
            capacity: parseFloat(capacity),
            created_at: new Date().toISOString(),
            workspace_id: workspaces[0].id,
          };
          const saved = localStorage.getItem('abms_ponds_data');
          const localPonds = saved ? JSON.parse(saved) : [];
          const updatedPonds = [...localPonds, newPond];
          localStorage.setItem('abms_ponds_data', JSON.stringify(updatedPonds));
          setPonds(updatedPonds);
          
          setPondName('');
          setSpecies('');
          setCapacity('');
        } else {
          setPondName('');
          setSpecies('');
          setCapacity('');
          await fetchPonds();
        }
      }
    } catch (err) {
      console.error('Error adding pond:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePond = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this pond?');
    if (!confirm) return;

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('ponds')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting pond from remote, removing from local storage fallback:', error);
        
        // Remove from local storage fallback
        const saved = localStorage.getItem('abms_ponds_data');
        const localPonds = saved ? JSON.parse(saved) : [];
        const updatedPonds = localPonds.filter((p: Pond) => p.id !== id);
        localStorage.setItem('abms_ponds_data', JSON.stringify(updatedPonds));
        setPonds(updatedPonds);
      } else {
        await fetchPonds();
      }
    } catch (err) {
      console.error('Error deleting pond:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full flex-1 pb-24 overflow-y-auto bg-[#F8FAFC]">
      {/* Header */}
      <div className="px-4 py-3.5 flex justify-between items-center border-b border-[#F1F5F9] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none press-effect"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <h1 className="text-[16px] font-extrabold text-slate-800 tracking-tight">Pond Configuration</h1>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none">
          <MoreVertical size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 py-2 bg-white border-b border-[#F1F5F9] flex gap-2">
        <button
          onClick={() => setActiveTab('ponds')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ponds'
              ? 'bg-[#0F766E] text-white shadow-md shadow-[#0F766E]/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Ponds
        </button>
        <button
          onClick={() => setActiveTab('species')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'species'
              ? 'bg-[#0F766E] text-white shadow-md shadow-[#0F766E]/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Species Options
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#0F766E] text-white shadow-md shadow-[#0F766E]/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Categories
        </button>
      </div>

      <div className="p-4 space-y-6">
        {activeTab === 'ponds' ? (
          <>
            {/* Add New Pond Card */}
            <div className="animate-card-enter">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[13px] font-bold text-slate-800">Add New Pond</h2>
                <button className="text-[11px] font-bold text-[#0F766E] hover:text-[#14B8A6] cursor-pointer focus:outline-none transition-colors">
                  Technical Config
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 space-y-4 shadow-sm">
                {/* Pond Name / ID */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Pond Name / ID</label>
                  <input
                    type="text"
                    value={pondName}
                    onChange={(e) => setPondName(e.target.value)}
                    placeholder="e.g., Pond A1"
                    className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent transition-all bg-[#F8FAFC] focus:bg-white"
                  />
                </div>

                {/* Species */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Species</label>
                  <div className="relative">
                    <select
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      className={`w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent appearance-none bg-[#F8FAFC] focus:bg-white cursor-pointer transition-all ${species ? 'text-slate-800' : 'text-slate-300'}`}
                    >
                      <option value="" disabled>Select Species</option>
                      {speciesOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Acres */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Acres</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="e.g., 2.5"
                      className="w-full h-11 px-3.5 pr-16 border border-[#E2E8F0] rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent transition-all bg-[#F8FAFC] focus:bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Acres</span>
                  </div>
                </div>

                {/* Add Pond Button */}
                <button
                  onClick={handleAddPond}
                  disabled={saving || !pondName.trim() || !species || !capacity}
                  className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Adding...
                    </span>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={2.5} />
                      Add Pond
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Manage Ponds */}
            <div className="animate-card-enter" style={{ animationDelay: '80ms' }}>
              <h2 className="text-[13px] font-bold text-slate-800 mb-3">Manage Ponds</h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl animate-shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded animate-shimmer" />
                        <div className="h-2 w-40 rounded animate-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ponds.map((pond, i) => (
                    <div
                      key={pond.id}
                      className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 flex items-center justify-between shadow-sm card-hover animate-card-enter"
                      style={{ animationDelay: `${(i + 1) * 50}ms` }}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] flex items-center justify-center">
                          <Waves size={18} className="text-[#0F766E]" strokeWidth={2} />
                        </div>
                        <div>
                          <h4 className="text-[12px] font-bold text-slate-800">{pond.name}</h4>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {pond.species} • {pond.capacity} Acres
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePond(pond.id)}
                        disabled={deletingId === pond.id}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-all cursor-pointer focus:outline-none disabled:opacity-50 press-effect"
                      >
                        {deletingId === pond.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                          <Trash2 size={16} strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Empty state / encouragement card */}
                  <div className="bg-slate-50/50 border border-dashed border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 mt-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Droplet size={18} className="text-slate-300" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 text-center">
                      Add more ponds to expand your inventory
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'species' ? (
          <>
            {/* Add New Species Card */}
            <div className="animate-card-enter">
              <h2 className="text-[13px] font-bold text-slate-800 mb-3">Add New Species</h2>
              <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 space-y-4 shadow-sm">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Species Name</label>
                  <input
                    type="text"
                    value={newSpeciesName}
                    onChange={(e) => setNewSpeciesName(e.target.value)}
                    placeholder="e.g., White Shrimp"
                    className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent transition-all bg-[#F8FAFC] focus:bg-white"
                  />
                </div>
                <button
                  onClick={handleAddSpecies}
                  disabled={!newSpeciesName.trim()}
                  className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Add Species
                </button>
              </div>
            </div>

            {/* Manage Species */}
            <div className="animate-card-enter" style={{ animationDelay: '80ms' }}>
              <h2 className="text-[13px] font-bold text-slate-800 mb-3">Manage Species</h2>
              <div className="space-y-2.5">
                {speciesOptions.map((spec, i) => {
                  const isEditing = editingSpeciesIndex === i;
                  return (
                    <div
                      key={spec}
                      className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 flex items-center justify-between shadow-sm card-hover animate-card-enter"
                      style={{ animationDelay: `${(i + 1) * 50}ms` }}
                    >
                      <div className="flex-1 flex items-center gap-3.5 mr-2 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] flex items-center justify-center shrink-0">
                          <Droplet size={18} className="text-[#0F766E]" strokeWidth={2} />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSpeciesValue}
                            onChange={(e) => setEditSpeciesValue(e.target.value)}
                            className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent transition-all bg-[#F8FAFC]"
                          />
                        ) : (
                          <h4 className="text-[12px] font-bold text-slate-800 truncate">{spec}</h4>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEditSpecies(i)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-50 text-teal-600 transition-all cursor-pointer focus:outline-none"
                            >
                              <Check size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={handleCancelEditSpecies}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all cursor-pointer focus:outline-none"
                            >
                              <X size={16} strokeWidth={2} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEditSpecies(i, spec)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer focus:outline-none"
                            >
                              <Pencil size={14} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDeleteSpecies(spec)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-all cursor-pointer focus:outline-none"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Add New Category Card */}
            <div className="animate-card-enter">
              <h2 className="text-[13px] font-bold text-slate-800 mb-3">Add New Category</h2>
              <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 space-y-4 shadow-sm">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Water Conditioner"
                    className="w-full h-11 px-3.5 border border-[#E2E8F0] rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent transition-all bg-[#F8FAFC] focus:bg-white"
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/15 transition-all cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Add Category
                </button>
              </div>
            </div>

            {/* Manage Categories */}
            <div className="animate-card-enter" style={{ animationDelay: '80ms' }}>
              <h2 className="text-[13px] font-bold text-slate-800 mb-3">Manage Categories</h2>
              <div className="space-y-2.5">
                {categoriesOptions.map((cat, i) => {
                  const isEditing = editingCategoryIndex === i;
                  return (
                    <div
                      key={cat}
                      className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 flex items-center justify-between shadow-sm card-hover animate-card-enter"
                      style={{ animationDelay: `${(i + 1) * 50}ms` }}
                    >
                      <div className="flex-1 flex items-center gap-3.5 mr-2 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] flex items-center justify-center shrink-0">
                          <Droplet size={18} className="text-[#0F766E]" strokeWidth={2} />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCategoryValue}
                            onChange={(e) => setEditCategoryValue(e.target.value)}
                            className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5EEAD4] focus:border-transparent transition-all bg-[#F8FAFC]"
                          />
                        ) : (
                          <h4 className="text-[12px] font-bold text-slate-800 truncate">{cat}</h4>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEditCategory(i)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-50 text-teal-600 transition-all cursor-pointer focus:outline-none"
                            >
                              <Check size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={handleCancelEditCategory}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all cursor-pointer focus:outline-none"
                            >
                              <X size={16} strokeWidth={2} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEditCategory(i, cat)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer focus:outline-none"
                            >
                              <Pencil size={14} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-all cursor-pointer focus:outline-none"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
