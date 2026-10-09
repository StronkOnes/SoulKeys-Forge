import { RootNote, ScaleType, ChordType, ChordInversion, ChordDefinition } from '../audio/types';

export const ROOT_NOTES: RootNote[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_INDEX_MAP: Record<RootNote, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
};

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Major Pentatonic': [0, 2, 4, 7, 9],
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
  'Neo-Soul': [0, 2, 3, 4, 7, 9, 10],
};

export const CHORD_INTERVALS: Record<ChordType, number[]> = {
  'Major Triad': [0, 4, 7],
  'Minor Triad': [0, 3, 7],
  'Major 7th': [0, 4, 7, 11],
  'Minor 7th': [0, 3, 7, 10],
  'Dominant 7th': [0, 4, 7, 10],
  'Half-Diminished 7th': [0, 3, 6, 10],
  'Diminished 7th': [0, 3, 6, 9],
  'Major 9th': [0, 4, 7, 11, 14],
  'Minor 9th': [0, 3, 7, 10, 14],
  'Dominant 9th': [0, 4, 7, 10, 14],
  'Minor 11th': [0, 3, 7, 10, 14, 17],
  'Suspended 4th': [0, 5, 7],
  'Suspended 2nd': [0, 2, 7],
  'Add 9': [0, 4, 7, 14],
  '6/9 Soul': [0, 4, 7, 9, 14],
  'Altered 7th': [0, 4, 8, 10, 15],
};

/** Get the root note index in chromatic scale */
export function getRootIndex(root: RootNote): number {
  return NOTE_INDEX_MAP[root];
}

/** Get list of note names in a given scale */
export function getScaleNotes(root: RootNote, scale: ScaleType): RootNote[] {
  const rootIdx = getRootIndex(root);
  const intervals = SCALE_INTERVALS[scale];
  return intervals.map((interval) => {
    const noteIdx = (rootIdx + interval) % 12;
    return ROOT_NOTES[noteIdx];
  });
}

/** Generate diatonic chords for scale degrees */
export function getScaleDegrees(root: RootNote, scale: ScaleType): {
  degree: string;
  roman: string;
  root: RootNote;
  defaultType: ChordType;
  secondaryType: ChordType;
}[] {
  const scaleNotes = getScaleNotes(root, scale);
  const isMinor = scale.includes('Minor') || scale === 'Dorian';

  const majorRomans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const majorTriads: ChordType[] = ['Major Triad', 'Minor Triad', 'Minor Triad', 'Major Triad', 'Major Triad', 'Minor Triad', 'Diminished 7th'];
  const majorSevenths: ChordType[] = ['Major 7th', 'Minor 7th', 'Minor 7th', 'Major 7th', 'Dominant 7th', 'Minor 7th', 'Half-Diminished 7th'];

  const minorRomans = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
  const minorTriads: ChordType[] = ['Minor Triad', 'Diminished 7th', 'Major Triad', 'Minor Triad', 'Minor Triad', 'Major Triad', 'Major Triad'];
  const minorSevenths: ChordType[] = ['Minor 7th', 'Half-Diminished 7th', 'Major 7th', 'Minor 7th', 'Minor 7th', 'Major 7th', 'Dominant 7th'];

  return scaleNotes.map((noteName, idx) => {
    const roman = isMinor ? (minorRomans[idx] || `d${idx + 1}`) : (majorRomans[idx] || `d${idx + 1}`);
    const defaultType = isMinor ? (minorTriads[idx] || 'Minor Triad') : (majorTriads[idx] || 'Major Triad');
    const secondaryType = isMinor ? (minorSevenths[idx] || 'Minor 7th') : (majorSevenths[idx] || 'Major 7th');

    return {
      degree: `${idx + 1}`,
      roman,
      root: noteName,
      defaultType,
      secondaryType,
    };
  });
}

/** Compute MIDI note numbers for a chord with inversion and octave */
export function computeChordNotes(
  root: RootNote,
  type: ChordType,
  octave: number = 4,
  inversion: ChordInversion = 'root'
): number[] {
  const rootPitch = 12 * (octave + 1) + NOTE_INDEX_MAP[root];
  const intervals = CHORD_INTERVALS[type] || [0, 4, 7];

  let rawNotes = intervals.map((interval) => rootPitch + interval);

  // Apply Inversions
  if (inversion === '1st' && rawNotes.length > 1) {
    const bottom = rawNotes.shift()!;
    rawNotes.push(bottom + 12);
  } else if (inversion === '2nd' && rawNotes.length > 2) {
    const b1 = rawNotes.shift()!;
    const b2 = rawNotes.shift()!;
    rawNotes.push(b1 + 12);
    rawNotes.push(b2 + 12);
  } else if (inversion === '3rd' && rawNotes.length > 3) {
    const b1 = rawNotes.shift()!;
    const b2 = rawNotes.shift()!;
    const b3 = rawNotes.shift()!;
    rawNotes.push(b1 + 12);
    rawNotes.push(b2 + 12);
    rawNotes.push(b3 + 12);
  } else if (inversion === 'drop2' && rawNotes.length >= 4) {
    // Drop the second highest note down an octave for classic lush jazz/soul spacing
    const secondHighestIdx = rawNotes.length - 2;
    rawNotes[secondHighestIdx] -= 12;
  }

  // Sort notes ascending
  rawNotes.sort((a, b) => a - b);
  return rawNotes;
}

/** Create a full ChordDefinition helper */
export function createChord(
  root: RootNote,
  type: ChordType,
  octaveOffset: number = 0,
  inversion: ChordInversion = 'root',
  romanNumeral?: string
): ChordDefinition {
  const baseOctave = 3 + octaveOffset;
  const notes = computeChordNotes(root, type, baseOctave, inversion);
  const typeShort = type
    .replace('Major Triad', '')
    .replace('Minor Triad', 'm')
    .replace('Major 7th', 'maj7')
    .replace('Minor 7th', 'm7')
    .replace('Dominant 7th', '7')
    .replace('Major 9th', 'maj9')
    .replace('Minor 9th', 'm9')
    .replace('Dominant 9th', '9')
    .replace('Minor 11th', 'm11')
    .replace('Half-Diminished 7th', 'm7b5')
    .replace('Diminished 7th', 'dim7')
    .replace('Suspended 4th', 'sus4')
    .replace('Suspended 2nd', 'sus2')
    .replace('Add 9', 'add9')
    .replace('6/9 Soul', '6/9')
    .replace('Altered 7th', '7alt');

  return {
    id: `${root}-${type}-${inversion}-${octaveOffset}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${root}${typeShort}`,
    root,
    type,
    inversion,
    octaveOffset,
    notes,
    romanNumeral,
    durationBeats: 4,
  };
}
