import { SoulKeysState } from '../audio/types';

export const DEFAULT_SOULKEYS_STATE: SoulKeysState = {
  masterVolume: 0.85,
  octaveShift: 0,
  velocityCurve: 'linear',
  voiceMode: 'poly16',
  glideTime: 0,
  sustainHold: false,

  macros: {
    warmth: 0.65,
    brightness: 0.55,
    bell: 0.45,
    body: 0.70,
    attack: 0.05,
    decay: 0.65,
    release: 0.40,
    movement: 0.30,
    chorus: 0.35,
    reverb: 0.40,
    delay: 0.25,
    output: 0.85,
  },

  layerKeys: {
    enabled: true,
    volume: 0.85,
    pan: 0,
    octave: 0,
    detune: 0,
    mute: false,
    solo: false,
  },

  layerWarmth: {
    enabled: true,
    volume: 0.60,
    pan: -0.1,
    octave: 0,
    detune: 3,
    mute: false,
    solo: false,
  },

  layerPad: {
    enabled: true,
    volume: 0.38,
    pan: 0.1,
    octave: 0,
    detune: -5,
    mute: false,
    solo: false,
  },

  electricKeys: {
    bell: 0.45,
    tineRatio: 3.76,
    malletClick: 0.35,
    bodyTone: 0.75,
    decayTime: 3.2,
    velocitySensitivity: 0.85,
  },

  warmKeys: {
    waveformBlend: 0.35,
    warmSaturation: 0.45,
    filterOffset: 0.15,
    velocityBrightness: 0.75,
  },

  pad: {
    waveType: 'sawtooth',
    stereoSpread: 0.75,
    detuneAmount: 10,
    attackTime: 0.45,
    releaseTime: 1.8,
  },

  filter: {
    type: 'lowpass',
    cutoff: 4800,
    resonance: 1.6,
    envelopeAmount: 0.35,
    keyTracking: 0.65,
  },

  ampEnvelope: {
    attack: 0.015,
    decay: 2.8,
    sustain: 0.45,
    release: 0.65,
  },

  filterEnvelope: {
    attack: 0.02,
    decay: 1.8,
    sustain: 0.25,
    release: 0.5,
  },

  lfo: {
    enabled: true,
    waveform: 'sine',
    rate: 1.2,
    depth: 0.25,
    target: 'pan',
    tempoSync: false,
    syncDivision: '1/4',
  },

  chorus: {
    enabled: true,
    rate: 0.85,
    depth: 0.45,
    mix: 0.35,
    spread: 0.8,
  },

  delay: {
    enabled: true,
    time: 0.34,
    feedback: 0.30,
    mix: 0.22,
    tempoSync: true,
    division: '1/8d',
    pingPong: true,
  },

  reverb: {
    enabled: true,
    size: 0.65,
    damping: 0.40,
    mix: 0.38,
    predelay: 0.02,
  },

  saturation: {
    enabled: true,
    drive: 0.35,
    color: 0.55,
    mix: 0.45,
  },
};
