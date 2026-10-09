import React, { useState, useEffect } from 'react';
import {
  RootNote,
  ScaleType,
  ChordType,
  ChordInversion,
  ChordDefinition,
  ProgressionTemplate,
} from '../audio/types';
import {
  ROOT_NOTES,
  getScaleDegrees,
  createChord,
} from '../harmony/musicTheory';
import { GENRE_PROGRESSIONS } from '../harmony/progressions';
import { downloadMidiFile } from '../harmony/MidiWriter';
import { soulKeysEngine } from '../audio/SoulKeysEngine';
import { midiToNoteName } from '../audio/DSPUtils';

interface HarmonyViewProps {
  selectedRoot: RootNote;
  onRootChange: (root: RootNote) => void;
  selectedScale: ScaleType;
  onScaleChange: (scale: ScaleType) => void;
  onChordAudition: (notes: number[]) => void;
  activeProgression: ChordDefinition[];
  onProgressionChange: (chords: ChordDefinition[]) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  activeProgressionTitle: string;
  onProgressionTitleChange: (title: string) => void;
}

export const HarmonyView: React.FC<HarmonyViewProps> = ({
  selectedRoot,
  onRootChange,
  selectedScale,
  onScaleChange,
  onChordAudition,
  activeProgression,
  onProgressionChange,
  bpm,
  onBpmChange,
  activeProgressionTitle,
  onProgressionTitleChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soulKeysEngine.isProgressionPlaying());
  const [currentStep, setCurrentStep] = useState<number>(soulKeysEngine.getProgressionStep());
  const [humanize, setHumanize] = useState<boolean>(true);
  const [isRenderingAudio, setIsRenderingAudio] = useState<boolean>(false);
  const [selectedGenreTab, setSelectedGenreTab] = useState<string>('All');

  // Custom Voicing Builder State
  const [customRoot, setCustomRoot] = useState<RootNote>(selectedRoot);
  const [customType, setCustomType] = useState<ChordType>('Minor 9th');
  const [customInversion, setCustomInversion] = useState<ChordInversion>('root');
  const [customOctave, setCustomOctave] = useState<number>(0);

  // Synchronize loop step callback from SoulKeysEngine
  useEffect(() => {
    const unsub = soulKeysEngine.subscribeProgressionStep((step, chord) => {
      setCurrentStep(step);
      setIsPlaying(soulKeysEngine.isProgressionPlaying());
      if (chord) {
        onChordAudition(chord.notes);
      }
    });

    return () => {
      unsub();
    };
  }, [onChordAudition]);

  // Update custom root if selectedRoot changes
  useEffect(() => {
    setCustomRoot(selectedRoot);
  }, [selectedRoot]);

  // Diatonic scale degree chords for current key & scale
  const scaleDegrees = getScaleDegrees(selectedRoot, selectedScale);

  // Play a single chord through the engine
  const playChord = (chord: ChordDefinition) => {
    onChordAudition(chord.notes);
    for (const note of chord.notes) {
      soulKeysEngine.noteOn(note, 0.85);
    }
    setTimeout(() => {
      for (const note of chord.notes) {
        soulKeysEngine.noteOff(note);
      }
    }, 850);
  };

  // Robust Play / Stop Loop handler using SoulKeysEngine's sequencer
  const handleTogglePlayLoop = async () => {
    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      if (activeProgression.length === 0) return;
      setIsPlaying(true);
      await soulKeysEngine.startProgressionLoop(activeProgression, bpm, humanize);
    }
  };

  // Load a genre template
  const handleLoadTemplate = (template: ProgressionTemplate) => {
    onRootChange(template.key);
    onScaleChange(template.scale);
    onBpmChange(template.bpm);
    onProgressionTitleChange(template.title);

    const newChords = template.chords.map((c) => ({ ...c }));
    onProgressionChange(newChords);

    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsPlaying(false);
      setCurrentStep(-1);
    }
  };

  // Add a diatonic chord to progression
  const handleAddDiatonicChord = (degreeItem: (typeof scaleDegrees)[0]) => {
    const chord = createChord(degreeItem.root, degreeItem.secondaryType, 0, 'root', degreeItem.roman);
    const updated = [...activeProgression, chord];
    onProgressionChange(updated);
    playChord(chord);
    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsPlaying(false);
      setCurrentStep(-1);
    }
  };

  // Add custom voiced chord to progression
  const handleAddCustomChord = () => {
    const chord = createChord(customRoot, customType, customOctave, customInversion);
    const updated = [...activeProgression, chord];
    onProgressionChange(updated);
    playChord(chord);
    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsPlaying(false);
      setCurrentStep(-1);
    }
  };

  // Remove a chord from progression
  const handleRemoveChord = (index: number) => {
    const next = [...activeProgression];
    next.splice(index, 1);
    onProgressionChange(next);
    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsPlaying(false);
      setCurrentStep(-1);
    }
  };

  // Move chord left/right
  const handleMoveChord = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= activeProgression.length) return;
    const next = [...activeProgression];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onProgressionChange(next);
    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsPlaying(false);
      setCurrentStep(-1);
    }
  };

  // Export Standard MIDI (.mid)
  const handleExportMidi = () => {
    if (activeProgression.length === 0) return;
    downloadMidiFile(
      activeProgression,
      bpm,
      `SoulKeys_${activeProgressionTitle.replace(/\s+/g, '_')}_${selectedRoot}.mid`
    );
  };

  // Render Real Audio WAV (.wav)
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

  const previewCustomChord = () => {
    const chord = createChord(customRoot, customType, customOctave, customInversion);
    playChord(chord);
  };

  // Filter progression templates
  const genreTabs = ['All', 'Amapiano', 'Gospel', 'Neo-Soul', 'Afro-House', 'R&B', 'Gqom'];
  const filteredTemplates = GENRE_PROGRESSIONS.filter((t) => {
    if (selectedGenreTab === 'All') return true;
    return t.genre === selectedGenreTab;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Key, Scale & Genre Templates Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Key & Scale Selector */}
        <div className="lg:col-span-5 bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <h3 className="text-xs font-semibold text-slate-200">
              Key & Scale Foundation
            </h3>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {selectedRoot} {selectedScale}
            </span>
          </div>

          {/* Root Note Palette */}
          <div className="mb-3">
            <label className="text-[11px] text-slate-400 block mb-1.5">Root Pitch</label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
              {ROOT_NOTES.map((root) => (
                <button
                  key={`root-btn-${root}`}
                  onClick={() => onRootChange(root)}
                  className={`py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                    selectedRoot === root
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-[#121927] text-slate-300 hover:bg-[#1A2438] border border-slate-800'
                  }`}
                >
                  {root}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Type Selector */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1.5">Harmonic Scale</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(
                [
                  'Major',
                  'Natural Minor',
                  'Dorian',
                  'Mixolydian',
                  'Harmonic Minor',
                  'Major Pentatonic',
                  'Minor Pentatonic',
                  'Blues',
                  'Neo-Soul',
                ] as ScaleType[]
              ).map((scale) => (
                <button
                  key={`scale-btn-${scale}`}
                  onClick={() => onScaleChange(scale)}
                  className={`py-1 px-2 rounded-lg text-[11px] font-medium truncate text-left transition-colors border ${
                    selectedScale === scale
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#101724] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Curated Genre Progression Inspiration (34 Presets) */}
        <div className="lg:col-span-7 bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Curated Harmonic Progressions ({GENRE_PROGRESSIONS.length} Styles)
              </h3>
              <p className="text-[10px] text-slate-400">
                Click any progression to load into your workstation and main performance view.
              </p>
            </div>
            {/* Genre filter tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] pb-0.5">
              {genreTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedGenreTab(tab)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                    selectedGenreTab === tab
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[195px] overflow-y-auto pr-1">
            {filteredTemplates.map((template) => {
              const isCurrent = activeProgressionTitle === template.title;
              return (
                <button
                  key={template.id}
                  onClick={() => handleLoadTemplate(template)}
                  className={`border rounded-xl p-2.5 text-left transition-all flex flex-col justify-between group ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-[#121927] hover:bg-[#1B253B] border-slate-800/90 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-200 truncate pr-2">
                      {template.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 shrink-0">
                      {template.bpm} BPM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-1">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                    <span className="text-slate-300">{template.key} {template.scale}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400/80 truncate">
                      {template.chords.map((c) => c.name).join(' - ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Diatonic Chords Palette */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Diatonic Scale Chords ({selectedRoot} {selectedScale})
            </h3>
            <p className="text-[11px] text-slate-400">
              Click to preview through instrument; click [+] to append to your progression timeline.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">7 Degrees</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {scaleDegrees.map((item) => {
            const chord = createChord(item.root, item.secondaryType, 0, 'root', item.roman);
            return (
              <div
                key={`diatonic-chord-tile-${item.degree}`}
                className="bg-[#101724] border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between group hover:border-slate-700 transition-colors"
              >
                <button
                  onClick={() => playChord(chord)}
                  className="flex flex-col items-center justify-center py-2 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Click to audition chord"
                >
                  <span className="text-[11px] font-mono text-amber-400 font-bold mb-0.5">
                    {item.roman}
                  </span>
                  <span className="text-sm font-bold text-slate-100">
                    {chord.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {chord.notes.map((n) => midiToNoteName(n)).join(' ')}
                  </span>
                </button>

                <button
                  onClick={() => handleAddDiatonicChord(item)}
                  className="mt-1.5 w-full py-1 rounded bg-[#172133] hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 text-[10px] font-medium border border-slate-800 hover:border-amber-500/30 transition-colors"
                >
                  + Add to Timeline
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Voicing & Inversion Builder */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Voicing & Inversion Designer
            </h3>
            <p className="text-[11px] text-slate-400">
              Craft custom jazz 9ths, minor 11ths, drop-2 voicings, or inverted soul cadences.
            </p>
          </div>
          <button
            onClick={previewCustomChord}
            className="px-3 py-1 rounded-lg bg-[#151E2E] border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Audition Voicing
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          {/* Root */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Root</label>
            <select
              value={customRoot}
              onChange={(e) => setCustomRoot(e.target.value as RootNote)}
              className="w-full bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
            >
              {ROOT_NOTES.map((r) => (
                <option key={`custom-root-${r}`} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Extension / Type</label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as ChordType)}
              className="w-full bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
            >
              <option value="Major Triad">Major Triad</option>
              <option value="Minor Triad">Minor Triad</option>
              <option value="Major 7th">Major 7th</option>
              <option value="Minor 7th">Minor 7th</option>
              <option value="Dominant 7th">Dominant 7th</option>
              <option value="Major 9th">Major 9th</option>
              <option value="Minor 9th">Minor 9th</option>
              <option value="Dominant 9th">Dominant 9th</option>
              <option value="Minor 11th">Minor 11th</option>
              <option value="Suspended 4th">Suspended 4th</option>
              <option value="Suspended 2nd">Suspended 2nd</option>
              <option value="Add 9">Add 9</option>
              <option value="6/9 Soul">6/9 Soul</option>
              <option value="Altered 7th">Altered 7th</option>
            </select>
          </div>

          {/* Inversion */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Inversion</label>
            <select
              value={customInversion}
              onChange={(e) => setCustomInversion(e.target.value as ChordInversion)}
              className="w-full bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
            >
              <option value="root">Root Position</option>
              <option value="1st">1st Inversion</option>
              <option value="2nd">2nd Inversion</option>
              <option value="3rd">3rd Inversion</option>
              <option value="drop2">Drop-2 (Lush Jazz)</option>
            </select>
          </div>

          {/* Octave */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Octave Offset</label>
            <select
              value={customOctave}
              onChange={(e) => setCustomOctave(parseInt(e.target.value))}
              className="w-full bg-[#101724] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
            >
              <option value="-1">-1 Octave</option>
              <option value="0">Default</option>
              <option value="1">+1 Octave</option>
            </select>
          </div>

          {/* Add Button */}
          <div>
            <button
              onClick={handleAddCustomChord}
              className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              + Insert Chord
            </button>
          </div>
        </div>
      </div>

      {/* 4. Progression Sequencer & Timeline */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-200">
                Progression Timeline: {activeProgressionTitle}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Active on Main Play Screen
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeProgression.length} chords sequenced. Hardware-synced loop playback with zero latency.
            </p>
          </div>

          {/* Transport Controls */}
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

            {/* Humanize Toggle */}
            <button
              onClick={() => setHumanize(!humanize)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                humanize
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#101724] text-slate-500 border-slate-800'
              }`}
              title="Add subtle human groove & velocity variation"
            >
              Humanize
            </button>

            {/* Play/Stop Button */}
            <button
              onClick={handleTogglePlayLoop}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <span>{isPlaying ? '■ Stop Loop' : '▶ Play Loop'}</span>
            </button>
          </div>
        </div>

        {/* Chord Sequence Timeline Slots */}
        {activeProgression.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No chords in progression. Add from diatonic palette or load a curated template above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {activeProgression.map((chord, idx) => {
              const isActive = currentStep === idx;
              return (
                <div
                  key={chord.id}
                  className={`relative bg-[#101724] border rounded-xl p-3 flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_14px_rgba(245,158,11,0.35)] scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      Step {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          onClick={() => handleMoveChord(idx, -1)}
                          className="text-[10px] text-slate-400 hover:text-white px-1 rounded hover:bg-slate-800"
                          title="Move Left"
                        >
                          ←
                        </button>
                      )}
                      {idx < activeProgression.length - 1 && (
                        <button
                          onClick={() => handleMoveChord(idx, 1)}
                          className="text-[10px] text-slate-400 hover:text-white px-1 rounded hover:bg-slate-800"
                          title="Move Right"
                        >
                          →
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveChord(idx)}
                        className="text-[10px] text-slate-500 hover:text-rose-400 px-1 rounded hover:bg-slate-800"
                        title="Delete Chord"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => playChord(chord)}
                    className="py-2 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <span className="text-base font-bold text-slate-100">
                      {chord.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {chord.inversion !== 'root' ? chord.inversion : chord.type}
                    </span>
                    <span className="text-[9px] font-mono text-amber-500/90 mt-1">
                      {chord.notes.map((n) => midiToNoteName(n)).join(' ')}
                    </span>
                  </button>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{chord.durationBeats || 4} Beats</span>
                    <button
                      onClick={() => playChord(chord)}
                      className="text-amber-400 hover:underline"
                    >
                      Play
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Export Suite Buttons (Section 9.5 of Master Plan) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Export standard MIDI file (.mid) or rendered studio audio (.wav) directly for your DAW.
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
    </div>
  );
};
