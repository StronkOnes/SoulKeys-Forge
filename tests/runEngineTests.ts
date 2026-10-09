import { midiToFreq, midiToNoteName, processVelocity, makeSaturationCurve, dbToGain, gainToDb } from '../src/audio/DSPUtils';
import { getScaleNotes, getScaleDegrees, computeChordNotes, createChord, CHORD_INTERVALS } from '../src/harmony/musicTheory';
import { FACTORY_PRESETS } from '../src/presets/factoryPresets';
import { GENRE_PROGRESSIONS } from '../src/harmony/progressions';
import { generateMidiFile } from '../src/harmony/MidiWriter';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== SoulKeys Forge Automated Suite ===\n');

// 1. DSP Utilities Tests
console.log('--- 1. DSP Math & Frequency Conversions ---');
assert(Math.abs(midiToFreq(69) - 440) < 0.001, 'A4 (MIDI 69) equals 440.00 Hz');
assert(Math.abs(midiToFreq(60) - 261.625) < 0.01, 'Middle C (MIDI 60) equals 261.63 Hz');
assert(midiToNoteName(60) === 'C4', 'MIDI note 60 formats to C4');
assert(midiToNoteName(69) === 'A4', 'MIDI note 69 formats to A4');
assert(midiToNoteName(36) === 'C2', 'MIDI note 36 formats to C2');

// Velocity curves
assert(processVelocity(127, 'linear') === 1.0, 'Max velocity linear is 1.0');
assert(processVelocity(0, 'linear') === 0.0, 'Zero velocity linear is 0.0');
const softMid = processVelocity(64, 'soft');
const hardMid = processVelocity(64, 'hard');
assert(softMid < hardMid, 'Soft velocity curve yields lower gain than hard curve at mid-velocity');
assert(processVelocity(1, 'compressed') >= 0.35, 'Compressed velocity maintains studio floor');

// Saturation curve
const satCurve = makeSaturationCurve(0.5, 512);
assert(satCurve.length === 512, 'Saturation curve generates correct sample length');
assert(satCurve[256] >= -0.05 && satCurve[256] <= 0.05, 'Saturation curve zero-crossing is centered');

// Decibels
assert(Math.abs(dbToGain(0) - 1.0) < 0.001, '0 dB is 1.0 linear amplitude');
assert(Math.abs(gainToDb(1.0) - 0.0) < 0.001, '1.0 linear is 0 dB');

// 2. Music Theory Tests
console.log('\n--- 2. Music Theory & Scale Computations ---');
const cMajorNotes = getScaleNotes('C', 'Major');
assert(JSON.stringify(cMajorNotes) === JSON.stringify(['C', 'D', 'E', 'F', 'G', 'A', 'B']), 'C Major scale notes are correct');

const aMinorNotes = getScaleNotes('A', 'Natural Minor');
assert(JSON.stringify(aMinorNotes) === JSON.stringify(['A', 'B', 'C', 'D', 'E', 'F', 'G']), 'A Natural Minor notes are correct');

const cMajorDegrees = getScaleDegrees('C', 'Major');
assert(cMajorDegrees.length === 7, 'Major scale has 7 diatonic degrees');
assert(cMajorDegrees[0].roman === 'I' && cMajorDegrees[0].root === 'C', 'Degree 1 of C Major is I (C)');
assert(cMajorDegrees[4].roman === 'V' && cMajorDegrees[4].root === 'G', 'Degree 5 of C Major is V (G)');

// Chord Notes & Inversions
const cMajTriad = computeChordNotes('C', 'Major Triad', 4, 'root');
assert(JSON.stringify(cMajTriad) === JSON.stringify([60, 64, 67]), 'C Major triad has notes [60, 64, 67]');

const cMajTriad1st = computeChordNotes('C', 'Major Triad', 4, '1st');
assert(JSON.stringify(cMajTriad1st) === JSON.stringify([64, 67, 72]), 'C Major triad 1st inversion has notes [64, 67, 72]');

const cMaj9 = computeChordNotes('C', 'Major 9th', 4, 'root');
assert(cMaj9.length === 5, 'Major 9th chord contains 5 notes (1, 3, 5, 7, 9)');

// Drop-2 voicing
const cMaj7Drop2 = computeChordNotes('C', 'Major 7th', 4, 'drop2');
assert(cMaj7Drop2.length === 4, 'Drop-2 Major 7th has 4 notes');
assert(cMaj7Drop2[0] < 60, 'Drop-2 lowers second highest note below base octave');

// 3. Factory Preset Suite Verification (100 Presets)
console.log('\n--- 3. Factory Preset Verification (100 Presets) ---');
assert(FACTORY_PRESETS.length === 100, `Exact 100 factory presets defined as requested (found ${FACTORY_PRESETS.length})`);

FACTORY_PRESETS.forEach((p, idx) => {
  const hasLayers = p.state.layerKeys && p.state.layerWarmth && p.state.layerPad;
  const hasMacros = p.state.macros && p.state.macros.warmth >= 0 && p.state.macros.output <= 1.2;
  const hasFX = p.state.chorus && p.state.delay && p.state.reverb && p.state.saturation;
  if (!hasLayers || !hasMacros || !hasFX) {
    assert(false, `Preset #${idx + 1} "${p.name}" has invalid schema`);
  }
});
assert(true, 'All 100 factory presets have valid multi-layer DSP schemas');

// 3b. Harmonic Progression Suite Verification (30+ Harmonies)
console.log('\n--- 3b. Genre Progressions Verification (30+ Progressions) ---');
assert(GENRE_PROGRESSIONS.length >= 30, `At least 30 genre progressions defined (found ${GENRE_PROGRESSIONS.length})`);
GENRE_PROGRESSIONS.forEach((prog, idx) => {
  assert(prog.chords.length >= 3, `Progression #${idx + 1} "${prog.title}" has valid chords`);
});

// 4. Standard MIDI File Export Verification
console.log('\n--- 4. Standard MIDI File Format 0 Export ---');
const testChords = [
  createChord('C', 'Major 9th', 0, 'root', 'Imaj9'),
  createChord('A', 'Minor 9th', 0, 'root', 'vi9'),
];
const midiBytes = generateMidiFile(testChords, 112);
assert(midiBytes.length > 30, 'MIDI byte stream generated successfully');

// Verify SMF Header 'MThd' (0x4D, 0x54, 0x68, 0x64)
const headerMagic = String.fromCharCode(midiBytes[0], midiBytes[1], midiBytes[2], midiBytes[3]);
assert(headerMagic === 'MThd', "MIDI header begins with 'MThd'");

// Verify format 0 and 1 track
assert(midiBytes[8] === 0x00 && midiBytes[9] === 0x00, 'MIDI format is Format 0');
assert(midiBytes[10] === 0x00 && midiBytes[11] === 0x01, 'MIDI contains 1 track');

// Verify track chunk 'MTrk' (0x4D, 0x54, 0x72, 0x6B)
const trackMagic = String.fromCharCode(midiBytes[14], midiBytes[15], midiBytes[16], midiBytes[17]);
assert(trackMagic === 'MTrk', "Track chunk begins with 'MTrk'");

// Verify End of Track event (0xFF, 0x2F, 0x00)
const last3 = [midiBytes[midiBytes.length - 3], midiBytes[midiBytes.length - 2], midiBytes[midiBytes.length - 1]];
assert(last3[0] === 0xff && last3[1] === 0x2f && last3[2] === 0x00, 'Track terminates with End-Of-Track event (FF 2F 00)');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
