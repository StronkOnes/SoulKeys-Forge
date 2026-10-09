export type VelocityCurveType = 'soft' | 'linear' | 'hard' | 'compressed';

export type VoiceMode = 'poly16' | 'poly8' | 'mono' | 'legato';

export type FilterType = 'lowpass' | 'bandpass' | 'highpass' | 'warm_ladder';

export type LfoWaveform = 'sine' | 'triangle' | 'square' | 'random';

export type LfoTarget = 'pitch' | 'cutoff' | 'amplitude' | 'pan';

export interface EnvelopeParams {
  attack: number;   // 0.001s to 5s
  decay: number;    // 0.01s to 8s
  sustain: number;  // 0.0 to 1.0 (gain)
  release: number;  // 0.01s to 10s
}

export interface LayerParams {
  enabled: boolean;
  volume: number;   // 0 to 1
  pan: number;      // -1 to 1
  octave: number;   // -2, -1, 0, 1, 2
  detune: number;   // -50 to +50 cents
  mute: boolean;
  solo: boolean;
}

export interface ElectricKeysParams {
  bell: number;      // 0 to 1 (amount of high metallic tine/partial)
  tineRatio: number; // 2.5 to 9.5 (frequency multiplier for bell partial)
  malletClick: number; // 0 to 1 (transient strike attack level)
  bodyTone: number;  // 0 to 1 (fundamental body warmth)
  decayTime: number; // 0.2 to 8.0s
  velocitySensitivity: number; // 0 to 1
}

export interface WarmKeysParams {
  waveformBlend: number; // 0 (triangle/warm) to 1 (sawtooth/rich)
  warmSaturation: number; // 0 to 1
  filterOffset: number; // -1 to 1 (relative brightness)
  velocityBrightness: number; // 0 to 1
}

export interface PadParams {
  waveType: 'sawtooth' | 'triangle' | 'sine';
  stereoSpread: number; // 0 to 1
  detuneAmount: number; // 0 to 30 cents
  attackTime: number; // 0.05 to 4.0s
  releaseTime: number; // 0.1 to 6.0s
}

export interface FilterParams {
  type: FilterType;
  cutoff: number;      // 20Hz to 20000Hz
  resonance: number;   // 0.5 to 15 (Q)
  envelopeAmount: number; // -1.0 to +1.0
  keyTracking: number; // 0 to 1
}

export interface LfoParams {
  enabled: boolean;
  waveform: LfoWaveform;
  rate: number;        // 0.1Hz to 20Hz
  depth: number;       // 0 to 1
  target: LfoTarget;
  tempoSync: boolean;
  syncDivision: string; // '1/4', '1/8', '1/16', etc.
}

export interface ChorusParams {
  enabled: boolean;
  rate: number;        // 0.1Hz to 5Hz
  depth: number;       // 0 to 1
  mix: number;         // 0 to 1
  spread: number;      // 0 to 1
}

export interface DelayParams {
  enabled: boolean;
  time: number;        // 0.05 to 1.5s
  feedback: number;    // 0 to 0.85
  mix: number;         // 0 to 1
  tempoSync: boolean;
  division: string;    // '1/4', '1/8', '1/8d', '1/16'
  pingPong: boolean;
}

export interface ReverbParams {
  enabled: boolean;
  size: number;        // 0.1 to 1.0 (decay length)
  damping: number;     // 0 to 1 (high frequency absorption)
  mix: number;         // 0 to 1
  predelay: number;    // 0 to 0.1s
}

export interface SaturationParams {
  enabled: boolean;
  drive: number;       // 0 to 1 (gain into curve)
  color: number;       // 0 to 1 (tone balance)
  mix: number;         // 0 to 1
}

export interface MacroParams {
  warmth: number;      // 0 to 1
  brightness: number;  // 0 to 1
  bell: number;        // 0 to 1
  body: number;        // 0 to 1
  attack: number;      // 0 to 1
  decay: number;       // 0 to 1
  release: number;     // 0 to 1
  movement: number;    // 0 to 1
  chorus: number;      // 0 to 1
  reverb: number;      // 0 to 1
  delay: number;       // 0 to 1
  output: number;      // 0 to 1
}

export interface SoulKeysState {
  // Global & Performance
  masterVolume: number; // 0 to 1.2
  octaveShift: number;  // -2, -1, 0, 1, 2
  velocityCurve: VelocityCurveType;
  voiceMode: VoiceMode;
  glideTime: number;    // 0 to 0.5s
  sustainHold: boolean;
  
  // Macros
  macros: MacroParams;

  // Layer Mixer
  layerKeys: LayerParams;
  layerWarmth: LayerParams;
  layerPad: LayerParams;

  // Individual Engines
  electricKeys: ElectricKeysParams;
  warmKeys: WarmKeysParams;
  pad: PadParams;

  // Filter & Envelopes
  filter: FilterParams;
  ampEnvelope: EnvelopeParams;
  filterEnvelope: EnvelopeParams;

  // Modulation & Effects
  lfo: LfoParams;
  chorus: ChorusParams;
  delay: DelayParams;
  reverb: ReverbParams;
  saturation: SaturationParams;
}

export interface Preset {
  id: string;
  name: string;
  category: 'Electric' | 'Warm Keys' | 'Pads' | 'Soul' | 'Amapiano' | 'Atmospheric';
  author: string;
  description: string;
  tags: string[];
  state: SoulKeysState;
  favorite?: boolean;
}

// Harmony & Music Theory Types
export type RootNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type ScaleType =
  | 'Major'
  | 'Natural Minor'
  | 'Dorian'
  | 'Mixolydian'
  | 'Harmonic Minor'
  | 'Major Pentatonic'
  | 'Minor Pentatonic'
  | 'Blues'
  | 'Neo-Soul';

export type ChordType =
  | 'Major Triad'
  | 'Minor Triad'
  | 'Major 7th'
  | 'Minor 7th'
  | 'Dominant 7th'
  | 'Half-Diminished 7th'
  | 'Diminished 7th'
  | 'Major 9th'
  | 'Minor 9th'
  | 'Dominant 9th'
  | 'Minor 11th'
  | 'Suspended 4th'
  | 'Suspended 2nd'
  | 'Add 9'
  | '6/9 Soul'
  | 'Altered 7th';

export type ChordInversion = 'root' | '1st' | '2nd' | '3rd' | 'drop2';

export interface ChordDefinition {
  id: string;
  name: string;
  root: RootNote;
  type: ChordType;
  inversion: ChordInversion;
  octaveOffset: number;
  notes: number[]; // MIDI note numbers
  romanNumeral?: string;
  durationBeats?: number;
}

export interface ProgressionTemplate {
  id: string;
  title: string;
  genre: 'Amapiano' | 'Neo-Soul' | 'Gospel' | 'Afro-House' | 'R&B' | 'Gqom';
  key: RootNote;
  scale: ScaleType;
  bpm: number;
  description: string;
  chords: ChordDefinition[];
}
