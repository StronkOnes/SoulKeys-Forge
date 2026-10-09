import React from 'react';

export type ViewTab = 'play' | 'design' | 'harmony';

interface TopBarProps {
  currentView: ViewTab;
  onViewChange: (view: ViewTab) => void;
  onOpenPresetBrowser: () => void;
  audioActive: boolean;
  onToggleAudio: () => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  midiDeviceName: string | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onViewChange,
  onOpenPresetBrowser,
  audioActive,
  onToggleAudio,
  masterVolume,
  onMasterVolumeChange,
  midiDeviceName,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-[#0A0D16]">
      {/* Zone 1: Single text element wordmark in display face */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onViewChange('play');
        }}
        className="text-xl font-bold tracking-tight text-slate-100 font-display whitespace-nowrap shrink-0 hover:text-amber-300 transition-colors"
      >
        SoulKeys Forge
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => onViewChange('play')}
          className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
            currentView === 'play'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Play
        </button>

        <button
          onClick={() => onViewChange('design')}
          className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
            currentView === 'design'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Design
        </button>

        <button
          onClick={() => onViewChange('harmony')}
          className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
            currentView === 'harmony'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Harmony
        </button>

        <button
          onClick={onOpenPresetBrowser}
          className="whitespace-nowrap shrink-0 text-slate-400 hover:text-slate-200 transition-colors pb-0.5"
        >
          Presets
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Subtle unboxed metadata for MIDI connection if detected */}
        {midiDeviceName && (
          <span className="hidden md:inline text-xs text-slate-400 font-mono truncate max-w-[140px]">
            MIDI: {midiDeviceName}
          </span>
        )}

        {/* Master Output Level */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Vol</span>
          <input
            type="range"
            min={0}
            max={1.2}
            step={0.02}
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
            className="w-16 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            title={`Master Volume: ${Math.round((masterVolume / 1.2) * 100)}%`}
          />
        </div>

        {/* Primary CTA / Engine Toggle */}
        <button
          onClick={onToggleAudio}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm ${
            audioActive
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-[#151D2C] hover:bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}
        >
          {audioActive ? 'Audio Online' : 'Start Audio'}
        </button>
      </div>
    </header>
  );
};
