import React, { useEffect, useRef, useState } from 'react';
import { soulKeysEngine } from '../audio/SoulKeysEngine';

export const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'wave' | 'spectrum'>('wave');
  const [levels, setLevels] = useState<{ left: number; right: number }>({ left: 0, right: 0 });

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const { waveform, spectrum } = soulKeysEngine.getVisualizerData();

          // Background
          ctx.fillStyle = '#080C14';
          ctx.fillRect(0, 0, width, height);

          // Subtle grid lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.moveTo(width / 4, 0);
          ctx.lineTo(width / 4, height);
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width / 2, height);
          ctx.moveTo((3 * width) / 4, 0);
          ctx.lineTo((3 * width) / 4, height);
          ctx.stroke();

          if (mode === 'wave') {
            // Oscilloscope Waveform
            ctx.beginPath();
            ctx.strokeStyle = '#F59E0B';
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 6;
            ctx.lineWidth = 1.8;

            const sliceWidth = width / waveform.length;
            let x = 0;

            for (let i = 0; i < waveform.length; i++) {
              const v = waveform[i] / 128.0;
              const y = (v * height) / 2;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              x += sliceWidth;
            }
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
          } else {
            // Frequency Spectrum Bars
            const barCount = 48;
            const barWidth = (width / barCount) - 2;

            for (let i = 0; i < barCount; i++) {
              const binIndex = Math.floor(Math.pow(i / barCount, 1.6) * (spectrum.length / 2));
              const magnitude = spectrum[binIndex] || 0;
              const percent = magnitude / 255;
              const barHeight = Math.max(2, percent * (height - 8));
              const x = i * (barWidth + 2);
              const y = height - barHeight;

              // Amber gradient
              const grad = ctx.createLinearGradient(0, y, 0, height);
              grad.addColorStop(0, '#FBBF24');
              grad.addColorStop(1, '#B45309');

              ctx.fillStyle = grad;
              ctx.fillRect(x, y, barWidth, barHeight);
            }
          }
        }
      }

      // Update Peak Meter
      setLevels(soulKeysEngine.getOutputLevels());
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode]);

  return (
    <div className="flex items-center gap-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl p-2.5">
      {/* Visualizer Canvas & Mode Switcher */}
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500">
            Realtime Scope
          </span>
          <div className="flex items-center gap-1 bg-[#101624] p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setMode('wave')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'wave'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wave
            </button>
            <button
              onClick={() => setMode('spectrum')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'spectrum'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spectrum
            </button>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-slate-800/70">
          <canvas
            ref={canvasRef}
            width={260}
            height={68}
            className="w-full h-[68px] block"
          />
        </div>
      </div>

      {/* Dual Peak Meters (L and R) */}
      <div className="flex flex-col gap-1 items-center self-stretch justify-center pl-1 border-l border-slate-800/80">
        <span className="text-[9px] font-mono text-slate-500">L/R</span>
        <div className="flex gap-1 h-[68px]">
          {/* L meter */}
          <div className="w-1.5 bg-[#101624] rounded-sm overflow-hidden flex flex-col justify-end p-[1px]">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
              style={{ height: `${Math.min(100, levels.left * 100)}%` }}
            />
          </div>
          {/* R meter */}
          <div className="w-1.5 bg-[#101624] rounded-sm overflow-hidden flex flex-col justify-end p-[1px]">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
              style={{ height: `${Math.min(100, levels.right * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
