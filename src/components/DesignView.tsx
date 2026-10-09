import React from 'react';
import {
  SoulKeysState,
  FilterType,
  LfoWaveform,
  LfoTarget,
  LayerParams,
} from '../audio/types';
import { Knob } from './Knob';

interface DesignViewProps {
  state: SoulKeysState;
  onStateChange: (patch: Partial<SoulKeysState>) => void;
}

export const DesignView: React.FC<DesignViewProps> = ({ state, onStateChange }) => {
  const updateLayer = (key: 'layerKeys' | 'layerWarmth' | 'layerPad', patch: Partial<LayerParams>) => {
    onStateChange({
      [key]: {
        ...state[key],
        ...patch,
      },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Tri-Layer Mixer (Keys, Warmth, Pad) */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Tri-Layer Architecture & Blending
            </h3>
            <p className="text-[11px] text-slate-400">
              Combine three distinct synthesis engines: electric keys tine, warm harmonic body, and atmospheric pad.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Layer Mix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer 1: Electric Keys */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.layerKeys.enabled}
                  onChange={(e) => updateLayer('layerKeys', { enabled: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">1. Electric Keys</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateLayer('layerKeys', { mute: !state.layerKeys.mute })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    state.layerKeys.mute
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-[#151D2C] text-slate-400 border-slate-800'
                  }`}
                >
                  Mute
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 justify-items-center mb-3">
              <Knob
                label="Vol"
                value={state.layerKeys.volume}
                unit="%"
                size={44}
                onChange={(v) => updateLayer('layerKeys', { volume: v })}
              />
              <Knob
                label="Pan"
                value={state.layerKeys.pan}
                min={-1}
                max={1}
                defaultValue={0}
                size={44}
                formatValue={(v) => (v === 0 ? 'C' : v < 0 ? `L${Math.round(-v * 50)}` : `R${Math.round(v * 50)}`)}
                onChange={(v) => updateLayer('layerKeys', { pan: v })}
              />
              <Knob
                label="Detune"
                value={state.layerKeys.detune}
                min={-50}
                max={50}
                defaultValue={0}
                unit="ct"
                size={44}
                onChange={(v) => updateLayer('layerKeys', { detune: v })}
              />
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 mb-1">Octave</span>
                <select
                  value={state.layerKeys.octave}
                  onChange={(e) => updateLayer('layerKeys', { octave: parseInt(e.target.value) })}
                  className="bg-[#151D2C] border border-slate-800 rounded text-[11px] font-mono text-slate-200 px-1.5 py-1"
                >
                  <option value="-1">-1</option>
                  <option value="0">0</option>
                  <option value="1">+1</option>
                </select>
              </div>
            </div>

            {/* Electric Keys Engine Details */}
            <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Bell Tine"
                value={state.electricKeys.bell}
                unit="%"
                size={40}
                onChange={(v) => onStateChange({ electricKeys: { ...state.electricKeys, bell: v } })}
              />
              <Knob
                label="Tine Ratio"
                value={state.electricKeys.tineRatio}
                min={2.0}
                max={8.0}
                size={40}
                formatValue={(v) => `${v.toFixed(2)}x`}
                onChange={(v) => onStateChange({ electricKeys: { ...state.electricKeys, tineRatio: v } })}
              />
              <Knob
                label="Mallet"
                value={state.electricKeys.malletClick}
                unit="%"
                size={40}
                onChange={(v) => onStateChange({ electricKeys: { ...state.electricKeys, malletClick: v } })}
              />
            </div>
          </div>

          {/* Layer 2: Warm Keys */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.layerWarmth.enabled}
                  onChange={(e) => updateLayer('layerWarmth', { enabled: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">2. Warm Keys</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateLayer('layerWarmth', { mute: !state.layerWarmth.mute })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    state.layerWarmth.mute
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-[#151D2C] text-slate-400 border-slate-800'
                  }`}
                >
                  Mute
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 justify-items-center mb-3">
              <Knob
                label="Vol"
                value={state.layerWarmth.volume}
                unit="%"
                size={44}
                onChange={(v) => updateLayer('layerWarmth', { volume: v })}
              />
              <Knob
                label="Pan"
                value={state.layerWarmth.pan}
                min={-1}
                max={1}
                defaultValue={0}
                size={44}
                formatValue={(v) => (v === 0 ? 'C' : v < 0 ? `L${Math.round(-v * 50)}` : `R${Math.round(v * 50)}`)}
                onChange={(v) => updateLayer('layerWarmth', { pan: v })}
              />
              <Knob
                label="Detune"
                value={state.layerWarmth.detune}
                min={-50}
                max={50}
                defaultValue={0}
                unit="ct"
                size={44}
                onChange={(v) => updateLayer('layerWarmth', { detune: v })}
              />
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 mb-1">Octave</span>
                <select
                  value={state.layerWarmth.octave}
                  onChange={(e) => updateLayer('layerWarmth', { octave: parseInt(e.target.value) })}
                  className="bg-[#151D2C] border border-slate-800 rounded text-[11px] font-mono text-slate-200 px-1.5 py-1"
                >
                  <option value="-1">-1</option>
                  <option value="0">0</option>
                  <option value="1">+1</option>
                </select>
              </div>
            </div>

            {/* Warm Keys Engine Details */}
            <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Shape Blend"
                value={state.warmKeys.waveformBlend}
                unit="%"
                size={40}
                onChange={(v) => onStateChange({ warmKeys: { ...state.warmKeys, waveformBlend: v } })}
              />
              <Knob
                label="Warm Drive"
                value={state.warmKeys.warmSaturation}
                unit="%"
                size={40}
                onChange={(v) => onStateChange({ warmKeys: { ...state.warmKeys, warmSaturation: v } })}
              />
              <Knob
                label="Vel Bright"
                value={state.warmKeys.velocityBrightness}
                unit="%"
                size={40}
                onChange={(v) => onStateChange({ warmKeys: { ...state.warmKeys, velocityBrightness: v } })}
              />
            </div>
          </div>

          {/* Layer 3: Pad Layer */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.layerPad.enabled}
                  onChange={(e) => updateLayer('layerPad', { enabled: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">3. Atmospheric Pad</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateLayer('layerPad', { mute: !state.layerPad.mute })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    state.layerPad.mute
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-[#151D2C] text-slate-400 border-slate-800'
                  }`}
                >
                  Mute
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 justify-items-center mb-3">
              <Knob
                label="Vol"
                value={state.layerPad.volume}
                unit="%"
                size={44}
                onChange={(v) => updateLayer('layerPad', { volume: v })}
              />
              <Knob
                label="Pan"
                value={state.layerPad.pan}
                min={-1}
                max={1}
                defaultValue={0}
                size={44}
                formatValue={(v) => (v === 0 ? 'C' : v < 0 ? `L${Math.round(-v * 50)}` : `R${Math.round(v * 50)}`)}
                onChange={(v) => updateLayer('layerPad', { pan: v })}
              />
              <Knob
                label="Detune"
                value={state.layerPad.detune}
                min={-50}
                max={50}
                defaultValue={0}
                unit="ct"
                size={44}
                onChange={(v) => updateLayer('layerPad', { detune: v })}
              />
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 mb-1">Octave</span>
                <select
                  value={state.layerPad.octave}
                  onChange={(e) => updateLayer('layerPad', { octave: parseInt(e.target.value) })}
                  className="bg-[#151D2C] border border-slate-800 rounded text-[11px] font-mono text-slate-200 px-1.5 py-1"
                >
                  <option value="-1">-1</option>
                  <option value="0">0</option>
                  <option value="1">+1</option>
                </select>
              </div>
            </div>

            {/* Pad Engine Details */}
            <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Stereo Width"
                value={state.pad.stereoSpread}
                unit="%"
                size={40}
                onChange={(v) => onStateChange({ pad: { ...state.pad, stereoSpread: v } })}
              />
              <Knob
                label="Attack"
                value={state.pad.attackTime}
                min={0.05}
                max={3.0}
                size={40}
                formatValue={(v) => `${v.toFixed(2)}s`}
                onChange={(v) => onStateChange({ pad: { ...state.pad, attackTime: v } })}
              />
              <Knob
                label="Release"
                value={state.pad.releaseTime}
                min={0.1}
                max={5.0}
                size={40}
                formatValue={(v) => `${v.toFixed(1)}s`}
                onChange={(v) => onStateChange({ pad: { ...state.pad, releaseTime: v } })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter, Envelopes & Modulation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filter Section */}
        <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-200">State Filter</h4>
            <select
              value={state.filter.type}
              onChange={(e) => onStateChange({ filter: { ...state.filter, type: e.target.value as FilterType } })}
              className="bg-[#151D2C] border border-slate-800 rounded px-2 py-0.5 text-[11px] text-amber-300 font-mono"
            >
              <option value="lowpass">Lowpass 12dB</option>
              <option value="warm_ladder">Warm Ladder 24dB</option>
              <option value="bandpass">Bandpass</option>
              <option value="highpass">Highpass</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-2 justify-items-center">
            <Knob
              label="Cutoff"
              value={state.filter.cutoff}
              min={100}
              max={18000}
              size={48}
              formatValue={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}Hz`)}
              onChange={(v) => onStateChange({ filter: { ...state.filter, cutoff: v } })}
            />
            <Knob
              label="Resonance"
              value={state.filter.resonance}
              min={0.5}
              max={10.0}
              size={48}
              formatValue={(v) => v.toFixed(1)}
              onChange={(v) => onStateChange({ filter: { ...state.filter, resonance: v } })}
            />
            <Knob
              label="Env Amt"
              value={state.filter.envelopeAmount}
              min={-1}
              max={1}
              defaultValue={0}
              size={48}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => onStateChange({ filter: { ...state.filter, envelopeAmount: v } })}
            />
            <Knob
              label="Key Track"
              value={state.filter.keyTracking}
              unit="%"
              size={48}
              onChange={(v) => onStateChange({ filter: { ...state.filter, keyTracking: v } })}
            />
          </div>
        </div>

        {/* Amplitude Envelope (ADSR) */}
        <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-200">Amp Envelope (ADSR)</h4>
            <span className="text-[10px] font-mono text-slate-400">Master Gain</span>
          </div>

          <div className="grid grid-cols-4 gap-2 justify-items-center">
            <Knob
              label="Attack"
              value={state.ampEnvelope.attack}
              min={0.005}
              max={1.5}
              size={48}
              formatValue={(v) => `${(v * 1000).toFixed(0)}ms`}
              onChange={(v) => onStateChange({ ampEnvelope: { ...state.ampEnvelope, attack: v } })}
            />
            <Knob
              label="Decay"
              value={state.ampEnvelope.decay}
              min={0.1}
              max={6.0}
              size={48}
              formatValue={(v) => `${v.toFixed(1)}s`}
              onChange={(v) => onStateChange({ ampEnvelope: { ...state.ampEnvelope, decay: v } })}
            />
            <Knob
              label="Sustain"
              value={state.ampEnvelope.sustain}
              unit="%"
              size={48}
              onChange={(v) => onStateChange({ ampEnvelope: { ...state.ampEnvelope, sustain: v } })}
            />
            <Knob
              label="Release"
              value={state.ampEnvelope.release}
              min={0.05}
              max={6.0}
              size={48}
              formatValue={(v) => `${v.toFixed(1)}s`}
              onChange={(v) => onStateChange({ ampEnvelope: { ...state.ampEnvelope, release: v } })}
            />
          </div>
        </div>

        {/* Modulation LFO */}
        <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.lfo.enabled}
                onChange={(e) => onStateChange({ lfo: { ...state.lfo, enabled: e.target.checked } })}
                className="rounded accent-amber-500"
              />
              <h4 className="text-xs font-semibold text-slate-200">Modulation LFO</h4>
            </div>
            <select
              value={state.lfo.target}
              onChange={(e) => onStateChange({ lfo: { ...state.lfo, target: e.target.value as LfoTarget } })}
              className="bg-[#151D2C] border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-mono"
            >
              <option value="pan">Auto-Pan</option>
              <option value="pitch">Vibrato (Pitch)</option>
              <option value="cutoff">Filter Cutoff</option>
              <option value="amplitude">Tremolo (Gain)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 justify-items-center">
            <Knob
              label="Rate"
              value={state.lfo.rate}
              min={0.1}
              max={15.0}
              size={48}
              formatValue={(v) => `${v.toFixed(1)}Hz`}
              onChange={(v) => onStateChange({ lfo: { ...state.lfo, rate: v } })}
            />
            <Knob
              label="Depth"
              value={state.lfo.depth}
              unit="%"
              size={48}
              onChange={(v) => onStateChange({ lfo: { ...state.lfo, depth: v } })}
            />
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 mb-1">Waveform</span>
              <select
                value={state.lfo.waveform}
                onChange={(e) => onStateChange({ lfo: { ...state.lfo, waveform: e.target.value as LfoWaveform } })}
                className="bg-[#151D2C] border border-slate-800 rounded text-[11px] text-slate-200 px-2 py-1 font-mono"
              >
                <option value="sine">Sine</option>
                <option value="triangle">Tri</option>
                <option value="square">Square</option>
                <option value="random">S&H</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Studio Effects Rack (Section 8 of Master Plan) */}
      <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Built-in Studio Effects Rack</h3>
            <p className="text-[11px] text-slate-400">
              Discrete analog saturation, dimensional chorus, tempo-synced ping-pong delay, and algorithmic reverb.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            FX Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Saturation */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={state.saturation.enabled}
                  onChange={(e) => onStateChange({ saturation: { ...state.saturation, enabled: e.target.checked } })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">Tape Saturation</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Drive"
                value={state.saturation.drive}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ saturation: { ...state.saturation, drive: v } })}
              />
              <Knob
                label="Color"
                value={state.saturation.color}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ saturation: { ...state.saturation, color: v } })}
              />
              <Knob
                label="Mix"
                value={state.saturation.mix}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ saturation: { ...state.saturation, mix: v } })}
              />
            </div>
          </div>

          {/* Chorus */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={state.chorus.enabled}
                  onChange={(e) => onStateChange({ chorus: { ...state.chorus, enabled: e.target.checked } })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">Stereo Chorus</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Rate"
                value={state.chorus.rate}
                min={0.1}
                max={4.0}
                size={44}
                formatValue={(v) => `${v.toFixed(1)}Hz`}
                onChange={(v) => onStateChange({ chorus: { ...state.chorus, rate: v } })}
              />
              <Knob
                label="Depth"
                value={state.chorus.depth}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ chorus: { ...state.chorus, depth: v } })}
              />
              <Knob
                label="Mix"
                value={state.chorus.mix}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ chorus: { ...state.chorus, mix: v } })}
              />
            </div>
          </div>

          {/* Delay */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={state.delay.enabled}
                  onChange={(e) => onStateChange({ delay: { ...state.delay, enabled: e.target.checked } })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">Ping-Pong Delay</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Time"
                value={state.delay.time}
                min={0.05}
                max={1.0}
                size={44}
                formatValue={(v) => `${(v * 1000).toFixed(0)}ms`}
                onChange={(v) => onStateChange({ delay: { ...state.delay, time: v } })}
              />
              <Knob
                label="Feedback"
                value={state.delay.feedback}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ delay: { ...state.delay, feedback: v } })}
              />
              <Knob
                label="Mix"
                value={state.delay.mix}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ delay: { ...state.delay, mix: v } })}
              />
            </div>
          </div>

          {/* Reverb */}
          <div className="bg-[#0F1420] border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={state.reverb.enabled}
                  onChange={(e) => onStateChange({ reverb: { ...state.reverb, enabled: e.target.checked } })}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-200">Convolver Reverb</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 justify-items-center">
              <Knob
                label="Decay"
                value={state.reverb.size}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ reverb: { ...state.reverb, size: v } })}
              />
              <Knob
                label="Damping"
                value={state.reverb.damping}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ reverb: { ...state.reverb, damping: v } })}
              />
              <Knob
                label="Mix"
                value={state.reverb.mix}
                unit="%"
                size={44}
                onChange={(v) => onStateChange({ reverb: { ...state.reverb, mix: v } })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
