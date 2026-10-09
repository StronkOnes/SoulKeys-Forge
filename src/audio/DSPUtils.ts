import { VelocityCurveType } from './types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Convert MIDI note number (0-127) to frequency in Hz (A4 = 440Hz, note 69) */
export function midiToFreq(midiNote: number, detuneCents: number = 0): number {
  const noteWithDetune = midiNote + detuneCents / 100;
  return 440 * Math.pow(2, (noteWithDetune - 69) / 12);
}

/** Convert MIDI note number to note name with octave (e.g. 60 -> C4) */
export function midiToNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/** Transform raw MIDI velocity (1-127 or 0-1) according to selected curve */
export function processVelocity(velocity: number, curve: VelocityCurveType): number {
  const normalized = Math.max(0, Math.min(1, velocity > 1 ? velocity / 127 : velocity));
  
  switch (curve) {
    case 'soft':
      // Higher dynamic range for delicate touch, needs harder strike for peak
      return Math.pow(normalized, 1.6);
    case 'hard':
      // Faster rise to maximum velocity, punchier
      return Math.pow(normalized, 0.65);
    case 'compressed':
      // Studio compressed response: minimum velocity is around 0.35, smoother ceiling
      return 0.35 + 0.65 * Math.sin((normalized * Math.PI) / 2);
    case 'linear':
    default:
      return normalized;
  }
}

/** Generate a Float32Array curve for WaveShaperNode creating warm tube/tape saturation */
export function makeSaturationCurve(amount: number = 0.5, samples: number = 1024): Float32Array {
  const curve = new Float32Array(samples);
  const k = Math.max(0.1, amount * 10);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    // Symmetrical soft clip with subtle harmonic excitation
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

/** Generate a realistic synthetic stereo reverb impulse response */
export function createReverbImpulse(
  audioCtx: AudioContext | BaseAudioContext,
  durationSeconds: number = 2.5,
  decayRate: number = 2.0,
  damping: number = 0.5
): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * Math.max(0.2, durationSeconds));
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  // Exponential decay with randomized high-frequency diffusion & early reflection taps
  const earlyTaps = [0.012, 0.024, 0.038, 0.055, 0.078, 0.096];
  const dampingFilter = 1.0 - damping * 0.45;

  let lastL = 0;
  let lastR = 0;

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Smooth exponential envelope
    const envelope = Math.exp(-decayRate * t);
    
    // Noise core
    let noiseL = (Math.random() * 2 - 1) * envelope;
    let noiseR = (Math.random() * 2 - 1) * envelope;

    // Simulate early reflection bursts
    for (const tap of earlyTaps) {
      const tapSample = Math.floor(tap * sampleRate);
      if (Math.abs(i - tapSample) < 4) {
        noiseL += (Math.random() * 1.5 - 0.75) * 0.4;
        noiseR += (Math.random() * 1.5 - 0.75) * 0.4;
      }
    }

    // High frequency damping (simple one-pole filter)
    lastL = lastL * (1 - dampingFilter) + noiseL * dampingFilter;
    lastR = lastR * (1 - dampingFilter) + noiseR * dampingFilter;

    left[i] = lastL;
    right[i] = lastR;
  }

  return impulse;
}

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Convert decibels to linear amplitude */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/** Convert linear amplitude to decibels */
export function gainToDb(gain: number): number {
  if (gain <= 0.00001) return -100;
  return 20 * Math.log10(gain);
}
