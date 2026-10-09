import React, { useState } from 'react';
import {
  Preset,
  SoulKeysState,
  VelocityCurveType,
  VoiceMode,
  RootNote,
  ScaleType,
  ChordDefinition,
} from '../audio/types';
import { Knob } from './Knob';
import { Visualizer } from './Visualizer';
import { getScaleDegrees, createChord } from '../harmony/musicTheory';
import { soulKeysEngine } from '../audio/SoulKeysEngine';
import { downloadMidiFile } from '../harmony/MidiWriter';
import { midiToNoteName } from '../audio/DSPUtils';

interface PlayViewProps {
  currentPreset: Preset;
  state: SoulKeysState;
  onMacroChange: (key: keyof SoulKeysState['macros'], value: number) => void;
  onStateChange: (patch: Partial<SoulKeysState>) => void;
  onOpenPresetBrowser: () => void;
  onPrevPreset: () => void;
  onNextPreset: () => void;
  onChordAudition: (notes: number[]) => void;
  selectedRoot: RootNote;
  selectedScale: ScaleType;
  // Shared Active Progression
  activeProgression: ChordDefinition[];
  activeProgressionTitle: string;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isLoopPlaying: boolean;
  activeLoopStep: number;
  onTogglePlayLoop: () => void;
  onOpenHarmonyView: () => void;
}

export const PlayView: React.FC<PlayViewProps> = ({
  currentPreset,
  state,
  onMacroChange,
  onStateChange,
  onOpenPresetBrowser,
  onPrevPreset,
  onNextPreset,
  onChordAudition,
  selectedRoot,
  selectedScale,
  activeProgression,
  activeProgressionTitle,
  bpm,
  onBpmChange,
  isLoopPlaying,
  activeLoopStep,
  onTogglePlayLoop,
  onOpenHarmonyView,
}) => {
  const [isRenderingAudio, setIsRenderingAudio] = useState<boolean>(false);

  // Generate 7 quick scale chords for immediate playing in key
  const scaleDegrees = getScaleDegrees(selectedRoot, selectedScale);

  const handleTriggerQuickChord = (item: (typeof scaleDegrees)[0]) => {
    const chord = createChord(item.root, item.secondaryType, 0, 'root', item.roman);
    onChordAudition(chord.notes);
    for (const note of chord.notes) {
      soulKeysEngine.noteOn(note, 0.82);
    }
    setTimeout(() => {
      for (const note of chord.notes) {
        soulKeysEngine.noteOff(note);
      }
    }, 700);
  };

  const handlePlayProgressionChord = (chord: ChordDefinition) => {
    onChordAudition(chord.notes);
    for (const note of chord.notes) {
      soulKeysEngine.noteOn(note, 0.85);
    }
    setTimeout(() => {
      for (const note of chord.notes) {
        soulKeysEngine.noteOff(note);
      }
    }, 750);
  };

  // Export Standard MIDI (.mid) directly from main page
  const handleExportMidi = () => {
    if (activeProgression.length === 0) return;
    downloadMidiFile(
      activeProgression,
      bpm,
      `SoulKeys_${activeProgressionTitle.replace(/\s+/g, '_')}_${selectedRoot}.mid`
    );
  };

  // Render Real Audio WAV (.wav) directly from main page
  const handleRenderAudioWav = async () => {
    if (activeProgression.length === 0 || isRenderingAudio) return;
    setIsRenderingAudio(true);

    try {
      const beatSeconds = 60 / bpm;
      const notesTimeline: { note: number; velocity: number; time: number; duration: number }[] = [];
      let currentTime = 0;

      for (const chord of activeProgression) {
        const chordDuration = (chord.durationBeats || 4) * beatSeconds;
        for (const note of chord.notes) {
          notesTimeline.push({
            note,
            velocity: 0.85,
            time: currentTime,
            duration: chordDuration * 0.9,
          });
        }
        currentTime += chordDuration;
      }

      const wavBlob = await soulKeysEngine.renderProgressionToWav(notesTimeline, currentTime);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SoulKeys_${activeProgressionTitle.replace(/\s+/g, '_')}_Audio.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Audio export handling
    } finally {
      setIsRenderingAudio(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Top Play Strip: Preset Banner & Realtime Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Preset Identity Card */}
        <div className="lg:col-span-7 bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="text-amber-400 font-medium">{currentPreset.category}</span>
                <span aria-hidden="true">·</span>
                <span>The Plugin Foundry</span>
                <span aria-hidden="true">·</span>
                <span>100 Pro Presets</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
                {currentPreset.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-xl">
                {currentPreset.description}
              </p>
            </div>

            {/* Preset Browser Action */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onPrevPreset}
                className="w-8 h-8 rounded-lg bg-[#111726] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors text-sm"
                title="Previous Preset"
              >
                ◀
              </button>
              <button
                onClick={onOpenPresetBrowser}
                className="px-3.5 py-1.5 rounded-lg bg-[#151D2C] border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Browse (100)</span>
              </button>
              <button
                onClick={onNextPreset}
                className="w-8 h-8 rounded-lg bg-[#111726] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors text-sm"
                title="Next Preset"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Preset Tags */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
            {currentPreset.tags.map((tag, idx) => (
              <React.Fragment key={tag}>
                <span>{tag}</span>
                {idx < currentPreset.tags.length - 1 && <span aria-hidden="true">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Real-time Scope & Meters */}
        <div className="lg:col-span-5">
          <Visualizer />
        </div>
      </div>

      {/* 2. Main Sound Shaper: 12 Master Macro Controls */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Sound Character & Shaping
            </h3>
            <p className="text-[11px] text-slate-400">
              Primary macro controls mapped directly to synthesis partials, warmth, envelopes, and effects.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            12-Macro Core
          </span>
        </div>

        {/* Macro Knobs Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-y-4 gap-x-2 justify-items-center">
          <Knob
            label="Warmth"
            value={state.macros.warmth}
            unit="%"
            onChange={(v) => onMacroChange('warmth', v)}
          />
          <Knob
            label="Brightness"
            value={state.macros.brightness}
            unit="%"
            onChange={(v) => onMacroChange('brightness', v)}
          />
          <Knob
            label="Bell"
            value={state.macros.bell}
            unit="%"
            onChange={(v) => onMacroChange('bell', v)}
          />
          <Knob
            label="Body"
            value={state.macros.body}
            unit="%"
            onChange={(v) => onMacroChange('body', v)}
          />
          <Knob
            label="Attack"
            value={state.macros.attack}
            unit="%"
            onChange={(v) => onMacroChange('attack', v)}
          />
          <Knob
            label="Decay"
            value={state.macros.decay}
            unit="%"
            onChange={(v) => onMacroChange('decay', v)}
          />
          <Knob
            label="Release"
            value={state.macros.release}
            unit="%"
            onChange={(v) => onMacroChange('release', v)}
          />
          <Knob
            label="Movement"
            value={state.macros.movement}
            unit="%"
            onChange={(v) => onMacroChange('movement', v)}
          />
          <Knob
            label="Chorus"
            value={state.macros.chorus}
            unit="%"
            onChange={(v) => onMacroChange('chorus', v)}
          />
          <Knob
            label="Reverb"
            value={state.macros.reverb}
            unit="%"
            onChange={(v) => onMacroChange('reverb', v)}
          />
          <Knob
            label="Delay"
            value={state.macros.delay}
            unit="%"
            onChange={(v) => onMacroChange('delay', v)}
          />
          <Knob
            label="Output"
            value={state.macros.output}
            unit="%"
            onChange={(v) => onMacroChange('output', v)}
          />
        </div>
      </div>

      {/* 3. NEW: Active Harmony Progression Player on the Main Page */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-200">
                Active Progression: {activeProgressionTitle}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Main Screen Harmonizer
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Play and tweak active chord changes live while adjusting macro knobs in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* BPM */}
            <div className="flex items-center gap-1.5 bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="text-[11px] text-slate-400">BPM</span>
              <input
                type="number"
                min={40}
                max={240}
                value={bpm}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 112;
                  onBpmChange(val);
                  soulKeysEngine.setProgressionBpm(val);
                }}
                className="w-12 bg-transparent text-center font-mono text-xs text-amber-400 font-bold focus:outline-none"
              />
            </div>

            {/* Play/Stop Loop */}
            <button
              onClick={onTogglePlayLoop}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                isLoopPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <span>{isLoopPlaying ? '■ Stop Loop' : '▶ Play Progression Loop'}</span>
            </button>

            {/* Harmony Studio Link */}
            <button
              onClick={onOpenHarmonyView}
              className="px-3 py-1.5 rounded-lg bg-[#151E2E] hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              Harmony Studio →
            </button>
          </div>
        </div>

        {/* Progression Chords Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 mb-4">
          {activeProgression.map((chord, idx) => {
            const isActive = activeLoopStep === idx;
            return (
              <button
                key={`prog-pad-${chord.id}-${idx}`}
                onClick={() => handlePlayProgressionChord(chord)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_14px_rgba(245,158,11,0.4)] scale-[1.02]'
                    : 'bg-[#101724] border-slate-800 hover:border-slate-700 hover:bg-[#141C2B]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    Step {idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {chord.durationBeats || 4} Beats
                  </span>
                </div>
                <div className="text-base font-bold text-slate-100 group-hover:text-amber-200">
                  {chord.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                  {chord.notes.map((n) => midiToNoteName(n)).join(' ')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chord Exporter on the Main Page (as requested by user!) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Export chords as Standard MIDI (.mid) or 16-bit studio audio (.wav) directly from the main page.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMidi}
              disabled={activeProgression.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-[#151D2C] border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span>Export MIDI (.mid)</span>
            </button>

            <button
              onClick={handleRenderAudioWav}
              disabled={activeProgression.length === 0 || isRenderingAudio}
              className="px-3.5 py-1.5 rounded-lg bg-[#151D2C] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span>{isRenderingAudio ? 'Rendering...' : 'Render Audio (.wav)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Performance Options & In-Key Diatonic Chord Audition Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Performance Strip */}
        <div className="lg:col-span-5 bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <h4 className="text-xs font-semibold text-slate-300 mb-3">
            Performance & Articulation
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Velocity Curve */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Velocity Curve</label>
              <select
                value={state.velocityCurve}
                onChange={(e) => onStateChange({ velocityCurve: e.target.value as VelocityCurveType })}
                className="w-full bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
              >
                <option value="linear">Linear Response</option>
                <option value="soft">Soft Touch (Expressive)</option>
                <option value="hard">Hard Touch (Punchy)</option>
                <option value="compressed">Studio Compressed</option>
              </select>
            </div>

            {/* Voice Polyphony Mode */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Voice Mode</label>
              <select
                value={state.voiceMode}
                onChange={(e) => onStateChange({ voiceMode: e.target.value as VoiceMode })}
                className="w-full bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
              >
                <option value="poly16">Polyphonic (24 Voices)</option>
                <option value="poly8">Polyphonic (8 Voices)</option>
                <option value="mono">Monophonic</option>
                <option value="legato">Legato Glide</option>
              </select>
            </div>

            {/* Glide Time */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Portamento Glide</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={state.glideTime}
                  onChange={(e) => onStateChange({ glideTime: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-[10px] text-slate-400 w-10 text-right">
                  {Math.round(state.glideTime * 1000)}ms
                </span>
              </div>
            </div>

            {/* Layer Quick Toggles */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Active Layers</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    onStateChange({
                      layerKeys: { ...state.layerKeys, enabled: !state.layerKeys.enabled },
                    })
                  }
                  className={`flex-1 py-1 rounded text-[10px] font-semibold border transition-colors ${
                    state.layerKeys.enabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#101724] text-slate-500 border-slate-800'
                  }`}
                >
                  Keys
                </button>
                <button
                  onClick={() =>
                    onStateChange({
                      layerWarmth: { ...state.layerWarmth, enabled: !state.layerWarmth.enabled },
                    })
                  }
                  className={`flex-1 py-1 rounded text-[10px] font-semibold border transition-colors ${
                    state.layerWarmth.enabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#101724] text-slate-500 border-slate-800'
                  }`}
                >
                  Warmth
                </button>
                <button
                  onClick={() =>
                    onStateChange({
                      layerPad: { ...state.layerPad, enabled: !state.layerPad.enabled },
                    })
                  }
                  className={`flex-1 py-1 rounded text-[10px] font-semibold border transition-colors ${
                    state.layerPad.enabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#101724] text-slate-500 border-slate-800'
                  }`}
                >
                  Pad
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* In-Key Diatonic Chord Audition Strip */}
        <div className="lg:col-span-7 bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-300">
                In-Key Scale Chords
              </h4>
              <p className="text-[11px] text-slate-400">
                Diatonic chords in {selectedRoot} {selectedScale}. Click any pad to audition with current sound.
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-400">
              {selectedRoot} {selectedScale}
            </span>
          </div>

          {/* Chord Pads Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {scaleDegrees.map((item) => (
              <button
                key={`quick-pad-${item.degree}`}
                onClick={() => handleTriggerQuickChord(item)}
                className="bg-[#121927] hover:bg-[#1A2338] active:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group"
              >
                <span className="text-[10px] font-mono text-amber-400/90 font-bold mb-0.5">
                  {item.roman}
                </span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-200">
                  {item.root}
                </span>
                <span className="text-[9px] text-slate-400 truncate max-w-full">
                  {item.secondaryType.replace(' Triad', '').replace('7th', '7')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
