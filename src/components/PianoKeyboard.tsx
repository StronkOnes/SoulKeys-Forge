import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soulKeysEngine } from '../audio/SoulKeysEngine';
import { midiToNoteName } from '../audio/DSPUtils';

interface PianoKeyboardProps {
  highlightedNotes?: number[];
  octaveShift: number;
  onOctaveShiftChange: (shift: number) => void;
  sustainHold: boolean;
  onSustainHoldChange: (hold: boolean) => void;
}

// Computer keyboard mapping for quick auditioning
const KEY_MAP: Record<string, number> = {
  // Lower octave (starting at C3 = 48 or C4 = 60)
  z: 48, s: 49, x: 50, d: 51, c: 52, v: 53, g: 54, b: 55, h: 56, n: 57, j: 58, m: 59,
  // Upper octave
  q: 60, '2': 61, w: 62, '3': 63, e: 64, r: 65, '5': 66, t: 67, '6': 68, y: 69, '7': 70, u: 71,
  i: 72, '9': 73, o: 74, '0': 75, p: 76,
};

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  highlightedNotes = [],
  octaveShift,
  onOctaveShiftChange,
  sustainHold,
  onSustainHoldChange,
}) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [velocity, setVelocity] = useState<number>(0.85);
  const [showKeyLabels, setShowKeyLabels] = useState<boolean>(true);
  const isMouseDown = useRef<boolean>(false);
  const lastPlayedNote = useRef<number | null>(null);

  // Subscribe to MIDI activity from engine (hardware controller or chord playback)
  useEffect(() => {
    const unsubscribe = soulKeysEngine.subscribeMidiActivity((note, on) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        if (on) next.add(note);
        else next.delete(note);
        return next;
      });
    });
    return unsubscribe;
  }, []);

  // Computer keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onSustainHoldChange(!sustainHold);
        soulKeysEngine.setSustainPedal(!sustainHold);
        return;
      }

      const key = e.key.toLowerCase();
      if (KEY_MAP[key] !== undefined) {
        const baseNote = KEY_MAP[key];
        const pitch = baseNote + octaveShift * 12;
        soulKeysEngine.noteOn(pitch, velocity);
        setActiveNotes((prev) => new Set(prev).add(pitch));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (KEY_MAP[key] !== undefined) {
        const baseNote = KEY_MAP[key];
        const pitch = baseNote + octaveShift * 12;
        soulKeysEngine.noteOff(pitch);
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(pitch);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [octaveShift, velocity, sustainHold, onSustainHoldChange]);

  const playNote = useCallback(
    (midiNote: number) => {
      lastPlayedNote.current = midiNote;
      soulKeysEngine.noteOn(midiNote, velocity);
      setActiveNotes((prev) => new Set(prev).add(midiNote));
    },
    [velocity]
  );

  const stopNote = useCallback((midiNote: number) => {
    soulKeysEngine.noteOff(midiNote);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(midiNote);
      return next;
    });
  }, []);

  const handlePointerDownKey = (midiNote: number, e: React.PointerEvent) => {
    e.preventDefault();
    isMouseDown.current = true;
    playNote(midiNote);
  };

  const handlePointerEnterKey = (midiNote: number) => {
    if (isMouseDown.current && lastPlayedNote.current !== midiNote) {
      if (lastPlayedNote.current !== null) {
        stopNote(lastPlayedNote.current);
      }
      playNote(midiNote);
    }
  };

  const handlePointerUp = () => {
    isMouseDown.current = false;
    if (lastPlayedNote.current !== null) {
      stopNote(lastPlayedNote.current);
      lastPlayedNote.current = null;
    }
  };

  // Build keyboard range: 3.5 octaves (e.g. C2 (36) to C6 (84) base, or C3 (48) to E6)
  // Let's render 3 octaves: C3 (48) to B5 (83), or C2 (36) to C5 (72)
  const startNote = 36 + octaveShift * 12; // C2 shifted
  const totalWhiteKeys = 28; // 4 octaves of white keys
  
  // Construct white & black keys layout
  const keys: { midi: number; isBlack: boolean; name: string }[] = [];
  const whiteNotesOnly: number[] = [];

  for (let note = startNote; note <= startNote + 48; note++) {
    const isBlack = [1, 3, 6, 8, 10].includes(note % 12);
    keys.push({
      midi: note,
      isBlack,
      name: midiToNoteName(note),
    });
    if (!isBlack) {
      whiteNotesOnly.push(note);
    }
  }

  return (
    <div
      className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2.5 select-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Keyboard Controls Toolbar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          {/* Octave Shift */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Octave:</span>
            <div className="flex items-center bg-[#101724] border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => onOctaveShiftChange(Math.max(-2, octaveShift - 1))}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Shift Octave Down (-)"
              >
                -
              </button>
              <span className="w-7 text-center font-mono text-[11px] text-amber-400 font-semibold">
                {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
              </span>
              <button
                onClick={() => onOctaveShiftChange(Math.min(2, octaveShift + 1))}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Shift Octave Up (+)"
              >
                +
              </button>
            </div>
          </div>

          {/* Velocity Control */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Vel:</span>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              title={`Key Velocity: ${Math.round(velocity * 127)}`}
            />
            <span className="font-mono text-[10px] text-slate-400 w-6">
              {Math.round(velocity * 127)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sustain Pedal Toggle */}
          <button
            onClick={() => {
              const next = !sustainHold;
              onSustainHoldChange(next);
              soulKeysEngine.setSustainPedal(next);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              sustainHold
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-[#101724] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Sustain [Space]
          </button>

          {/* Labels toggle */}
          <button
            onClick={() => setShowKeyLabels(!showKeyLabels)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              showKeyLabels
                ? 'bg-[#151E2E] text-slate-300 border-slate-700'
                : 'bg-[#101724] text-slate-500 border-slate-800'
            }`}
          >
            Labels
          </button>

          {/* Panic Button */}
          <button
            onClick={() => soulKeysEngine.panicAllNotesOff()}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#101724] text-rose-400 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900/50 transition-colors"
            title="Panic / All Notes Off"
          >
            Panic
          </button>
        </div>
      </div>

      {/* Piano Keys Deck */}
      <div className="relative h-36 bg-[#080C14] rounded-xl p-1 border border-slate-900 overflow-x-auto shadow-inner flex">
        {/* White Keys Row */}
        <div className="flex w-full h-full relative">
          {whiteNotesOnly.map((whiteNote) => {
            const isActive = activeNotes.has(whiteNote);
            const isHighlighted = highlightedNotes.includes(whiteNote);
            const noteName = midiToNoteName(whiteNote);

            return (
              <div
                key={`white-${whiteNote}`}
                onPointerDown={(e) => handlePointerDownKey(whiteNote, e)}
                onPointerEnter={() => handlePointerEnterKey(whiteNote)}
                className={`relative flex-1 h-full rounded-b-md border-r border-slate-700/60 transition-colors cursor-pointer select-none flex flex-col justify-end items-center pb-1.5 ${
                  isActive
                    ? 'bg-gradient-to-t from-amber-400 to-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.6)] z-10'
                    : isHighlighted
                    ? 'bg-amber-950/40 border-amber-600/50'
                    : 'bg-[#EAEFF5] hover:bg-white active:bg-slate-200'
                }`}
              >
                {/* Note Label */}
                {showKeyLabels && (
                  <span
                    className={`text-[9px] font-mono pointer-events-none ${
                      isActive ? 'text-amber-950 font-bold' : isHighlighted ? 'text-amber-400 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {noteName.startsWith('C') ? noteName : noteName.slice(0, 1)}
                  </span>
                )}
              </div>
            );
          })}

          {/* Black Keys Overlay */}
          {whiteNotesOnly.map((whiteNote, index) => {
            // Check if there is a black key right after this white key
            const noteInOctave = whiteNote % 12;
            const hasBlackKey = [0, 2, 5, 7, 9].includes(noteInOctave); // C, D, F, G, A
            if (!hasBlackKey) return null;

            const blackNote = whiteNote + 1;
            const isActive = activeNotes.has(blackNote);
            const isHighlighted = highlightedNotes.includes(blackNote);
            const noteName = midiToNoteName(blackNote);

            // Position black key between current white key and next white key
            // Left offset based on percentage of white keys
            const leftPercent = ((index + 1) / whiteNotesOnly.length) * 100;

            return (
              <div
                key={`black-${blackNote}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handlePointerDownKey(blackNote, e);
                }}
                onPointerEnter={(e) => {
                  e.stopPropagation();
                  handlePointerEnterKey(blackNote);
                }}
                style={{
                  left: `calc(${leftPercent}% - 0.95%)`,
                  width: '1.9%',
                }}
                className={`absolute top-0 h-[62%] rounded-b-sm border border-black z-20 cursor-pointer transition-colors flex flex-col justify-end items-center pb-1 ${
                  isActive
                    ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                    : isHighlighted
                    ? 'bg-amber-800 border-amber-500'
                    : 'bg-[#151A24] hover:bg-[#1E2534]'
                }`}
              >
                {showKeyLabels && isHighlighted && (
                  <span className="text-[8px] font-mono text-amber-200 pointer-events-none">
                    #
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
