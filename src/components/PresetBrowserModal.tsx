import React, { useState } from 'react';
import { Preset, SoulKeysState } from '../audio/types';

interface PresetBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  currentPresetId: string;
  currentState: SoulKeysState;
  onSelectPreset: (preset: Preset) => void;
  onSaveUserPreset: (name: string, description: string, category: Preset['category']) => void;
  onToggleFavorite: (presetId: string) => void;
}

export const PresetBrowserModal: React.FC<PresetBrowserModalProps> = ({
  isOpen,
  onClose,
  presets,
  currentPresetId,
  currentState,
  onSelectPreset,
  onSaveUserPreset,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');
  const [newPresetCategory, setNewPresetCategory] = useState<Preset['category']>('Soul');

  if (!isOpen) return null;

  const categories = ['All', 'Favorites', 'Soul', 'Electric', 'Warm Keys', 'Amapiano', 'Pads', 'Atmospheric'];

  const filteredPresets = presets.filter((p) => {
    // Category match
    if (selectedCategory === 'Favorites') {
      if (!p.favorite) return false;
    } else if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = p.name.toLowerCase().includes(q);
      const inDesc = p.description.toLowerCase().includes(q);
      const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
      return inName || inDesc || inTags;
    }

    return true;
  });

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveUserPreset(newPresetName.trim(), newPresetDesc.trim(), newPresetCategory);
    setNewPresetName('');
    setNewPresetDesc('');
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0E1320]">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-display">
              Preset Library
            </h3>
            <p className="text-[11px] text-slate-400">
              Browse 20 factory presets & user custom instruments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0D121D] flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search presets, tags, vibes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#141C2B] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Save As Button */}
          <button
            onClick={() => setIsSaving(!isSaving)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#151E2E] hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-medium transition-colors"
          >
            {isSaving ? 'Cancel' : '+ Save Preset'}
          </button>
        </div>

        {/* Save Preset Form Drawer */}
        {isSaving && (
          <form
            onSubmit={handleSaveSubmit}
            className="p-4 bg-[#121826] border-b border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Preset Name</label>
              <input
                type="text"
                required
                placeholder="My Custom Soul Keys"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full bg-[#182133] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <select
                value={newPresetCategory}
                onChange={(e) => setNewPresetCategory(e.target.value as Preset['category'])}
                className="w-full bg-[#182133] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Soul">Soul</option>
                <option value="Electric">Electric</option>
                <option value="Warm Keys">Warm Keys</option>
                <option value="Amapiano">Amapiano</option>
                <option value="Pads">Pads</option>
                <option value="Atmospheric">Atmospheric</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Description</label>
              <input
                type="text"
                placeholder="Custom tuned parameters..."
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
                className="w-full bg-[#182133] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Save To Library
              </button>
            </div>
          </form>
        )}

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredPresets.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              No presets matching criteria.
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const isSelected = preset.id === currentPresetId;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-[#101724] border-slate-800 hover:border-slate-700 hover:bg-[#141C2B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <span className="text-amber-400/90 font-medium">{preset.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{preset.author}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {preset.name}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(preset.id);
                      }}
                      className={`text-sm p-1 rounded hover:bg-slate-800 transition-colors ${
                        preset.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={preset.favorite ? 'Unfavorite' : 'Favorite'}
                    >
                      ★
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 mb-2">
                    {preset.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 pt-2 border-t border-slate-800/60">
                    {preset.tags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0E1320] flex items-center justify-between text-xs text-slate-400">
          <span>{filteredPresets.length} presets found</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
