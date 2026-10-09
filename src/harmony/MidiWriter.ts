import { ChordDefinition } from '../audio/types';

/** Variable Length Quantity (VLQ) encoder for MIDI format */
function encodeVLQ(value: number): number[] {
  const bytes: number[] = [];
  let buffer = value & 0x7f;

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  return bytes;
}

export function generateMidiFile(
  chords: ChordDefinition[],
  bpm: number = 112,
  ticksPerQuarter: number = 480
): Uint8Array {
  const trackEvents: number[] = [];

  // 1. Set Tempo Meta Event (Microseconds per beat = 60,000,000 / BPM)
  const mpqn = Math.round(60000000 / Math.max(20, Math.min(300, bpm)));
  trackEvents.push(
    0x00, // delta time 0
    0xff, 0x51, 0x03, // Meta event: Tempo
    (mpqn >> 16) & 0xff,
    (mpqn >> 8) & 0xff,
    mpqn & 0xff
  );

  // 2. Set Time Signature Meta Event (4/4)
  trackEvents.push(
    0x00, // delta time 0
    0xff, 0x58, 0x04, // Meta event: Time Signature
    0x04, 0x02, 0x18, 0x08
  );

  // 3. Track Name Meta Event ("SoulKeys Forge Chords")
  const trackName = 'SoulKeys Forge Chords';
  const nameBytes = Array.from(new TextEncoder().encode(trackName));
  trackEvents.push(0x00, 0xff, 0x03, nameBytes.length, ...nameBytes);

  // 4. Generate Note Events for Chords
  // Each chord lasts durationBeats * ticksPerQuarter
  for (const chord of chords) {
    const beats = chord.durationBeats || 4;
    const durationTicks = Math.round(beats * ticksPerQuarter);
    const notes = chord.notes;

    // Note On for all notes in chord (delta time 0 between notes)
    for (let i = 0; i < notes.length; i++) {
      const delta = i === 0 ? 0 : 0;
      trackEvents.push(...encodeVLQ(delta));
      trackEvents.push(0x90, notes[i] & 0x7f, 0x5a); // Channel 0, Note On, Velocity 90
    }

    // Note Off for all notes in chord
    for (let i = 0; i < notes.length; i++) {
      // First note off occurs after durationTicks; subsequent note offs have delta 0
      const delta = i === 0 ? durationTicks : 0;
      trackEvents.push(...encodeVLQ(delta));
      trackEvents.push(0x80, notes[i] & 0x7f, 0x00); // Channel 0, Note Off
    }
  }

  // 5. End of Track Meta Event
  trackEvents.push(0x00, 0xff, 0x2f, 0x00);

  // Track Chunk: 'MTrk' + 4-byte length + track data
  const trackLength = trackEvents.length;
  const trackChunk: number[] = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
    ...trackEvents,
  ];

  // Header Chunk: 'MThd' + length 6 + format 0 + 1 track + ticksPerQuarter
  const headerChunk: number[] = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length 6
    0x00, 0x00,             // format 0 (single track)
    0x00, 0x01,             // 1 track
    (ticksPerQuarter >> 8) & 0xff,
    ticksPerQuarter & 0xff,
  ];

  return new Uint8Array([...headerChunk, ...trackChunk]);
}

/** Trigger direct browser download of MIDI file */
export function downloadMidiFile(
  chords: ChordDefinition[],
  bpm: number = 112,
  filename: string = 'SoulKeys_Progression.mid'
): void {
  const midiData = generateMidiFile(chords, bpm);
  const blob = new Blob([midiData.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
