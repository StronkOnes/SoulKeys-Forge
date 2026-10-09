/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar, ViewTab } from './components/TopBar';
import { PlayView } from './components/PlayView';
import { DesignView } from './components/DesignView';
import { HarmonyView } from './components/HarmonyView';
import { PianoKeyboard } from './components/PianoKeyboard';
import { PresetBrowserModal } from './components/PresetBrowserModal';
import { FACTORY_PRESETS } from './presets/factoryPresets';
import { GENRE_PROGRESSIONS } from './harmony/progressions';
import { soulKeysEngine } from './audio/SoulKeysEngine';
import { Preset, SoulKeysState, RootNote, ScaleType, ChordDefinition } from './audio/types';

const USER_PRESETS_STORAGE_KEY = 'soulkeys_forge_user_presets';
const FAVORITES_STORAGE_KEY = 'soulkeys_forge_favorites';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewTab>('play');
  const [presets, setPresets] = useState<Preset[]>(() => {
    // Merge 100 factory presets with saved favorites & user presets from localStorage
    try {
      const savedFavorites: string[] = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
      const savedUserPresets: Preset[] = JSON.parse(localStorage.getItem(USER_PRESETS_STORAGE_KEY) || '[]');

      const mergedFactory = FACTORY_PRESETS.map((p) => ({
        ...p,
        favorite: savedFavorites.includes(p.id),
      }));

      return [...mergedFactory, ...savedUserPresets];
    } catch {
      return FACTORY_PRESETS;
    }
  });

  const [currentPresetIndex, setCurrentPresetIndex] = useState<number>(0);
  const currentPreset = presets[currentPresetIndex] || FACTORY_PRESETS[0];

  const [state, setState] = useState<SoulKeysState>(() => currentPreset.state);
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [isPresetBrowserOpen, setIsPresetBrowserOpen] = useState<boolean>(false);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const [connectedMidiDevice, setConnectedMidiDevice] = useState<string | null>(null);

  // Harmony selection & shared progression
  const [selectedRoot, setSelectedRoot] = useState<RootNote>('D#');
  const [selectedScale, setSelectedScale] = useState<ScaleType>('Natural Minor');
  const [activeProgression, setActiveProgression] = useState<ChordDefinition[]>(() => {
    return GENRE_PROGRESSIONS[0].chords.map((c) => ({ ...c }));
  });
  const [activeProgressionTitle, setActiveProgressionTitle] = useState<string>(GENRE_PROGRESSIONS[0].title);
  const [progressionBpm, setProgressionBpm] = useState<number>(GENRE_PROGRESSIONS[0].bpm);

  // Progression Loop State synced with SoulKeysEngine
  const [isLoopPlaying, setIsLoopPlaying] = useState<boolean>(false);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(-1);

  // Load initial preset into engine on mount and subscribe to engine events
  useEffect(() => {
    soulKeysEngine.setState(currentPreset.state);

    // Subscribe to MIDI device updates
    const unsubDevices = soulKeysEngine.subscribeDeviceChange((devices) => {
      setConnectedMidiDevice(devices.length > 0 ? devices[0] : null);
    });

    // Subscribe to Progression Sequencer events
    const unsubSequencer = soulKeysEngine.subscribeProgressionStep((step, chord) => {
      setActiveLoopStep(step);
      setIsLoopPlaying(soulKeysEngine.isProgressionPlaying());
      if (chord) {
        setHighlightedNotes(chord.notes);
        setTimeout(() => {
          setHighlightedNotes([]);
        }, 750);
      }
    });

    return () => {
      unsubDevices();
      unsubSequencer();
    };
  }, []);

  const handleToggleAudio = async () => {
    await soulKeysEngine.initAudio();
    setAudioActive(soulKeysEngine.isRunning());
  };

  const handleMacroChange = useCallback((key: keyof SoulKeysState['macros'], value: number) => {
    soulKeysEngine.setMacro(key, value);
    setState({ ...soulKeysEngine.getState() });
  }, []);

  const handleStateChange = useCallback((patch: Partial<SoulKeysState>) => {
    soulKeysEngine.setState(patch);
    setState({ ...soulKeysEngine.getState() });
  }, []);

  const handleSelectPreset = (preset: Preset) => {
    const idx = presets.findIndex((p) => p.id === preset.id);
    if (idx !== -1) setCurrentPresetIndex(idx);
    soulKeysEngine.setState(preset.state);
    setState(preset.state);
  };

  const handlePrevPreset = () => {
    const nextIdx = (currentPresetIndex - 1 + presets.length) % presets.length;
    setCurrentPresetIndex(nextIdx);
    const preset = presets[nextIdx];
    soulKeysEngine.setState(preset.state);
    setState(preset.state);
  };

  const handleNextPreset = () => {
    const nextIdx = (currentPresetIndex + 1) % presets.length;
    setCurrentPresetIndex(nextIdx);
    const preset = presets[nextIdx];
    soulKeysEngine.setState(preset.state);
    setState(preset.state);
  };

  const handleSaveUserPreset = (name: string, description: string, category: Preset['category']) => {
    const newPreset: Preset = {
      id: `user-${Date.now()}`,
      name,
      category,
      author: 'User Preset',
      description,
      tags: ['Custom', category],
      state: JSON.parse(JSON.stringify(soulKeysEngine.getState())),
      favorite: false,
    };

    const nextPresets = [...presets, newPreset];
    setPresets(nextPresets);
    setCurrentPresetIndex(nextPresets.length - 1);

    try {
      const userPresetsOnly = nextPresets.filter((p) => p.id.startsWith('user-'));
      localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify(userPresetsOnly));
    } catch {
      // storage error handling
    }
  };

  const handleToggleFavorite = (presetId: string) => {
    const nextPresets = presets.map((p) => (p.id === presetId ? { ...p, favorite: !p.favorite } : p));
    setPresets(nextPresets);

    try {
      const favoriteIds = nextPresets.filter((p) => p.favorite).map((p) => p.id);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // storage error handling
    }
  };

  // Stable reference for chord visualizer trigger
  const handleChordAudition = useCallback((notes: number[]) => {
    setHighlightedNotes(notes);
    setTimeout(() => {
      setHighlightedNotes([]);
    }, 750);
  }, []);

  // Shared Progression Loop Toggle
  const handleTogglePlayLoop = useCallback(async () => {
    if (soulKeysEngine.isProgressionPlaying()) {
      soulKeysEngine.stopProgressionLoop();
      setIsLoopPlaying(false);
      setActiveLoopStep(-1);
    } else {
      if (activeProgression.length === 0) return;
      setIsLoopPlaying(true);
      await soulKeysEngine.startProgressionLoop(activeProgression, progressionBpm, true);
    }
  }, [activeProgression, progressionBpm]);

  return (
    <div className="min-h-screen bg-[#080B11] text-[#E8ECF2] flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Header with Top Bar Contract */}
      <TopBar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenPresetBrowser={() => setIsPresetBrowserOpen(true)}
        audioActive={audioActive}
        onToggleAudio={handleToggleAudio}
        masterVolume={state.masterVolume}
        onMasterVolumeChange={(v) => handleStateChange({ masterVolume: v })}
        midiDeviceName={connectedMidiDevice}
      />

      {/* 2. Main Workstation Body (1440px max width baseline) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Active View Container */}
        <div className="flex-1">
          {currentView === 'play' && (
            <PlayView
              currentPreset={currentPreset}
              state={state}
              onMacroChange={handleMacroChange}
              onStateChange={handleStateChange}
              onOpenPresetBrowser={() => setIsPresetBrowserOpen(true)}
              onPrevPreset={handlePrevPreset}
              onNextPreset={handleNextPreset}
              onChordAudition={handleChordAudition}
              selectedRoot={selectedRoot}
              selectedScale={selectedScale}
              activeProgression={activeProgression}
              activeProgressionTitle={activeProgressionTitle}
              bpm={progressionBpm}
              onBpmChange={setProgressionBpm}
              isLoopPlaying={isLoopPlaying}
              activeLoopStep={activeLoopStep}
              onTogglePlayLoop={handleTogglePlayLoop}
              onOpenHarmonyView={() => setCurrentView('harmony')}
            />
          )}

          {currentView === 'design' && (
            <DesignView state={state} onStateChange={handleStateChange} />
          )}

          {currentView === 'harmony' && (
            <HarmonyView
              selectedRoot={selectedRoot}
              onRootChange={setSelectedRoot}
              selectedScale={selectedScale}
              onScaleChange={setSelectedScale}
              onChordAudition={handleChordAudition}
              activeProgression={activeProgression}
              onProgressionChange={setActiveProgression}
              bpm={progressionBpm}
              onBpmChange={setProgressionBpm}
              activeProgressionTitle={activeProgressionTitle}
              onProgressionTitleChange={setActiveProgressionTitle}
            />
          )}
        </div>

        {/* 3. Docked Expressive Piano Keyboard (Always available for immediate playing) */}
        <div className="mt-2">
          <PianoKeyboard
            highlightedNotes={highlightedNotes}
            octaveShift={state.octaveShift}
            onOctaveShiftChange={(shift) => handleStateChange({ octaveShift: shift })}
            sustainHold={state.sustainHold}
            onSustainHoldChange={(hold) => handleStateChange({ sustainHold: hold })}
          />
        </div>
      </main>

      {/* 4. Quiet Editorial Footer */}
      <footer className="border-t border-slate-900/90 px-6 py-4 bg-[#07090F] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span>SoulKeys Forge</span>
          <span aria-hidden="true">·</span>
          <span>The Plugin Foundry</span>
          <span aria-hidden="true">·</span>
          <span>Amapiano & Soul Harmonic Workstation</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>{presets.length} Pro Presets</span>
          <span aria-hidden="true">·</span>
          <span>{GENRE_PROGRESSIONS.length} Harmonies</span>
          <span aria-hidden="true">·</span>
          <span>Offline Synthesis Engine</span>
          <span aria-hidden="true">·</span>
          <span>Web MIDI Ready</span>
        </div>
      </footer>

      {/* 5. Preset Browser Modal */}
      <PresetBrowserModal
        isOpen={isPresetBrowserOpen}
        onClose={() => setIsPresetBrowserOpen(false)}
        presets={presets}
        currentPresetId={currentPreset.id}
        currentState={state}
        onSelectPreset={handleSelectPreset}
        onSaveUserPreset={handleSaveUserPreset}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
