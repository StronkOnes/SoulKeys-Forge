import { Preset, SoulKeysState } from '../audio/types';
import { DEFAULT_SOULKEYS_STATE } from './defaultState';

function createPreset(
  id: string,
  name: string,
  category: Preset['category'],
  description: string,
  tags: string[],
  overrides: Partial<SoulKeysState> = {}
): Preset {
  return {
    id,
    name,
    category,
    author: 'The Plugin Foundry',
    description,
    tags,
    state: {
      ...DEFAULT_SOULKEYS_STATE,
      ...overrides,
      macros: {
        ...DEFAULT_SOULKEYS_STATE.macros,
        ...(overrides.macros || {}),
      },
      layerKeys: {
        ...DEFAULT_SOULKEYS_STATE.layerKeys,
        ...(overrides.layerKeys || {}),
      },
      layerWarmth: {
        ...DEFAULT_SOULKEYS_STATE.layerWarmth,
        ...(overrides.layerWarmth || {}),
      },
      layerPad: {
        ...DEFAULT_SOULKEYS_STATE.layerPad,
        ...(overrides.layerPad || {}),
      },
      electricKeys: {
        ...DEFAULT_SOULKEYS_STATE.electricKeys,
        ...(overrides.electricKeys || {}),
      },
      warmKeys: {
        ...DEFAULT_SOULKEYS_STATE.warmKeys,
        ...(overrides.warmKeys || {}),
      },
      pad: {
        ...DEFAULT_SOULKEYS_STATE.pad,
        ...(overrides.pad || {}),
      },
      filter: {
        ...DEFAULT_SOULKEYS_STATE.filter,
        ...(overrides.filter || {}),
      },
      ampEnvelope: {
        ...DEFAULT_SOULKEYS_STATE.ampEnvelope,
        ...(overrides.ampEnvelope || {}),
      },
      filterEnvelope: {
        ...DEFAULT_SOULKEYS_STATE.filterEnvelope,
        ...(overrides.filterEnvelope || {}),
      },
      lfo: {
        ...DEFAULT_SOULKEYS_STATE.lfo,
        ...(overrides.lfo || {}),
      },
      chorus: {
        ...DEFAULT_SOULKEYS_STATE.chorus,
        ...(overrides.chorus || {}),
      },
      delay: {
        ...DEFAULT_SOULKEYS_STATE.delay,
        ...(overrides.delay || {}),
      },
      reverb: {
        ...DEFAULT_SOULKEYS_STATE.reverb,
        ...(overrides.reverb || {}),
      },
      saturation: {
        ...DEFAULT_SOULKEYS_STATE.saturation,
        ...(overrides.saturation || {}),
      },
    },
  };
}

export const FACTORY_PRESETS: Preset[] = [
  // ==========================================
  // --- 1. ELECTRIC KEYS CATEGORY (1-18) ---
  // ==========================================
  createPreset('warm-soul-keys', 'Warm Soul Keys', 'Soul', 'Signature vintage electric tine with rich low-mid body and smooth tape saturation.', ['Soul', 'R&B', 'Electric Keys', 'Classic'], {
    macros: { warmth: 0.7, brightness: 0.55, bell: 0.45, body: 0.75, attack: 0.05, decay: 0.65, release: 0.4, movement: 0.35, chorus: 0.35, reverb: 0.4, delay: 0.25, output: 0.85 },
    electricKeys: { bell: 0.45, tineRatio: 3.76, malletClick: 0.35, bodyTone: 0.78, decayTime: 3.2, velocitySensitivity: 0.85 },
    filter: { type: 'lowpass', cutoff: 5200, resonance: 1.5, envelopeAmount: 0.35, keyTracking: 0.65 },
    chorus: { enabled: true, rate: 0.85, depth: 0.45, mix: 0.35, spread: 0.8 },
  }),
  createPreset('velvet-electric-keys', 'Velvet Electric Keys', 'Electric', 'Deep, rounded tine tone with gentle mallet transients and velvety harmonic resonance.', ['Electric', 'Mellow', 'Warm', 'Neo-Soul'], {
    macros: { warmth: 0.82, brightness: 0.42, bell: 0.35, body: 0.85, attack: 0.04, decay: 0.60, release: 0.45, movement: 0.25, chorus: 0.45, reverb: 0.35, delay: 0.15, output: 0.85 },
    layerPad: { enabled: false, volume: 0, pan: 0, octave: 0, detune: 0, mute: true, solo: false },
    electricKeys: { bell: 0.32, tineRatio: 3.2, malletClick: 0.25, bodyTone: 0.88, decayTime: 2.8, velocitySensitivity: 0.80 },
    warmKeys: { waveformBlend: 0.2, warmSaturation: 0.55, filterOffset: -0.1, velocityBrightness: 0.6 },
    filter: { type: 'warm_ladder', cutoff: 3800, resonance: 1.8, envelopeAmount: 0.25, keyTracking: 0.5 },
    saturation: { enabled: true, drive: 0.45, color: 0.4, mix: 0.5 },
  }),
  createPreset('soft-bell-keys', 'Soft Bell Keys', 'Electric', 'Pitched crystalline chime with delicate mallet strike and shimmering acoustic decay.', ['Chime', 'Bell', 'Tine', 'Clean'], {
    macros: { warmth: 0.45, brightness: 0.75, bell: 0.80, body: 0.50, attack: 0.02, decay: 0.75, release: 0.50, movement: 0.40, chorus: 0.50, reverb: 0.55, delay: 0.35, output: 0.82 },
    electricKeys: { bell: 0.82, tineRatio: 5.4, malletClick: 0.55, bodyTone: 0.55, decayTime: 3.8, velocitySensitivity: 0.90 },
    filter: { type: 'lowpass', cutoff: 8200, resonance: 1.2, envelopeAmount: 0.45, keyTracking: 0.75 },
    chorus: { enabled: true, rate: 1.2, depth: 0.55, mix: 0.45, spread: 0.9 },
    reverb: { enabled: true, size: 0.75, damping: 0.25, mix: 0.45, predelay: 0.03 },
  }),
  createPreset('rounded-rhodes-inspired-keys', 'Rounded Rhodes-Inspired Keys', 'Electric', 'Authentic electro-mechanical tone with gentle tine bark at high velocity and stereo tremolo.', ['Rhodes', 'Vintage', 'Bark', 'Soul'], {
    macros: { warmth: 0.78, brightness: 0.52, bell: 0.50, body: 0.82, attack: 0.03, decay: 0.68, release: 0.42, movement: 0.65, chorus: 0.30, reverb: 0.35, delay: 0.20, output: 0.85 },
    layerPad: { enabled: false, volume: 0, pan: 0, octave: 0, detune: 0, mute: true, solo: false },
    electricKeys: { bell: 0.52, tineRatio: 3.82, malletClick: 0.42, bodyTone: 0.82, decayTime: 3.0, velocitySensitivity: 0.92 },
    lfo: { enabled: true, waveform: 'sine', rate: 4.2, depth: 0.45, target: 'pan', tempoSync: false, syncDivision: '1/8' },
    saturation: { enabled: true, drive: 0.40, color: 0.6, mix: 0.48 },
  }),
  createPreset('dark-electric-keys', 'Dark Electric Keys', 'Electric', 'Filtered top end with deep woody body resonances, dark overtones, and subtle overdrive.', ['Dark', 'Woody', 'Deep', 'Filtered'], {
    macros: { warmth: 0.88, brightness: 0.30, bell: 0.20, body: 0.92, attack: 0.05, decay: 0.58, release: 0.40, movement: 0.25, chorus: 0.32, reverb: 0.35, delay: 0.20, output: 0.86 },
    filter: { type: 'lowpass', cutoff: 2600, resonance: 1.8, envelopeAmount: 0.2, keyTracking: 0.5 },
    electricKeys: { bell: 0.22, tineRatio: 2.7, malletClick: 0.25, bodyTone: 0.92, decayTime: 2.6, velocitySensitivity: 0.75 },
    saturation: { enabled: true, drive: 0.55, color: 0.3, mix: 0.55 },
  }),
  createPreset('smooth-chorus-keys', 'Smooth Chorus Keys', 'Electric', 'Dimension chorus modulating warm vintage tines with expansive 80s/90s R&B shimmer.', ['Chorus', 'Smooth', 'R&B', '80s', '90s'], {
    macros: { warmth: 0.72, brightness: 0.62, bell: 0.55, body: 0.75, attack: 0.04, decay: 0.68, release: 0.48, movement: 0.65, chorus: 0.75, reverb: 0.42, delay: 0.25, output: 0.84 },
    chorus: { enabled: true, rate: 1.1, depth: 0.70, mix: 0.62, spread: 0.95 },
    electricKeys: { bell: 0.55, tineRatio: 3.9, malletClick: 0.38, bodyTone: 0.75, decayTime: 3.2, velocitySensitivity: 0.85 },
    lfo: { enabled: true, waveform: 'sine', rate: 1.8, depth: 0.3, target: 'pitch', tempoSync: false, syncDivision: '1/8' },
  }),
  createPreset('dyno-my-bell', 'Dyno-My Bell Piano', 'Electric', 'Famous 80s modified electric piano tone with ultra-bright bell modification and stereo chorus.', ['Dyno', '80s', 'Bell', 'LA Studio'], {
    macros: { warmth: 0.52, brightness: 0.82, bell: 0.88, body: 0.65, attack: 0.02, decay: 0.72, release: 0.45, movement: 0.55, chorus: 0.68, reverb: 0.45, delay: 0.28, output: 0.84 },
    electricKeys: { bell: 0.88, tineRatio: 4.25, malletClick: 0.62, bodyTone: 0.68, decayTime: 3.4, velocitySensitivity: 0.95 },
    chorus: { enabled: true, rate: 1.3, depth: 0.65, mix: 0.58, spread: 0.9 },
  }),
  createPreset('suitcase-73-tremolo', 'Suitcase 73 Tremolo', 'Electric', 'Vintage 1973 suitcase cabinet tone with authentic optical ping-pong tremolo pulsing.', ['Suitcase', '73', 'Tremolo', 'Vintage'], {
    macros: { warmth: 0.80, brightness: 0.50, bell: 0.45, body: 0.85, attack: 0.03, decay: 0.65, release: 0.42, movement: 0.78, chorus: 0.25, reverb: 0.30, delay: 0.15, output: 0.86 },
    lfo: { enabled: true, waveform: 'sine', rate: 4.8, depth: 0.62, target: 'pan', tempoSync: false, syncDivision: '1/8' },
    electricKeys: { bell: 0.48, tineRatio: 3.65, malletClick: 0.40, bodyTone: 0.85, decayTime: 3.1, velocitySensitivity: 0.88 },
  }),
  createPreset('mk2-stage-warmth', 'Mk II Stage Warmth', 'Electric', '1980s stage model with balanced upper partials, percussive hammer strike, and analog warmth.', ['Mk II', 'Stage', 'Warmth', 'Classic'], {
    macros: { warmth: 0.75, brightness: 0.58, bell: 0.48, body: 0.78, attack: 0.03, decay: 0.62, release: 0.38, movement: 0.30, chorus: 0.35, reverb: 0.32, delay: 0.20, output: 0.85 },
    electricKeys: { bell: 0.48, tineRatio: 3.72, malletClick: 0.48, bodyTone: 0.80, decayTime: 2.9, velocitySensitivity: 0.86 },
  }),
  createPreset('wurli-reed-punch', 'Wurli Reed Punch', 'Electric', 'Electro-static reed character with biting midrange punch and natural aggressive bark on hard velocity.', ['Wurli', 'Reed', 'Bite', 'Funk'], {
    macros: { warmth: 0.65, brightness: 0.68, bell: 0.35, body: 0.72, attack: 0.02, decay: 0.55, release: 0.32, movement: 0.35, chorus: 0.30, reverb: 0.25, delay: 0.20, output: 0.88 },
    layerKeys: { enabled: true, volume: 0.90, pan: 0, octave: 0, detune: 0, mute: false, solo: false },
    layerWarmth: { enabled: true, volume: 0.45, pan: 0, octave: 0, detune: 2, mute: false, solo: false },
    warmKeys: { waveformBlend: 0.55, warmSaturation: 0.65, filterOffset: 0.2, velocityBrightness: 0.85 },
    saturation: { enabled: true, drive: 0.52, color: 0.65, mix: 0.50 },
  }),
  createPreset('pure-tine-acoustic', 'Pure Tine Acoustic', 'Electric', 'Unprocessed studio direct box capture with clean tines and intimate dry response.', ['Pure', 'Direct', 'Acoustic', 'Clean'], {
    macros: { warmth: 0.60, brightness: 0.60, bell: 0.42, body: 0.70, attack: 0.02, decay: 0.60, release: 0.35, movement: 0.10, chorus: 0.10, reverb: 0.15, delay: 0.05, output: 0.88 },
    chorus: { enabled: false, rate: 0.5, depth: 0.2, mix: 0, spread: 0.5 },
    reverb: { enabled: true, size: 0.35, damping: 0.5, mix: 0.18, predelay: 0.01 },
  }),
  createPreset('analog-chorus-80s', 'Analog Chorus 80s Tines', 'Electric', 'Lush bucket-brigade chorus coloring vibrant electric tines with classic pop shimmer.', ['BBD', '80s', 'Chorus', 'Pop'], {
    macros: { warmth: 0.68, brightness: 0.70, bell: 0.62, body: 0.72, attack: 0.03, decay: 0.68, release: 0.45, movement: 0.70, chorus: 0.82, reverb: 0.48, delay: 0.30, output: 0.84 },
    chorus: { enabled: true, rate: 1.45, depth: 0.78, mix: 0.68, spread: 0.95 },
  }),
  createPreset('glass-chime-tine', 'Glass Chime Tine', 'Electric', 'High metallic partial emphasis sounding like crystal glass tines with long decay shimmer.', ['Glass', 'Crystal', 'Chime', 'Shimmer'], {
    macros: { warmth: 0.40, brightness: 0.85, bell: 0.92, body: 0.48, attack: 0.02, decay: 0.78, release: 0.55, movement: 0.45, chorus: 0.60, reverb: 0.65, delay: 0.40, output: 0.80 },
    electricKeys: { bell: 0.94, tineRatio: 6.2, malletClick: 0.58, bodyTone: 0.48, decayTime: 4.2, velocitySensitivity: 0.92 },
  }),
  createPreset('vintage-bark-soul', 'Vintage Bark Soul', 'Electric', 'Dynamic overdrive that opens up with rich mechanical growl on expressive high-velocity chords.', ['Growl', 'Bark', 'Overdrive', 'Dynamic'], {
    macros: { warmth: 0.84, brightness: 0.58, bell: 0.52, body: 0.86, attack: 0.02, decay: 0.62, release: 0.40, movement: 0.28, chorus: 0.32, reverb: 0.35, delay: 0.18, output: 0.86 },
    saturation: { enabled: true, drive: 0.68, color: 0.55, mix: 0.58 },
  }),
  createPreset('underwater-rhodes', 'Underwater Muted Tines', 'Electric', 'Heavily low-pass filtered tines submerged in warm chorus and cavernous reverb.', ['Underwater', 'Submerged', 'Muted', 'Dream'], {
    macros: { warmth: 0.90, brightness: 0.25, bell: 0.18, body: 0.92, attack: 0.08, decay: 0.70, release: 0.65, movement: 0.50, chorus: 0.65, reverb: 0.75, delay: 0.42, output: 0.80 },
    filter: { type: 'lowpass', cutoff: 1950, resonance: 1.9, envelopeAmount: 0.15, keyTracking: 0.4 },
  }),
  createPreset('stereo-vibrato-rhodes', 'Stereo Vibrato Rhodes', 'Electric', 'True pitch vibrato modulation on vintage tines for woozy psychedelic neo-soul.', ['Vibrato', 'Pitch', 'Woozy', 'Psychedelic'], {
    macros: { warmth: 0.75, brightness: 0.55, bell: 0.45, body: 0.80, attack: 0.03, decay: 0.65, release: 0.42, movement: 0.82, chorus: 0.20, reverb: 0.38, delay: 0.22, output: 0.85 },
    lfo: { enabled: true, waveform: 'sine', rate: 3.8, depth: 0.45, target: 'pitch', tempoSync: false, syncDivision: '1/8' },
  }),
  createPreset('tine-lead-solo', 'Expressive Tine Lead', 'Electric', 'Focused, singing single-note electric tine response dialed for lyrical keyboard solos.', ['Lead', 'Solo', 'Singing', 'Mono'], {
    voiceMode: 'mono',
    glideTime: 0.06,
    macros: { warmth: 0.70, brightness: 0.68, bell: 0.60, body: 0.75, attack: 0.015, decay: 0.70, release: 0.38, movement: 0.40, chorus: 0.42, reverb: 0.45, delay: 0.35, output: 0.86 },
    delay: { enabled: true, time: 0.35, feedback: 0.45, mix: 0.32, tempoSync: true, division: '1/8d', pingPong: true },
  }),
  createPreset('classic-stage-reverb', 'Grand Hall Stage Tines', 'Electric', 'Electric keys ringing out into an opulent concert hall with natural decay.', ['Hall', 'Concert', 'Grand', 'Space'], {
    macros: { warmth: 0.72, brightness: 0.60, bell: 0.50, body: 0.78, attack: 0.04, decay: 0.75, release: 0.60, movement: 0.35, chorus: 0.38, reverb: 0.78, delay: 0.25, output: 0.82 },
    reverb: { enabled: true, size: 0.88, damping: 0.28, mix: 0.55, predelay: 0.04 },
  }),

  // ==========================================
  // --- 2. WARM KEYS CATEGORY (19-34) ---
  // ==========================================
  createPreset('gospel-warmth', 'Gospel Warmth', 'Warm Keys', 'Rich harmonic presence and expressive dynamic curve for gospel praise chords and runs.', ['Gospel', 'Dynamic', 'Rich', 'Acoustic Touch'], {
    macros: { warmth: 0.80, brightness: 0.64, bell: 0.58, body: 0.82, attack: 0.02, decay: 0.72, release: 0.48, movement: 0.30, chorus: 0.40, reverb: 0.45, delay: 0.22, output: 0.86 },
    velocityCurve: 'soft',
    electricKeys: { bell: 0.56, tineRatio: 4.1, malletClick: 0.45, bodyTone: 0.82, decayTime: 3.5, velocitySensitivity: 0.95 },
    warmKeys: { waveformBlend: 0.45, warmSaturation: 0.48, filterOffset: 0.25, velocityBrightness: 0.85 },
    filter: { type: 'lowpass', cutoff: 5800, resonance: 1.6, envelopeAmount: 0.42, keyTracking: 0.70 },
  }),
  createPreset('minimal-piano-layer', 'Minimal Piano Layer', 'Warm Keys', 'Puristic key strike with understated attack, clean fundamental, and natural acoustic decay.', ['Minimal', 'Clean', 'Piano-like', 'Acoustic'], {
    macros: { warmth: 0.58, brightness: 0.58, bell: 0.35, body: 0.70, attack: 0.01, decay: 0.55, release: 0.35, movement: 0.15, chorus: 0.15, reverb: 0.30, delay: 0.10, output: 0.86 },
    layerPad: { enabled: false, volume: 0, pan: 0, octave: 0, detune: 0, mute: true, solo: false },
    electricKeys: { bell: 0.30, tineRatio: 2.8, malletClick: 0.50, bodyTone: 0.85, decayTime: 2.4, velocitySensitivity: 0.90 },
    warmKeys: { waveformBlend: 0.15, warmSaturation: 0.25, filterOffset: 0.05, velocityBrightness: 0.70 },
    chorus: { enabled: false, rate: 0.6, depth: 0.2, mix: 0.15, spread: 0.5 },
  }),
  createPreset('wide-warm-layer', 'Wide Warm Layer', 'Warm Keys', 'Full tri-engine stereo stack: warm body, resonant bell, and ultra-wide detuned pad chorus.', ['Wide', 'Stereo', 'Lush', 'Masterpiece'], {
    macros: { warmth: 0.85, brightness: 0.65, bell: 0.55, body: 0.88, attack: 0.04, decay: 0.75, release: 0.65, movement: 0.50, chorus: 0.65, reverb: 0.55, delay: 0.30, output: 0.85 },
    layerKeys: { enabled: true, volume: 0.82, pan: -0.15, octave: 0, detune: 0, mute: false, solo: false },
    layerWarmth: { enabled: true, volume: 0.78, pan: 0.15, octave: 0, detune: 5, mute: false, solo: false },
    layerPad: { enabled: true, volume: 0.70, pan: 0, octave: 0, detune: -8, mute: false, solo: false },
    pad: { waveType: 'sawtooth', stereoSpread: 1.0, detuneAmount: 20, attackTime: 0.4, releaseTime: 2.4 },
    chorus: { enabled: true, rate: 0.95, depth: 0.65, mix: 0.50, spread: 0.95 },
    reverb: { enabled: true, size: 0.72, damping: 0.35, mix: 0.45, predelay: 0.025 },
  }),
  createPreset('buttery-chords-warmth', 'Buttery Warm Chords', 'Warm Keys', 'Silky, mellow low-mid frequencies that wrap around vocal arrangements with gentle warmth.', ['Butter', 'Chords', 'Silky', 'Mellow'], {
    macros: { warmth: 0.88, brightness: 0.45, bell: 0.32, body: 0.90, attack: 0.03, decay: 0.65, release: 0.48, movement: 0.28, chorus: 0.35, reverb: 0.38, delay: 0.18, output: 0.86 },
    warmKeys: { waveformBlend: 0.25, warmSaturation: 0.62, filterOffset: 0.0, velocityBrightness: 0.65 },
  }),
  createPreset('analog-tape-warmth', 'Tape Saturated Keys', 'Warm Keys', 'Cassette-style tape head saturation with subtle high-end rolloff and low-end thickness.', ['Tape', 'Cassette', 'Saturated', 'Vintage'], {
    macros: { warmth: 0.92, brightness: 0.38, bell: 0.25, body: 0.92, attack: 0.05, decay: 0.60, release: 0.42, movement: 0.45, chorus: 0.40, reverb: 0.32, delay: 0.22, output: 0.85 },
    saturation: { enabled: true, drive: 0.72, color: 0.42, mix: 0.65 },
  }),
  createPreset('lofi-vinyl-mellow', 'Lo-Fi Vinyl Keys', 'Warm Keys', 'Detuned nostalgic keyboard warmth with rounded transients and gentle flutter movement.', ['Lo-Fi', 'Vinyl', 'Nostalgia', 'Chill'], {
    macros: { warmth: 0.82, brightness: 0.42, bell: 0.30, body: 0.82, attack: 0.06, decay: 0.62, release: 0.50, movement: 0.65, chorus: 0.45, reverb: 0.48, delay: 0.30, output: 0.84 },
    lfo: { enabled: true, waveform: 'triangle', rate: 0.85, depth: 0.38, target: 'pitch', tempoSync: false, syncDivision: '1/4' },
  }),
  createPreset('golden-hour-warmth', 'Golden Hour Keys', 'Warm Keys', 'Uplifting warm keyboard bed with resonant filter sweep and radiant upper overtones.', ['Golden Hour', 'Radiant', 'Sunset', 'Warm'], {
    macros: { warmth: 0.78, brightness: 0.62, bell: 0.50, body: 0.80, attack: 0.04, decay: 0.70, release: 0.55, movement: 0.42, chorus: 0.48, reverb: 0.52, delay: 0.28, output: 0.85 },
    filter: { type: 'warm_ladder', cutoff: 5200, resonance: 2.2, envelopeAmount: 0.38, keyTracking: 0.65 },
  }),
  createPreset('church-pew-warmth', 'Church Pew Keys', 'Warm Keys', 'Resonant acoustic body mimicking wooden church acoustics and reverent chord playing.', ['Church', 'Worship', 'Wooden', 'Acoustic'], {
    macros: { warmth: 0.85, brightness: 0.52, bell: 0.40, body: 0.88, attack: 0.03, decay: 0.72, release: 0.52, movement: 0.25, chorus: 0.30, reverb: 0.58, delay: 0.20, output: 0.85 },
    reverb: { enabled: true, size: 0.82, damping: 0.45, mix: 0.48, predelay: 0.03 },
  }),
  createPreset('midnight-candle-keys', 'Midnight Candle Keys', 'Warm Keys', 'Intimate, close-mic aesthetic with very low mechanical noise and deep emotional tone.', ['Candlelight', 'Intimate', 'Close', 'Late Night'], {
    macros: { warmth: 0.88, brightness: 0.35, bell: 0.22, body: 0.90, attack: 0.05, decay: 0.58, release: 0.45, movement: 0.20, chorus: 0.28, reverb: 0.38, delay: 0.15, output: 0.86 },
  }),
  createPreset('honeycomb-keys', 'Honeycomb Harmonic Bed', 'Warm Keys', 'Thick, sweet harmonic distortion on dual warm oscillators with sustained chord presence.', ['Honey', 'Thick', 'Harmonics', 'Sweet'], {
    macros: { warmth: 0.85, brightness: 0.55, bell: 0.42, body: 0.88, attack: 0.04, decay: 0.68, release: 0.58, movement: 0.38, chorus: 0.50, reverb: 0.42, delay: 0.25, output: 0.85 },
    warmKeys: { waveformBlend: 0.40, warmSaturation: 0.58, filterOffset: 0.15, velocityBrightness: 0.75 },
  }),
  createPreset('wooden-felt-warmth', 'Wooden Felt Keys', 'Warm Keys', 'Soft felt-dampened keyboard hammers producing pure fundamental warmth without harsh treble.', ['Felt', 'Wood', 'Dampened', 'Pure'], {
    macros: { warmth: 0.90, brightness: 0.30, bell: 0.15, body: 0.94, attack: 0.02, decay: 0.50, release: 0.32, movement: 0.15, chorus: 0.15, reverb: 0.30, delay: 0.10, output: 0.88 },
    electricKeys: { bell: 0.15, tineRatio: 2.2, malletClick: 0.20, bodyTone: 0.95, decayTime: 2.2, velocitySensitivity: 0.75 },
  }),
  createPreset('warm-organ-keys-stack', 'Warm Organ-Keys Stack', 'Warm Keys', 'Organ-inspired harmonic richness blended into velocity-sensitive electric keyboard.', ['Organ', 'Stack', 'Gospel', 'Soul'], {
    macros: { warmth: 0.78, brightness: 0.65, bell: 0.45, body: 0.82, attack: 0.015, decay: 0.65, release: 0.40, movement: 0.35, chorus: 0.45, reverb: 0.40, delay: 0.25, output: 0.86 },
    warmKeys: { waveformBlend: 0.65, warmSaturation: 0.50, filterOffset: 0.25, velocityBrightness: 0.82 },
  }),
  createPreset('sun-drenched-tines', 'Sun-Drenched Tines', 'Warm Keys', 'Airy, summery keyboard tone with warm tape color and shimmering upper mid presence.', ['Summer', 'Sun', 'Airy', 'Warm'], {
    macros: { warmth: 0.72, brightness: 0.68, bell: 0.58, body: 0.75, attack: 0.03, decay: 0.70, release: 0.50, movement: 0.45, chorus: 0.55, reverb: 0.48, delay: 0.30, output: 0.84 },
  }),
  createPreset('cozy-living-room', 'Cozy Living Room Keys', 'Warm Keys', 'Natural room acoustics and inviting warmth made for songwriting and vocal comping.', ['Cozy', 'Room', 'Songwriting', 'Natural'], {
    macros: { warmth: 0.80, brightness: 0.50, bell: 0.38, body: 0.82, attack: 0.03, decay: 0.62, release: 0.42, movement: 0.20, chorus: 0.25, reverb: 0.35, delay: 0.12, output: 0.86 },
  }),
  createPreset('amber-glow-keys', 'Amber Glow Keys', 'Warm Keys', 'Tuned specifically for amber tube character: dense 2nd order harmonic warmth and round decay.', ['Amber', 'Tube', 'Harmonics', 'Glow'], {
    macros: { warmth: 0.86, brightness: 0.52, bell: 0.44, body: 0.86, attack: 0.04, decay: 0.68, release: 0.48, movement: 0.32, chorus: 0.38, reverb: 0.40, delay: 0.22, output: 0.85 },
    saturation: { enabled: true, drive: 0.58, color: 0.48, mix: 0.52 },
  }),
  createPreset('mellow-rhodes-duet', 'Mellow Rhodes Duet', 'Warm Keys', 'Two detuned warm electric layers singing in close stereo unison.', ['Duet', 'Unison', 'Stereo', 'Mellow'], {
    macros: { warmth: 0.82, brightness: 0.55, bell: 0.46, body: 0.84, attack: 0.03, decay: 0.66, release: 0.46, movement: 0.48, chorus: 0.62, reverb: 0.44, delay: 0.25, output: 0.84 },
    layerWarmth: { enabled: true, volume: 0.78, pan: 0.25, octave: 0, detune: 6, mute: false, solo: false },
    layerKeys: { enabled: true, volume: 0.82, pan: -0.25, octave: 0, detune: -6, mute: false, solo: false },
  }),

  // ==========================================
  // --- 3. SOUL & NEO-SOUL (35-52) ---
  // ==========================================
  createPreset('late-night-soul', 'Late-Night Soul', 'Soul', 'Moody, intimate, dark keyboard character tailored for sultry neo-soul voicings.', ['Neo-Soul', 'Dark', 'Intimate', 'Slow'], {
    macros: { warmth: 0.88, brightness: 0.38, bell: 0.30, body: 0.88, attack: 0.06, decay: 0.62, release: 0.50, movement: 0.32, chorus: 0.38, reverb: 0.45, delay: 0.25, output: 0.84 },
    filter: { type: 'warm_ladder', cutoff: 3100, resonance: 1.4, envelopeAmount: 0.22, keyTracking: 0.55 },
    electricKeys: { bell: 0.28, tineRatio: 2.9, malletClick: 0.28, bodyTone: 0.90, decayTime: 2.9, velocitySensitivity: 0.78 },
    reverb: { enabled: true, size: 0.68, damping: 0.55, mix: 0.42, predelay: 0.02 },
  }),
  createPreset('deep-house-keys', 'Deep House Keys', 'Soul', 'Punchy key strike, deep warm organ-esque harmonics, and syncopated tape delay for club grooves.', ['Deep House', 'Afro-House', 'Punchy', 'Groove'], {
    macros: { warmth: 0.78, brightness: 0.65, bell: 0.42, body: 0.80, attack: 0.015, decay: 0.58, release: 0.35, movement: 0.30, chorus: 0.35, reverb: 0.35, delay: 0.40, output: 0.86 },
    warmKeys: { waveformBlend: 0.6, warmSaturation: 0.5, filterOffset: 0.2, velocityBrightness: 0.8 },
    filter: { type: 'lowpass', cutoff: 4600, resonance: 2.4, envelopeAmount: 0.48, keyTracking: 0.8 },
    delay: { enabled: true, time: 0.32, feedback: 0.42, mix: 0.32, tempoSync: true, division: '1/8', pingPong: true },
  }),
  createPreset('dangelo-voodoo-keys', "D'Angelo Voodoo Keys", 'Soul', 'Loose, laid-back vintage suitcase tone made for behind-the-beat chord changes.', ['D\'Angelo', 'Voodoo', 'Behind The Beat', 'Soul'], {
    macros: { warmth: 0.86, brightness: 0.48, bell: 0.40, body: 0.88, attack: 0.04, decay: 0.64, release: 0.44, movement: 0.52, chorus: 0.38, reverb: 0.35, delay: 0.20, output: 0.85 },
    saturation: { enabled: true, drive: 0.52, color: 0.50, mix: 0.55 },
    lfo: { enabled: true, waveform: 'sine', rate: 2.4, depth: 0.35, target: 'pan', tempoSync: false, syncDivision: '1/8' },
  }),
  createPreset('erykah-tea-keys', 'Baduizm Herbal Keys', 'Soul', 'Earthy, warm keyboard tone with acoustic roundness and subtle woody hammer clicks.', ['Baduizm', 'Earthy', 'Organic', 'Herbal'], {
    macros: { warmth: 0.84, brightness: 0.45, bell: 0.36, body: 0.86, attack: 0.05, decay: 0.65, release: 0.48, movement: 0.30, chorus: 0.32, reverb: 0.40, delay: 0.22, output: 0.85 },
    electricKeys: { bell: 0.36, tineRatio: 3.1, malletClick: 0.42, bodyTone: 0.88, decayTime: 3.0, velocitySensitivity: 0.82 },
  }),
  createPreset('motown-soul-vibes', 'Motown Studio A Keys', 'Soul', '60s Detroit studio vibe with round tube preamp coloration and tight low-mid punch.', ['Motown', 'Detroit', '60s', 'Classic Soul'], {
    macros: { warmth: 0.80, brightness: 0.58, bell: 0.45, body: 0.82, attack: 0.02, decay: 0.58, release: 0.35, movement: 0.25, chorus: 0.28, reverb: 0.30, delay: 0.15, output: 0.86 },
    saturation: { enabled: true, drive: 0.48, color: 0.62, mix: 0.45 },
  }),
  createPreset('silk-rhodes-ballad', 'Silk Rhodes Ballad', 'Soul', 'Velvety electric piano voicing with slow harmonic blooming and delicate high bell.', ['Silk', 'Ballad', 'Velvet', 'R&B'], {
    macros: { warmth: 0.80, brightness: 0.55, bell: 0.52, body: 0.82, attack: 0.04, decay: 0.72, release: 0.55, movement: 0.42, chorus: 0.45, reverb: 0.52, delay: 0.28, output: 0.84 },
  }),
  createPreset('curtis-mayfield-soul', 'Superfly Curtis Soul', 'Soul', 'Crisp 70s soul keys with punchy transient bite and wah-like resonant filter touch.', ['Curtis', '70s', 'Superfly', 'Wah Touch'], {
    macros: { warmth: 0.72, brightness: 0.68, bell: 0.55, body: 0.75, attack: 0.02, decay: 0.60, release: 0.38, movement: 0.45, chorus: 0.35, reverb: 0.32, delay: 0.22, output: 0.86 },
    filter: { type: 'lowpass', cutoff: 5600, resonance: 2.8, envelopeAmount: 0.52, keyTracking: 0.75 },
  }),
  createPreset('la-smooth-jazz-soul', 'LA Smooth Jazz Soul', 'Soul', 'Polished, crystal-clear studio electric keys with dimension chorus and hi-fi sheen.', ['Smooth Jazz', 'LA Studio', 'Hi-Fi', 'Polished'], {
    macros: { warmth: 0.65, brightness: 0.75, bell: 0.72, body: 0.70, attack: 0.025, decay: 0.70, release: 0.48, movement: 0.55, chorus: 0.65, reverb: 0.48, delay: 0.32, output: 0.84 },
    chorus: { enabled: true, rate: 1.15, depth: 0.65, mix: 0.52, spread: 0.95 },
  }),
  createPreset('chicago-gospel-soul', 'Chicago Gospel Soul', 'Soul', 'Heavy gospel praise organ/keys blend with rich bottom end and expressive runs.', ['Chicago', 'Gospel', 'Praise', 'Heavy'], {
    macros: { warmth: 0.85, brightness: 0.62, bell: 0.52, body: 0.88, attack: 0.02, decay: 0.72, release: 0.50, movement: 0.32, chorus: 0.42, reverb: 0.45, delay: 0.24, output: 0.85 },
  }),
  createPreset('soul-quarians-groove', 'Soulquarians Groove', 'Soul', 'Raw electric piano with tape wow/flutter emulation and tight percussive decay.', ['Soulquarians', 'Raw', 'Tape Flutter', 'Groove'], {
    macros: { warmth: 0.85, brightness: 0.48, bell: 0.42, body: 0.86, attack: 0.03, decay: 0.58, release: 0.40, movement: 0.60, chorus: 0.38, reverb: 0.34, delay: 0.22, output: 0.85 },
    lfo: { enabled: true, waveform: 'triangle', rate: 1.1, depth: 0.42, target: 'pitch', tempoSync: false, syncDivision: '1/8' },
  }),
  createPreset('marvin-gaye-room', 'What\'s Going On Room', 'Soul', 'Natural room reverberation, warm woody low-end, and vintage microphone coloration.', ['Marvin', 'Room', 'Vintage Mic', 'Classic'], {
    macros: { warmth: 0.82, brightness: 0.50, bell: 0.40, body: 0.84, attack: 0.03, decay: 0.62, release: 0.44, movement: 0.22, chorus: 0.25, reverb: 0.42, delay: 0.15, output: 0.86 },
  }),
  createPreset('bill-withers-warmth', 'Just The Two Of Us Keys', 'Soul', 'Legendary smooth electro-mechanical tine sound from Ralph MacDonald & Bill Withers sessions.', ['Withers', 'Smooth', 'Legendary', '70s'], {
    macros: { warmth: 0.78, brightness: 0.60, bell: 0.52, body: 0.80, attack: 0.03, decay: 0.66, release: 0.45, movement: 0.50, chorus: 0.45, reverb: 0.38, delay: 0.22, output: 0.85 },
  }),
  createPreset('stevie-wonder-wonderland', 'Stevie Wonder Clav-Keys', 'Soul', 'Funky, percussive dynamic response with expressive bite and subtle autowah color.', ['Stevie', 'Wonder', 'Funk', 'Percussive'], {
    macros: { warmth: 0.70, brightness: 0.72, bell: 0.48, body: 0.75, attack: 0.01, decay: 0.52, release: 0.30, movement: 0.45, chorus: 0.35, reverb: 0.30, delay: 0.25, output: 0.88 },
    electricKeys: { bell: 0.48, tineRatio: 3.8, malletClick: 0.72, bodyTone: 0.78, decayTime: 1.8, velocitySensitivity: 0.96 },
  }),
  createPreset('slow-burn-r-b', 'Slow Burn R&B Bed', 'Soul', 'Sultry low-frequency bed with gentle upper tine sparkle, perfect for slow-jam grooves.', ['Slow Burn', 'R&B', 'Sultry', 'Bed'], {
    macros: { warmth: 0.88, brightness: 0.46, bell: 0.38, body: 0.88, attack: 0.05, decay: 0.68, release: 0.55, movement: 0.35, chorus: 0.42, reverb: 0.48, delay: 0.26, output: 0.84 },
  }),
  createPreset('h-e-r-acoustic-electric', 'H.E.R. Modern Soul Keys', 'Soul', 'Modern R&B keys blending intimate close-mic acoustic body with pristine stereo chorus.', ['Modern Soul', 'H.E.R.', 'R&B', 'Clean'], {
    macros: { warmth: 0.76, brightness: 0.62, bell: 0.55, body: 0.80, attack: 0.03, decay: 0.68, release: 0.48, movement: 0.45, chorus: 0.52, reverb: 0.46, delay: 0.28, output: 0.85 },
  }),
  createPreset('summer-walker-bedroom', 'Bedroom Soul Tape Keys', 'Soul', 'Lo-fi filtered keyboard tone dripping with tape warmth and melancholic release tails.', ['Summer Walker', 'Bedroom', 'Melancholy', 'Tape'], {
    macros: { warmth: 0.90, brightness: 0.35, bell: 0.25, body: 0.90, attack: 0.06, decay: 0.62, release: 0.58, movement: 0.42, chorus: 0.40, reverb: 0.55, delay: 0.32, output: 0.84 },
    filter: { type: 'lowpass', cutoff: 2800, resonance: 1.6, envelopeAmount: 0.18, keyTracking: 0.5 },
  }),
  createPreset('daniel-caesar-sweetness', 'Daniel Caesar Choir Keys', 'Soul', 'Warm soulful chords supporting ethereal vocal-like pad sustains in the high register.', ['Caesar', 'Sweet', 'Choir Keys', 'Soul'], {
    macros: { warmth: 0.80, brightness: 0.60, bell: 0.48, body: 0.82, attack: 0.06, decay: 0.75, release: 0.65, movement: 0.45, chorus: 0.50, reverb: 0.60, delay: 0.30, output: 0.84 },
    layerPad: { enabled: true, volume: 0.65, pan: 0, octave: 0, detune: 6, mute: false, solo: false },
  }),
  createPreset('jazmine-sullivan-depth', 'Jazmine Sullivan Power Bed', 'Soul', 'Commanding dynamic range with heavy fundamental weight and silky treble release.', ['Power', 'Vocal Bed', 'Dynamic', 'Heavy'], {
    macros: { warmth: 0.84, brightness: 0.58, bell: 0.46, body: 0.88, attack: 0.03, decay: 0.70, release: 0.50, movement: 0.32, chorus: 0.38, reverb: 0.45, delay: 0.22, output: 0.86 },
  }),

  // ==========================================
  // --- 4. AMAPIANO & AFRO CATEGORY (53-70) ---
  // ==========================================
  createPreset('deep-chord-bed', 'Deep Chord Bed', 'Amapiano', 'Massive low-end foundation paired with warm electric keys and sustained Afro pad bed.', ['Amapiano', 'Afro-House', 'Chords', 'Deep'], {
    macros: { warmth: 0.85, brightness: 0.48, bell: 0.38, body: 0.90, attack: 0.08, decay: 0.70, release: 0.55, movement: 0.30, chorus: 0.30, reverb: 0.42, delay: 0.28, output: 0.88 },
    layerKeys: { enabled: true, volume: 0.80, pan: -0.05, octave: 0, detune: 0, mute: false, solo: false },
    layerWarmth: { enabled: true, volume: 0.75, pan: 0.05, octave: 0, detune: 4, mute: false, solo: false },
    layerPad: { enabled: true, volume: 0.65, pan: 0, octave: -1, detune: -6, mute: false, solo: false },
    pad: { waveType: 'triangle', stereoSpread: 0.85, detuneAmount: 14, attackTime: 0.35, releaseTime: 2.2 },
    filter: { type: 'lowpass', cutoff: 4200, resonance: 2.1, envelopeAmount: 0.4, keyTracking: 0.6 },
  }),
  createPreset('muted-keys', 'Muted Keys', 'Amapiano', 'Percussive, tightly damped keystrokes ideal for syncopated Amapiano comps and bouncy chord stabs.', ['Amapiano', 'Pluck', 'Muted', 'Stabs'], {
    macros: { warmth: 0.75, brightness: 0.55, bell: 0.40, body: 0.75, attack: 0.005, decay: 0.32, release: 0.15, movement: 0.15, chorus: 0.25, reverb: 0.28, delay: 0.35, output: 0.88 },
    layerPad: { enabled: false, volume: 0, pan: 0, octave: 0, detune: 0, mute: true, solo: false },
    electricKeys: { bell: 0.42, tineRatio: 3.5, malletClick: 0.68, bodyTone: 0.82, decayTime: 1.1, velocitySensitivity: 0.92 },
    ampEnvelope: { attack: 0.005, decay: 0.9, sustain: 0.1, release: 0.22 },
    filter: { type: 'lowpass', cutoff: 3900, resonance: 2.2, envelopeAmount: 0.55, keyTracking: 0.75 },
    delay: { enabled: true, time: 0.25, feedback: 0.32, mix: 0.30, tempoSync: true, division: '1/16', pingPong: true },
  }),
  createPreset('amapiano-chord-bed', 'Amapiano Chord Bed', 'Amapiano', 'The quintessential soulful South African keys tone: warm bottom end, clear melodic tines, and lush airy release.', ['Amapiano', 'Private School', 'Soulful', 'Log Drum Companion'], {
    macros: { warmth: 0.82, brightness: 0.60, bell: 0.52, body: 0.85, attack: 0.03, decay: 0.68, release: 0.52, movement: 0.38, chorus: 0.42, reverb: 0.45, delay: 0.32, output: 0.86 },
    layerKeys: { enabled: true, volume: 0.88, pan: -0.05, octave: 0, detune: 0, mute: false, solo: false },
    layerWarmth: { enabled: true, volume: 0.70, pan: 0.05, octave: 0, detune: 4, mute: false, solo: false },
    layerPad: { enabled: true, volume: 0.55, pan: 0, octave: 0, detune: -6, mute: false, solo: false },
    electricKeys: { bell: 0.52, tineRatio: 3.8, malletClick: 0.45, bodyTone: 0.84, decayTime: 3.1, velocitySensitivity: 0.88 },
    filter: { type: 'lowpass', cutoff: 5100, resonance: 1.8, envelopeAmount: 0.38, keyTracking: 0.70 },
    delay: { enabled: true, time: 0.38, feedback: 0.35, mix: 0.28, tempoSync: true, division: '1/8d', pingPong: true },
  }),
  createPreset('private-school-bell-rhodes', 'Private School Bell Rhodes', 'Amapiano', 'High bell harmonics paired with low-mid body designed specifically for soulful Kelvin Momo / Kabza voicings.', ['Private School', 'Kelvin Momo', 'Bell Rhodes', 'Soul'], {
    macros: { warmth: 0.78, brightness: 0.72, bell: 0.75, body: 0.82, attack: 0.03, decay: 0.72, release: 0.55, movement: 0.42, chorus: 0.52, reverb: 0.48, delay: 0.30, output: 0.85 },
    electricKeys: { bell: 0.75, tineRatio: 4.6, malletClick: 0.50, bodyTone: 0.82, decayTime: 3.5, velocitySensitivity: 0.92 },
  }),
  createPreset('sgija-banger-stabs', 'Sgija Banger Stabs', 'Amapiano', 'Tight percussive envelope with sharp mallet transient to punch above syncopated log drums.', ['Sgija', 'Stabs', 'Banger', 'Percussive'], {
    macros: { warmth: 0.70, brightness: 0.65, bell: 0.55, body: 0.78, attack: 0.008, decay: 0.38, release: 0.20, movement: 0.20, chorus: 0.30, reverb: 0.25, delay: 0.38, output: 0.88 },
    ampEnvelope: { attack: 0.008, decay: 1.2, sustain: 0.15, release: 0.25 },
  }),
  createPreset('afro-tech-midnight', 'Afro-Tech Midnight Keys', 'Amapiano', 'Dark filtered keys with ping-pong delay tuned for hypnotic Afro-tech and deep house sets.', ['Afro-Tech', 'Club', 'Hypnotic', 'Delay'], {
    macros: { warmth: 0.75, brightness: 0.50, bell: 0.35, body: 0.84, attack: 0.02, decay: 0.62, release: 0.40, movement: 0.35, chorus: 0.38, reverb: 0.42, delay: 0.48, output: 0.86 },
    delay: { enabled: true, time: 0.375, feedback: 0.45, mix: 0.38, tempoSync: true, division: '1/8d', pingPong: true },
  }),
  createPreset('johannesburg-sunset', 'Johannesburg Sunset Keys', 'Amapiano', 'Warm golden harmonic resonance capturing the warmth of rooftop sunsets in Maboneng.', ['Johannesburg', 'Sunset', 'Warm', 'Soulful'], {
    macros: { warmth: 0.84, brightness: 0.58, bell: 0.50, body: 0.86, attack: 0.04, decay: 0.70, release: 0.58, movement: 0.40, chorus: 0.45, reverb: 0.50, delay: 0.28, output: 0.85 },
  }),
  createPreset('pretoria-bacardi-bed', 'Pretoria Bacardi Bed', 'Amapiano', 'Classic fast comping Rhodes sound from the streets of Atteridgeville and Mamelodi.', ['Pretoria', 'Bacardi', 'Comping', 'Fast'], {
    macros: { warmth: 0.72, brightness: 0.62, bell: 0.48, body: 0.76, attack: 0.015, decay: 0.48, release: 0.25, movement: 0.25, chorus: 0.35, reverb: 0.28, delay: 0.30, output: 0.88 },
  }),
  createPreset('durban-beachfront-chords', 'Durban Beachfront Chords', 'Amapiano', 'Airy pad layer behind gentle tines echoing ocean breezes on the Golden Mile.', ['Durban', 'Ocean', 'Airy', 'Breeze'], {
    macros: { warmth: 0.68, brightness: 0.68, bell: 0.60, body: 0.72, attack: 0.08, decay: 0.75, release: 0.70, movement: 0.52, chorus: 0.58, reverb: 0.62, delay: 0.35, output: 0.82 },
    layerPad: { enabled: true, volume: 0.75, pan: 0.15, octave: 0, detune: 12, mute: false, solo: false },
  }),
  createPreset('log-drum-companion-keys', 'Log-Drum Companion Keys', 'Amapiano', 'EQ notch in the 80-160Hz zone leaving perfect acoustic space for pitched sub-bass kicks.', ['Log Drum', 'EQ Carved', 'Companion', 'Mix Ready'], {
    macros: { warmth: 0.75, brightness: 0.62, bell: 0.52, body: 0.72, attack: 0.025, decay: 0.65, release: 0.42, movement: 0.32, chorus: 0.38, reverb: 0.35, delay: 0.25, output: 0.86 },
    filter: { type: 'highpass', cutoff: 180, resonance: 0.8, envelopeAmount: 0.1, keyTracking: 0.4 },
  }),
  createPreset('matorokisi-groove', 'Matorokisi Groove Keys', 'Amapiano', 'Bouncy syncopated keyboard patch with punchy velocity tracking for fast finger comping.', ['Groove', 'Bouncy', 'Fast', 'Finger Comp'], {
    macros: { warmth: 0.76, brightness: 0.60, bell: 0.48, body: 0.80, attack: 0.01, decay: 0.52, release: 0.30, movement: 0.28, chorus: 0.32, reverb: 0.30, delay: 0.28, output: 0.88 },
  }),
  createPreset('de-mthuda-roots', 'De Mthuda Soul Roots', 'Amapiano', 'Rich, deep, dark keyboard chords loaded with historic Soweto kwaito and jazz roots.', ['De Mthuda', 'Roots', 'Soweto', 'Kwaito'], {
    macros: { warmth: 0.88, brightness: 0.45, bell: 0.35, body: 0.90, attack: 0.035, decay: 0.68, release: 0.48, movement: 0.35, chorus: 0.40, reverb: 0.42, delay: 0.24, output: 0.85 },
  }),
  createPreset('amapiano-flute-keys', 'Amapiano Flute-Keys Layer', 'Amapiano', 'Warm keys with upper whistle-like sine partials reminiscent of modern SA flute drops.', ['Flute Keys', 'Sine', 'Melodic', 'SA Drop'], {
    macros: { warmth: 0.65, brightness: 0.72, bell: 0.68, body: 0.70, attack: 0.04, decay: 0.72, release: 0.58, movement: 0.48, chorus: 0.55, reverb: 0.55, delay: 0.35, output: 0.84 },
  }),
  createPreset('soweto-sunday-soul', 'Soweto Sunday Soul', 'Amapiano', 'Mellow Rhodes and warm pad blend crafted for relaxed Sunday braai sessions.', ['Soweto', 'Sunday', 'Braai', 'Mellow'], {
    macros: { warmth: 0.82, brightness: 0.54, bell: 0.44, body: 0.85, attack: 0.04, decay: 0.68, release: 0.52, movement: 0.38, chorus: 0.45, reverb: 0.46, delay: 0.25, output: 0.85 },
  }),
  createPreset('afro-piano-organ-lead', 'Afro-Piano Organ Companion', 'Amapiano', 'Bright percussive attack with sustaining drawbar-like undertones for lively runs.', ['Organ Companion', 'Lead', 'Bright', 'Lively'], {
    macros: { warmth: 0.72, brightness: 0.68, bell: 0.52, body: 0.78, attack: 0.012, decay: 0.62, release: 0.38, movement: 0.30, chorus: 0.38, reverb: 0.36, delay: 0.32, output: 0.86 },
  }),
  createPreset('private-school-velvet', 'Private School Velvet Momo', 'Amapiano', 'The pinnacle of chill luxury: warm low-end, silky tines, and wide lush atmosphere.', ['Private School', 'Luxury', 'Velvet', 'Chill'], {
    macros: { warmth: 0.86, brightness: 0.56, bell: 0.55, body: 0.88, attack: 0.04, decay: 0.72, release: 0.60, movement: 0.45, chorus: 0.52, reverb: 0.52, delay: 0.30, output: 0.85 },
  }),
  createPreset('amapiano-brass-keys', 'Amapiano Brass-Keys Stack', 'Amapiano', 'Dual warm sawtooth body giving synthetic brass power behind vintage tine transients.', ['Brass Keys', 'Synth Stack', 'Power', 'Modern'], {
    macros: { warmth: 0.80, brightness: 0.65, bell: 0.45, body: 0.84, attack: 0.03, decay: 0.65, release: 0.45, movement: 0.35, chorus: 0.48, reverb: 0.42, delay: 0.28, output: 0.85 },
    warmKeys: { waveformBlend: 0.82, warmSaturation: 0.55, filterOffset: 0.25, velocityBrightness: 0.88 },
  }),
  createPreset('gqom-atmosphere', 'Gqom Atmosphere', 'Amapiano', 'Dark, tense metallic key textures and ominous pad resonance for hypnotic Durban Gqom grooves.', ['Gqom', 'Durban', 'Dark', 'Metallic', 'Tense'], {
    macros: { warmth: 0.55, brightness: 0.50, bell: 0.65, body: 0.72, attack: 0.08, decay: 0.65, release: 0.60, movement: 0.48, chorus: 0.45, reverb: 0.58, delay: 0.38, output: 0.84 },
    filter: { type: 'bandpass', cutoff: 2200, resonance: 3.5, envelopeAmount: 0.3, keyTracking: 0.5 },
    electricKeys: { bell: 0.68, tineRatio: 4.8, malletClick: 0.55, bodyTone: 0.65, decayTime: 2.8, velocitySensitivity: 0.85 },
    saturation: { enabled: true, drive: 0.52, color: 0.45, mix: 0.55 },
  }),

  // ==========================================
  // --- 5. PADS & STRINGS (71-85) ---
  // ==========================================
  createPreset('airy-pad-keys', 'Airy Pad Keys', 'Pads', 'Lush, ethereal pad sustain carrying articulate key transients with wide stereo dispersion.', ['Pad', 'Ethereal', 'Sustain', 'Ambient'], {
    macros: { warmth: 0.60, brightness: 0.65, bell: 0.45, body: 0.60, attack: 0.15, decay: 0.80, release: 0.75, movement: 0.50, chorus: 0.60, reverb: 0.65, delay: 0.35, output: 0.80 },
    layerKeys: { enabled: true, volume: 0.65, pan: 0, octave: 0, detune: 0, mute: false, solo: false },
    layerWarmth: { enabled: true, volume: 0.55, pan: -0.2, octave: 0, detune: 3, mute: false, solo: false },
    layerPad: { enabled: true, volume: 0.85, pan: 0.2, octave: 0, detune: 8, mute: false, solo: false },
    pad: { waveType: 'sawtooth', stereoSpread: 0.95, detuneAmount: 18, attackTime: 0.7, releaseTime: 3.2 },
    ampEnvelope: { attack: 0.08, decay: 3.2, sustain: 0.7, release: 1.8 },
    reverb: { enabled: true, size: 0.85, damping: 0.3, mix: 0.52, predelay: 0.04 },
  }),
  createPreset('warm-pad-foundation', 'Warm Pad Foundation', 'Pads', 'Deep harmonic synth pad carrying warm understated keyboard strokes for thick bed arrangements.', ['Pad', 'Foundation', 'Warmth', 'Support'], {
    macros: { warmth: 0.85, brightness: 0.45, bell: 0.28, body: 0.85, attack: 0.22, decay: 0.85, release: 0.85, movement: 0.40, chorus: 0.48, reverb: 0.58, delay: 0.30, output: 0.82 },
    layerKeys: { enabled: true, volume: 0.60, pan: -0.1, octave: 0, detune: 0, mute: false, solo: false },
    layerWarmth: { enabled: true, volume: 0.65, pan: 0.1, octave: 0, detune: 2, mute: false, solo: false },
    layerPad: { enabled: true, volume: 0.90, pan: 0, octave: 0, detune: 12, mute: false, solo: false },
    pad: { waveType: 'triangle', stereoSpread: 0.88, detuneAmount: 15, attackTime: 0.8, releaseTime: 2.8 },
    filter: { type: 'warm_ladder', cutoff: 3600, resonance: 1.5, envelopeAmount: 0.3, keyTracking: 0.6 },
  }),
  createPreset('ethereal-soul-choir', 'Ethereal Soul Choir Pad', 'Pads', 'Vocal-like formant pad layer blended with delicate electric piano tines.', ['Vocal', 'Choir', 'Ethereal', 'Soul'], {
    macros: { warmth: 0.75, brightness: 0.65, bell: 0.52, body: 0.75, attack: 0.25, decay: 0.85, release: 0.85, movement: 0.60, chorus: 0.65, reverb: 0.70, delay: 0.38, output: 0.80 },
    pad: { waveType: 'sawtooth', stereoSpread: 0.92, detuneAmount: 16, attackTime: 1.1, releaseTime: 3.4 },
  }),
  createPreset('analog-strings-keys', 'Analog Strings & Keys', 'Pads', 'Solina-inspired vintage string ensemble supporting expressive acoustic-touch keys.', ['Strings', 'Solina', 'Vintage', 'Ensemble'], {
    macros: { warmth: 0.70, brightness: 0.68, bell: 0.48, body: 0.72, attack: 0.18, decay: 0.80, release: 0.75, movement: 0.55, chorus: 0.75, reverb: 0.55, delay: 0.28, output: 0.82 },
    chorus: { enabled: true, rate: 1.25, depth: 0.75, mix: 0.60, spread: 0.95 },
  }),
  createPreset('floating-cloud-pad', 'Floating Cloud Pad', 'Pads', 'Weightless, drift-away ambient pad with soft key clicks in the foreground.', ['Cloud', 'Floating', 'Ambient', 'Weightless'], {
    macros: { warmth: 0.62, brightness: 0.60, bell: 0.42, body: 0.65, attack: 0.35, decay: 0.88, release: 0.90, movement: 0.65, chorus: 0.65, reverb: 0.78, delay: 0.42, output: 0.78 },
    pad: { waveType: 'sine', stereoSpread: 0.95, detuneAmount: 12, attackTime: 1.5, releaseTime: 3.8 },
  }),
  createPreset('twilight-harmonic-pad', 'Twilight Harmonic Pad', 'Pads', 'Rich upper harmonic overtones and slow pulsing LFO auto-pan movement.', ['Twilight', 'Harmonics', 'Pulsing', 'Auto-Pan'], {
    macros: { warmth: 0.80, brightness: 0.55, bell: 0.45, body: 0.80, attack: 0.20, decay: 0.82, release: 0.80, movement: 0.75, chorus: 0.55, reverb: 0.62, delay: 0.32, output: 0.82 },
    lfo: { enabled: true, waveform: 'sine', rate: 0.75, depth: 0.60, target: 'pan', tempoSync: false, syncDivision: '1/4' },
  }),
  createPreset('golden-silk-pad', 'Golden Silk Pad', 'Pads', 'Smooth, high-bandwidth silk textures that cushion soulful vocal deliveries without masking.', ['Silk', 'Golden', 'Cushion', 'Mix Friendly'], {
    macros: { warmth: 0.82, brightness: 0.50, bell: 0.38, body: 0.82, attack: 0.22, decay: 0.80, release: 0.78, movement: 0.42, chorus: 0.52, reverb: 0.60, delay: 0.25, output: 0.82 },
  }),
  createPreset('deep-ocean-pad', 'Deep Ocean Pad Keys', 'Pads', 'Abyssal sub-warmth combined with gentle glassy surface ripples.', ['Ocean', 'Abyss', 'Deep Sub', 'Ripples'], {
    macros: { warmth: 0.92, brightness: 0.32, bell: 0.28, body: 0.95, attack: 0.30, decay: 0.85, release: 0.88, movement: 0.45, chorus: 0.48, reverb: 0.72, delay: 0.35, output: 0.80 },
    filter: { type: 'lowpass', cutoff: 2400, resonance: 1.8, envelopeAmount: 0.2, keyTracking: 0.5 },
  }),
  createPreset('velvet-blanket-pad', 'Velvet Blanket Pad', 'Pads', 'Warm, comforting synth pad envelopment designed to hold down entire verses on its own.', ['Blanket', 'Comfort', 'Holding Down', 'Warm'], {
    macros: { warmth: 0.88, brightness: 0.42, bell: 0.30, body: 0.88, attack: 0.28, decay: 0.85, release: 0.85, movement: 0.35, chorus: 0.45, reverb: 0.65, delay: 0.25, output: 0.82 },
  }),
  createPreset('shimmer-tine-pad', 'Shimmer Tine Pad', 'Pads', 'Dual detuned tines feeding an infinite feedback reverb for crystalline ambient beds.', ['Shimmer', 'Infinite Reverb', 'Crystalline', 'Ambient'], {
    macros: { warmth: 0.58, brightness: 0.78, bell: 0.75, body: 0.65, attack: 0.15, decay: 0.82, release: 0.82, movement: 0.55, chorus: 0.68, reverb: 0.82, delay: 0.45, output: 0.78 },
    reverb: { enabled: true, size: 0.95, damping: 0.2, mix: 0.65, predelay: 0.05 },
  }),
  createPreset('vintage-vocal-keys', 'Vintage Mellotron-esque Pad', 'Pads', 'Flute-like tape loop character with soulful acoustic keys on top.', ['Mellotron', 'Tape Loop', 'Vintage', 'Flute'], {
    macros: { warmth: 0.82, brightness: 0.50, bell: 0.40, body: 0.82, attack: 0.12, decay: 0.78, release: 0.70, movement: 0.60, chorus: 0.50, reverb: 0.55, delay: 0.28, output: 0.82 },
    lfo: { enabled: true, waveform: 'triangle', rate: 1.4, depth: 0.35, target: 'pitch', tempoSync: false, syncDivision: '1/8' },
  }),
  createPreset('celestial-gospel-pad', 'Celestial Gospel Pad', 'Pads', 'Resplendent worship pad layer with expansive stereo spread and slow attack.', ['Celestial', 'Worship', 'Gospel', 'Majesty'], {
    macros: { warmth: 0.78, brightness: 0.65, bell: 0.55, body: 0.78, attack: 0.25, decay: 0.85, release: 0.88, movement: 0.45, chorus: 0.60, reverb: 0.75, delay: 0.32, output: 0.80 },
  }),
  createPreset('sunset-horizon-pad', 'Sunset Horizon Pad', 'Pads', 'Orange-sky warm filter sweep that opens gradually as keys are sustained.', ['Sunset', 'Horizon', 'Filter Sweep', 'Orange'], {
    macros: { warmth: 0.84, brightness: 0.58, bell: 0.42, body: 0.84, attack: 0.30, decay: 0.85, release: 0.82, movement: 0.50, chorus: 0.52, reverb: 0.65, delay: 0.30, output: 0.82 },
  }),
  createPreset('amapiano-ambient-cloud', 'Amapiano Ambient Cloud', 'Pads', 'Hypnotic, floaty pad engineered specifically to sit behind private school piano voicings.', ['Amapiano Cloud', 'Private School', 'Floaty', 'Bed'], {
    macros: { warmth: 0.80, brightness: 0.55, bell: 0.48, body: 0.82, attack: 0.20, decay: 0.82, release: 0.80, movement: 0.42, chorus: 0.50, reverb: 0.62, delay: 0.32, output: 0.82 },
  }),
  createPreset('infinite-sustain-pad', 'Infinite Sustain Drone Bed', 'Pads', 'Zero-decay sustaining pad layer that continues indefinitely with warm analog drift.', ['Drone', 'Infinite', 'Sustain', 'Drift'], {
    macros: { warmth: 0.85, brightness: 0.48, bell: 0.32, body: 0.88, attack: 0.40, decay: 0.95, release: 0.95, movement: 0.52, chorus: 0.55, reverb: 0.72, delay: 0.35, output: 0.80 },
    ampEnvelope: { attack: 0.35, decay: 5.0, sustain: 0.95, release: 3.5 },
  }),

  // ==========================================
  // --- 6. ATMOSPHERIC & CINEMATIC (86-100) ---
  // ==========================================
  createPreset('atmospheric-chords', 'Atmospheric Chords', 'Atmospheric', 'Wide stereo diffusion, dual feedback delay, and expansive harmonic depth.', ['Atmospheric', 'Cinematic', 'Space', 'Reverb'], {
    macros: { warmth: 0.65, brightness: 0.62, bell: 0.52, body: 0.65, attack: 0.12, decay: 0.82, release: 0.80, movement: 0.55, chorus: 0.55, reverb: 0.72, delay: 0.48, output: 0.80 },
    delay: { enabled: true, time: 0.42, feedback: 0.52, mix: 0.38, tempoSync: true, division: '1/8d', pingPong: true },
    reverb: { enabled: true, size: 0.90, damping: 0.35, mix: 0.58, predelay: 0.05 },
    pad: { waveType: 'sawtooth', stereoSpread: 0.90, detuneAmount: 16, attackTime: 0.55, releaseTime: 2.8 },
  }),
  createPreset('glassy-chord-texture', 'Glassy Chord Texture', 'Atmospheric', 'Bright metallic chime partials and high-harmonic bells creating shimmering modern chord textures.', ['Glassy', 'Crystalline', 'Modern', 'Afro-Pop'], {
    macros: { warmth: 0.42, brightness: 0.88, bell: 0.90, body: 0.52, attack: 0.02, decay: 0.75, release: 0.60, movement: 0.45, chorus: 0.58, reverb: 0.62, delay: 0.38, output: 0.82 },
    electricKeys: { bell: 0.92, tineRatio: 6.8, malletClick: 0.62, bodyTone: 0.52, decayTime: 3.6, velocitySensitivity: 0.95 },
    filter: { type: 'highpass', cutoff: 280, resonance: 0.9, envelopeAmount: 0.1, keyTracking: 0.4 },
    reverb: { enabled: true, size: 0.80, damping: 0.2, mix: 0.48, predelay: 0.03 },
  }),
  createPreset('slow-cinematic-keys', 'Slow Cinematic Keys', 'Atmospheric', 'Slow blossoming transient with majestic sustain tail and wide orchestral reverb envelopment.', ['Cinematic', 'Slow', 'Emotional', 'Soundtrack'], {
    macros: { warmth: 0.70, brightness: 0.58, bell: 0.48, body: 0.75, attack: 0.25, decay: 0.88, release: 0.90, movement: 0.50, chorus: 0.52, reverb: 0.80, delay: 0.42, output: 0.78 },
    ampEnvelope: { attack: 0.22, decay: 4.2, sustain: 0.65, release: 2.5 },
    pad: { waveType: 'sawtooth', stereoSpread: 0.95, detuneAmount: 18, attackTime: 1.2, releaseTime: 3.5 },
    reverb: { enabled: true, size: 0.95, damping: 0.30, mix: 0.65, predelay: 0.06 },
  }),
  createPreset('dusk-reflections', 'Dusk Reflections', 'Atmospheric', 'Slow echoing ping-pong delay lines reflecting intimate electric keys into a twilight landscape.', ['Dusk', 'Reflections', 'Echo', 'Twilight'], {
    macros: { warmth: 0.75, brightness: 0.55, bell: 0.48, body: 0.78, attack: 0.08, decay: 0.78, release: 0.75, movement: 0.55, chorus: 0.50, reverb: 0.68, delay: 0.52, output: 0.80 },
    delay: { enabled: true, time: 0.48, feedback: 0.55, mix: 0.42, tempoSync: true, division: '1/8d', pingPong: true },
  }),
  createPreset('aurora-borealis-keys', 'Aurora Borealis Chords', 'Atmospheric', 'Evolving spectral sweeps and shimmering overtone tails that morph across keyboard registers.', ['Aurora', 'Spectral', 'Shimmer', 'Evolving'], {
    macros: { warmth: 0.60, brightness: 0.78, bell: 0.72, body: 0.65, attack: 0.15, decay: 0.82, release: 0.85, movement: 0.65, chorus: 0.65, reverb: 0.75, delay: 0.40, output: 0.78 },
  }),
  createPreset('nostalgic-polaroid', 'Nostalgic Polaroid', 'Atmospheric', 'Washed out vintage color, fluttery pitch modulation, and cozy living-room tape ambience.', ['Polaroid', 'Washed Out', 'Nostalgia', 'Flutter'], {
    macros: { warmth: 0.82, brightness: 0.45, bell: 0.35, body: 0.80, attack: 0.05, decay: 0.68, release: 0.60, movement: 0.72, chorus: 0.55, reverb: 0.58, delay: 0.35, output: 0.82 },
    lfo: { enabled: true, waveform: 'triangle', rate: 1.2, depth: 0.48, target: 'pitch', tempoSync: false, syncDivision: '1/8' },
  }),
  createPreset('space-echo-soul', 'Space Echo Soul Tines', 'Atmospheric', 'Multi-head tape echo emulation sending soul keys bounding across the stereo spectrum.', ['Space Echo', 'Multi-Head', 'Dub Soul', 'Delay'], {
    macros: { warmth: 0.76, brightness: 0.62, bell: 0.52, body: 0.75, attack: 0.03, decay: 0.70, release: 0.62, movement: 0.58, chorus: 0.48, reverb: 0.55, delay: 0.60, output: 0.82 },
    delay: { enabled: true, time: 0.36, feedback: 0.62, mix: 0.48, tempoSync: true, division: '1/8', pingPong: true },
  }),
  createPreset('starfield-reverie', 'Starfield Reverie', 'Atmospheric', 'Distant stellar keyboard pulses layered over endless galactic reverb diffusion.', ['Starfield', 'Galaxy', 'Distant', 'Endless'], {
    macros: { warmth: 0.65, brightness: 0.72, bell: 0.65, body: 0.68, attack: 0.20, decay: 0.85, release: 0.90, movement: 0.55, chorus: 0.62, reverb: 0.85, delay: 0.45, output: 0.76 },
    reverb: { enabled: true, size: 0.98, damping: 0.22, mix: 0.68, predelay: 0.06 },
  }),
  createPreset('rainy-tokyo-night', 'Rainy Tokyo Night', 'Atmospheric', 'Reflective neon keyboard tones with moody filter dampening and delicate delay repeats.', ['Tokyo', 'Rainy Night', 'Reflective', 'Neon'], {
    macros: { warmth: 0.72, brightness: 0.58, bell: 0.48, body: 0.78, attack: 0.06, decay: 0.72, release: 0.68, movement: 0.48, chorus: 0.52, reverb: 0.65, delay: 0.42, output: 0.80 },
  }),
  createPreset('foggy-harbor-keys', 'Foggy Harbor Keys', 'Atmospheric', 'Hollow, distant electric piano chords calling out like foghorns across the bay.', ['Foggy', 'Harbor', 'Distant', 'Hollow'], {
    macros: { warmth: 0.85, brightness: 0.38, bell: 0.28, body: 0.88, attack: 0.10, decay: 0.75, release: 0.78, movement: 0.40, chorus: 0.45, reverb: 0.72, delay: 0.38, output: 0.80 },
    filter: { type: 'bandpass', cutoff: 1800, resonance: 2.2, envelopeAmount: 0.25, keyTracking: 0.5 },
  }),
  createPreset('midnight-train-motion', 'Midnight Train Motion', 'Atmospheric', 'Gentle rhythmic delay pulses and soothing harmonic warm keys evoking night travel.', ['Train', 'Motion', 'Travel', 'Rhythmic'], {
    macros: { warmth: 0.78, brightness: 0.55, bell: 0.44, body: 0.80, attack: 0.04, decay: 0.68, release: 0.60, movement: 0.62, chorus: 0.45, reverb: 0.52, delay: 0.46, output: 0.82 },
  }),
  createPreset('seraphim-wings-keys', 'Seraphim Wings Keys', 'Atmospheric', 'Transcendent chord layer combining shimmering high bell chime with celestial sustain.', ['Seraphim', 'Wings', 'Heavenly', 'Transcendent'], {
    macros: { warmth: 0.68, brightness: 0.82, bell: 0.80, body: 0.72, attack: 0.12, decay: 0.82, release: 0.85, movement: 0.52, chorus: 0.65, reverb: 0.78, delay: 0.38, output: 0.78 },
  }),
  createPreset('ghost-notes-spectral', 'Ghost Notes Spectral', 'Atmospheric', 'Whisper-quiet keyboard attacks followed by an expanding halo of harmonic resonance.', ['Ghost Notes', 'Spectral', 'Halo', 'Whisper'], {
    macros: { warmth: 0.72, brightness: 0.62, bell: 0.52, body: 0.70, attack: 0.18, decay: 0.80, release: 0.85, movement: 0.65, chorus: 0.58, reverb: 0.82, delay: 0.48, output: 0.78 },
  }),
  createPreset('deep-space-isolation', 'Deep Space Isolation', 'Atmospheric', 'Single key strikes hanging in absolute vacuum with trailing stereo reflections.', ['Deep Space', 'Vacuum', 'Isolation', 'Ambient'], {
    macros: { warmth: 0.60, brightness: 0.68, bell: 0.58, body: 0.65, attack: 0.08, decay: 0.85, release: 0.92, movement: 0.50, chorus: 0.55, reverb: 0.88, delay: 0.55, output: 0.76 },
    delay: { enabled: true, time: 0.55, feedback: 0.65, mix: 0.45, tempoSync: true, division: '1/4', pingPong: true },
  }),
  createPreset('eternal-dawn-chords', 'Eternal Dawn Chords', 'Atmospheric', 'Majestic chord swell with brilliant high overtone radiance and endless warm resolution.', ['Eternal Dawn', 'Majestic', 'Radiance', 'Swell'], {
    macros: { warmth: 0.82, brightness: 0.68, bell: 0.62, body: 0.82, attack: 0.22, decay: 0.88, release: 0.90, movement: 0.55, chorus: 0.62, reverb: 0.80, delay: 0.35, output: 0.80 },
    reverb: { enabled: true, size: 0.92, damping: 0.28, mix: 0.62, predelay: 0.04 },
  }),
];
