import {
  SoulKeysState,
  VelocityCurveType,
  VoiceMode,
  LayerParams,
  ElectricKeysParams,
  WarmKeysParams,
  PadParams,
  FilterParams,
  EnvelopeParams,
  LfoParams,
  ChorusParams,
  DelayParams,
  ReverbParams,
  SaturationParams,
  ChordDefinition,
} from './types';
import {
  midiToFreq,
  processVelocity,
  makeSaturationCurve,
  createReverbImpulse,
  clamp,
} from './DSPUtils';
import { DEFAULT_SOULKEYS_STATE } from '../presets/defaultState';

interface VoiceNodes {
  midiNote: number;
  velocity: number;
  startTime: number;
  released: boolean;
  heldBySustain: boolean;

  // Layer 1: Electric Keys
  eFundamental?: OscillatorNode;
  eFundamentalGain?: GainNode;
  eBell?: OscillatorNode;
  eBellGain?: GainNode;
  eMalletGain?: GainNode;
  eMalletSource?: AudioBufferSourceNode;

  // Layer 2: Warm Keys
  wOsc1?: OscillatorNode;
  wOsc2?: OscillatorNode;
  wMixGain?: GainNode;

  // Layer 3: Pad
  pOscL?: OscillatorNode;
  pOscR?: OscillatorNode;
  pPanL?: StereoPannerNode;
  pPanR?: StereoPannerNode;
  pMixGain?: GainNode;

  // Voice Sum & Shaping
  voiceFilter: BiquadFilterNode;
  voiceGain: GainNode;
  voicePan: StereoPannerNode;
}

export class SoulKeysEngine {
  private ctx: AudioContext | null = null;
  private state: SoulKeysState = JSON.parse(JSON.stringify(DEFAULT_SOULKEYS_STATE));

  // Voice Management
  private maxPolyphony: number = 24;
  private activeVoices: Map<number, VoiceNodes> = new Map();
  private sustainPedalDown: boolean = false;
  private currentPitchBendSemitones: number = 0;
  private currentModWheelValue: number = 0;

  // Mallet click buffer
  private malletBuffer: AudioBuffer | null = null;

  // Master Audio Graph
  private layerKeysBus!: GainNode;
  private layerWarmthBus!: GainNode;
  private layerPadBus!: GainNode;
  private preFilterBus!: GainNode;

  // Global Filter
  private globalFilter!: BiquadFilterNode;
  private globalFilterLadder!: BiquadFilterNode;

  // Saturation
  private satPreGain!: GainNode;
  private satShaper!: WaveShaperNode;
  private satPostGain!: GainNode;
  private satDryGain!: GainNode;
  private satWetGain!: GainNode;
  private satOutBus!: GainNode;

  // Chorus
  private chorusDelayL!: DelayNode;
  private chorusDelayR!: DelayNode;
  private chorusLfo!: OscillatorNode;
  private chorusLfoGainL!: GainNode;
  private chorusLfoGainR!: GainNode;
  private chorusDryGain!: GainNode;
  private chorusWetGain!: GainNode;
  private chorusOutBus!: GainNode;

  // Delay
  private delayNodeL!: DelayNode;
  private delayNodeR!: DelayNode;
  private delayFeedbackL!: GainNode;
  private delayFeedbackR!: GainNode;
  private delayFilterL!: BiquadFilterNode;
  private delayFilterR!: BiquadFilterNode;
  private delayDryGain!: GainNode;
  private delayWetGain!: GainNode;
  private delayOutBus!: GainNode;

  // Reverb
  private reverbConvolver!: ConvolverNode;
  private reverbDryGain!: GainNode;
  private reverbWetGain!: GainNode;
  private reverbOutBus!: GainNode;

  // LFO (Global Modulation)
  private modLfo!: OscillatorNode;
  private modLfoGain!: GainNode;
  private modLfoPanTarget!: StereoPannerNode;

  // Master Output & Analyser
  private masterGain!: GainNode;
  private masterLimiter!: DynamicsCompressorNode;
  private analyserNode!: AnalyserNode;

  // Visual Metering
  private leftLevel: number = 0;
  private rightLevel: number = 0;

  // MIDI & Listeners
  private midiAccess: any = null;
  private midiInputs: { id: string; name: string }[] = [];
  private onMidiActivityCallbacks: Set<(note: number, on: boolean) => void> = new Set();
  private onDeviceChangeCallbacks: Set<(devices: string[]) => void> = new Set();

  // Progression Sequencer
  private loopTimer: any = null;
  private loopSubTimers: any[] = [];
  private loopPlaying: boolean = false;
  private loopCurrentStep: number = -1;
  private loopChords: ChordDefinition[] = [];
  private loopBpm: number = 112;
  private loopHumanize: boolean = true;
  private loopStepCallbacks: Set<(step: number, chord: ChordDefinition | null) => void> = new Set();

  constructor() {
    // Lazy audio context initialization on first user interaction
  }

  public async initAudio(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    this.createMalletClickBuffer();
    this.buildMasterGraph();
    this.applyAllParameters();
    this.initMidi();
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public isRunning(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  private createMalletClickBuffer(): void {
    if (!this.ctx) return;
    const length = Math.floor(this.ctx.sampleRate * 0.015); // 15ms transient click
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // High-passed dampened click burst
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 22) * Math.sin(t * Math.PI * 18);
    }
    this.malletBuffer = buffer;
  }

  private buildMasterGraph(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Layer Busses
    this.layerKeysBus = ctx.createGain();
    this.layerWarmthBus = ctx.createGain();
    this.layerPadBus = ctx.createGain();
    this.preFilterBus = ctx.createGain();

    this.layerKeysBus.connect(this.preFilterBus);
    this.layerWarmthBus.connect(this.preFilterBus);
    this.layerPadBus.connect(this.preFilterBus);

    // Global Filters
    this.globalFilter = ctx.createBiquadFilter();
    this.globalFilterLadder = ctx.createBiquadFilter();
    this.preFilterBus.connect(this.globalFilter);
    this.globalFilter.connect(this.globalFilterLadder);

    // Saturation Stage
    this.satPreGain = ctx.createGain();
    this.satShaper = ctx.createWaveShaper();
    this.satShaper.oversample = '4x';
    this.satPostGain = ctx.createGain();
    this.satDryGain = ctx.createGain();
    this.satWetGain = ctx.createGain();
    this.satOutBus = ctx.createGain();

    this.globalFilterLadder.connect(this.satDryGain);
    this.satDryGain.connect(this.satOutBus);

    this.globalFilterLadder.connect(this.satPreGain);
    this.satPreGain.connect(this.satShaper);
    this.satShaper.connect(this.satPostGain);
    this.satPostGain.connect(this.satWetGain);
    this.satWetGain.connect(this.satOutBus);

    // Chorus Stage
    this.chorusDelayL = ctx.createDelay(0.1);
    this.chorusDelayR = ctx.createDelay(0.1);
    this.chorusDelayL.delayTime.value = 0.024;
    this.chorusDelayR.delayTime.value = 0.032;

    this.chorusLfo = ctx.createOscillator();
    this.chorusLfo.frequency.value = 0.85;
    this.chorusLfoGainL = ctx.createGain();
    this.chorusLfoGainR = ctx.createGain();
    this.chorusLfoGainL.gain.value = 0.0035;
    this.chorusLfoGainR.gain.value = -0.0035;

    this.chorusLfo.connect(this.chorusLfoGainL);
    this.chorusLfo.connect(this.chorusLfoGainR);
    this.chorusLfoGainL.connect(this.chorusDelayL.delayTime);
    this.chorusLfoGainR.connect(this.chorusDelayR.delayTime);
    this.chorusLfo.start();

    this.chorusDryGain = ctx.createGain();
    this.chorusWetGain = ctx.createGain();
    this.chorusOutBus = ctx.createGain();

    const chorusMerger = ctx.createChannelMerger(2);
    this.chorusDelayL.connect(chorusMerger, 0, 0);
    this.chorusDelayR.connect(chorusMerger, 0, 1);

    this.satOutBus.connect(this.chorusDryGain);
    this.chorusDryGain.connect(this.chorusOutBus);

    this.satOutBus.connect(this.chorusDelayL);
    this.satOutBus.connect(this.chorusDelayR);
    chorusMerger.connect(this.chorusWetGain);
    this.chorusWetGain.connect(this.chorusOutBus);

    // Delay Stage
    this.delayNodeL = ctx.createDelay(2.0);
    this.delayNodeR = ctx.createDelay(2.0);
    this.delayFeedbackL = ctx.createGain();
    this.delayFeedbackR = ctx.createGain();
    this.delayFilterL = ctx.createBiquadFilter();
    this.delayFilterR = ctx.createBiquadFilter();
    this.delayFilterL.type = 'lowpass';
    this.delayFilterR.type = 'lowpass';
    this.delayFilterL.frequency.value = 3500;
    this.delayFilterR.frequency.value = 3500;

    this.delayDryGain = ctx.createGain();
    this.delayWetGain = ctx.createGain();
    this.delayOutBus = ctx.createGain();

    // Ping-pong cross routing
    this.delayNodeL.connect(this.delayFilterL);
    this.delayFilterL.connect(this.delayFeedbackL);
    this.delayFeedbackL.connect(this.delayNodeR); // cross to R

    this.delayNodeR.connect(this.delayFilterR);
    this.delayFilterR.connect(this.delayFeedbackR);
    this.delayFeedbackR.connect(this.delayNodeL); // cross to L

    const delayMerger = ctx.createChannelMerger(2);
    this.delayFilterL.connect(delayMerger, 0, 0);
    this.delayFilterR.connect(delayMerger, 0, 1);

    this.chorusOutBus.connect(this.delayDryGain);
    this.delayDryGain.connect(this.delayOutBus);

    this.chorusOutBus.connect(this.delayNodeL);
    delayMerger.connect(this.delayWetGain);
    this.delayWetGain.connect(this.delayOutBus);

    // Reverb Stage
    this.reverbConvolver = ctx.createConvolver();
    this.reverbDryGain = ctx.createGain();
    this.reverbWetGain = ctx.createGain();
    this.reverbOutBus = ctx.createGain();

    this.updateReverbImpulse();

    this.delayOutBus.connect(this.reverbDryGain);
    this.reverbDryGain.connect(this.reverbOutBus);

    this.delayOutBus.connect(this.reverbConvolver);
    this.reverbConvolver.connect(this.reverbWetGain);
    this.reverbWetGain.connect(this.reverbOutBus);

    // Global Modulation LFO (Tremolo / Auto-pan / Wah)
    this.modLfo = ctx.createOscillator();
    this.modLfoGain = ctx.createGain();
    this.modLfoPanTarget = ctx.createStereoPanner();

    this.modLfo.connect(this.modLfoGain);
    this.modLfoGain.connect(this.modLfoPanTarget.pan);
    this.modLfo.start();

    this.reverbOutBus.connect(this.modLfoPanTarget);

    // Master Output & Limiter Stage
    this.masterGain = ctx.createGain();
    this.masterLimiter = ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.value = -1.5;
    this.masterLimiter.knee.value = 4.0;
    this.masterLimiter.ratio.value = 12.0;
    this.masterLimiter.attack.value = 0.003;
    this.masterLimiter.release.value = 0.15;

    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.analyserNode.smoothingTimeConstant = 0.85;

    this.modLfoPanTarget.connect(this.masterGain);
    this.masterGain.connect(this.masterLimiter);
    this.masterLimiter.connect(this.analyserNode);
    this.analyserNode.connect(ctx.destination);
  }

  private updateReverbImpulse(): void {
    if (!this.ctx || !this.reverbConvolver) return;
    const duration = 1.0 + this.state.reverb.size * 3.5;
    const decay = 3.5 - this.state.reverb.size * 2.2;
    this.reverbConvolver.buffer = createReverbImpulse(
      this.ctx,
      duration,
      decay,
      this.state.reverb.damping
    );
  }

  // --- Parameter Application ---

  public setState(newState: Partial<SoulKeysState>): void {
    this.state = {
      ...this.state,
      ...newState,
      macros: { ...this.state.macros, ...(newState.macros || {}) },
      layerKeys: { ...this.state.layerKeys, ...(newState.layerKeys || {}) },
      layerWarmth: { ...this.state.layerWarmth, ...(newState.layerWarmth || {}) },
      layerPad: { ...this.state.layerPad, ...(newState.layerPad || {}) },
      electricKeys: { ...this.state.electricKeys, ...(newState.electricKeys || {}) },
      warmKeys: { ...this.state.warmKeys, ...(newState.warmKeys || {}) },
      pad: { ...this.state.pad, ...(newState.pad || {}) },
      filter: { ...this.state.filter, ...(newState.filter || {}) },
      ampEnvelope: { ...this.state.ampEnvelope, ...(newState.ampEnvelope || {}) },
      filterEnvelope: { ...this.state.filterEnvelope, ...(newState.filterEnvelope || {}) },
      lfo: { ...this.state.lfo, ...(newState.lfo || {}) },
      chorus: { ...this.state.chorus, ...(newState.chorus || {}) },
      delay: { ...this.state.delay, ...(newState.delay || {}) },
      reverb: { ...this.state.reverb, ...(newState.reverb || {}) },
      saturation: { ...this.state.saturation, ...(newState.saturation || {}) },
    };

    this.applyAllParameters();
  }

  public getState(): SoulKeysState {
    return this.state;
  }

  public setMacro(key: keyof SoulKeysState['macros'], value: number): void {
    const val = clamp(value, 0, 1);
    this.state.macros[key] = val;

    // Map macro knobs seamlessly to underlying DSP targets
    switch (key) {
      case 'warmth':
        this.state.warmKeys.warmSaturation = 0.2 + val * 0.7;
        this.state.saturation.drive = 0.1 + val * 0.65;
        this.state.electricKeys.bodyTone = 0.4 + val * 0.55;
        break;
      case 'brightness':
        this.state.filter.cutoff = 800 + Math.pow(val, 2) * 16000;
        this.state.electricKeys.bell = val;
        break;
      case 'bell':
        this.state.electricKeys.bell = val;
        break;
      case 'body':
        this.state.electricKeys.bodyTone = val;
        this.state.layerWarmth.volume = 0.2 + val * 0.7;
        break;
      case 'attack':
        this.state.ampEnvelope.attack = 0.005 + Math.pow(val, 2) * 0.8;
        this.state.pad.attackTime = 0.1 + val * 2.5;
        break;
      case 'decay':
        this.state.ampEnvelope.decay = 0.3 + val * 5.0;
        this.state.electricKeys.decayTime = 0.5 + val * 5.5;
        break;
      case 'release':
        this.state.ampEnvelope.release = 0.08 + Math.pow(val, 1.8) * 3.5;
        this.state.pad.releaseTime = 0.2 + val * 4.0;
        break;
      case 'movement':
        this.state.lfo.depth = val * 0.6;
        break;
      case 'chorus':
        this.state.chorus.mix = val * 0.85;
        break;
      case 'reverb':
        this.state.reverb.mix = val * 0.85;
        break;
      case 'delay':
        this.state.delay.mix = val * 0.8;
        break;
      case 'output':
        this.state.masterVolume = val * 1.2;
        break;
    }

    this.applyAllParameters();
  }

  public applyAllParameters(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Master Volume
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.state.masterVolume, now, 0.02);
    }

    // Layer Buses
    const getLayerVol = (layer: LayerParams) => (layer.enabled && !layer.mute ? layer.volume : 0);
    if (this.layerKeysBus) {
      this.layerKeysBus.gain.setTargetAtTime(getLayerVol(this.state.layerKeys), now, 0.02);
    }
    if (this.layerWarmthBus) {
      this.layerWarmthBus.gain.setTargetAtTime(getLayerVol(this.state.layerWarmth), now, 0.02);
    }
    if (this.layerPadBus) {
      this.layerPadBus.gain.setTargetAtTime(getLayerVol(this.state.layerPad), now, 0.02);
    }

    // Global Filter
    if (this.globalFilter && this.globalFilterLadder) {
      const f = this.state.filter;
      if (f.type === 'warm_ladder') {
        this.globalFilter.type = 'lowpass';
        this.globalFilterLadder.type = 'lowpass';
        this.globalFilter.frequency.setTargetAtTime(f.cutoff, now, 0.03);
        this.globalFilterLadder.frequency.setTargetAtTime(f.cutoff, now, 0.03);
        this.globalFilter.Q.setTargetAtTime(f.resonance * 0.6, now, 0.03);
        this.globalFilterLadder.Q.setTargetAtTime(f.resonance * 0.6, now, 0.03);
      } else {
        this.globalFilter.type = f.type as BiquadFilterType;
        this.globalFilter.frequency.setTargetAtTime(f.cutoff, now, 0.03);
        this.globalFilter.Q.setTargetAtTime(f.resonance, now, 0.03);
        this.globalFilterLadder.type = 'allpass';
      }
    }

    // Saturation
    if (this.satShaper && this.satDryGain && this.satWetGain) {
      const sat = this.state.saturation;
      if (sat.enabled && sat.mix > 0.01) {
        this.satShaper.curve = makeSaturationCurve(sat.drive, 1024) as unknown as Float32Array<ArrayBuffer>;
        this.satDryGain.gain.setTargetAtTime(1 - sat.mix * 0.6, now, 0.02);
        this.satWetGain.gain.setTargetAtTime(sat.mix, now, 0.02);
      } else {
        this.satDryGain.gain.setTargetAtTime(1, now, 0.02);
        this.satWetGain.gain.setTargetAtTime(0, now, 0.02);
      }
    }

    // Chorus
    if (this.chorusDryGain && this.chorusWetGain && this.chorusLfo) {
      const ch = this.state.chorus;
      if (ch.enabled && ch.mix > 0.01) {
        this.chorusLfo.frequency.setTargetAtTime(ch.rate, now, 0.05);
        const depth = ch.depth * 0.005;
        this.chorusLfoGainL.gain.setTargetAtTime(depth, now, 0.05);
        this.chorusLfoGainR.gain.setTargetAtTime(-depth * ch.spread, now, 0.05);
        this.chorusDryGain.gain.setTargetAtTime(1 - ch.mix * 0.5, now, 0.02);
        this.chorusWetGain.gain.setTargetAtTime(ch.mix, now, 0.02);
      } else {
        this.chorusDryGain.gain.setTargetAtTime(1, now, 0.02);
        this.chorusWetGain.gain.setTargetAtTime(0, now, 0.02);
      }
    }

    // Delay
    if (this.delayDryGain && this.delayWetGain && this.delayNodeL && this.delayNodeR) {
      const d = this.state.delay;
      if (d.enabled && d.mix > 0.01) {
        const time = d.time;
        this.delayNodeL.delayTime.setTargetAtTime(time, now, 0.04);
        this.delayNodeR.delayTime.setTargetAtTime(d.pingPong ? time * 1.333 : time, now, 0.04);
        const fb = clamp(d.feedback, 0, 0.85);
        this.delayFeedbackL.gain.setTargetAtTime(fb, now, 0.02);
        this.delayFeedbackR.gain.setTargetAtTime(fb, now, 0.02);
        this.delayDryGain.gain.setTargetAtTime(1 - d.mix * 0.4, now, 0.02);
        this.delayWetGain.gain.setTargetAtTime(d.mix, now, 0.02);
      } else {
        this.delayDryGain.gain.setTargetAtTime(1, now, 0.02);
        this.delayWetGain.gain.setTargetAtTime(0, now, 0.02);
      }
    }

    // Reverb
    if (this.reverbDryGain && this.reverbWetGain) {
      const r = this.state.reverb;
      if (r.enabled && r.mix > 0.01) {
        this.reverbDryGain.gain.setTargetAtTime(1 - r.mix * 0.5, now, 0.02);
        this.reverbWetGain.gain.setTargetAtTime(r.mix, now, 0.02);
      } else {
        this.reverbDryGain.gain.setTargetAtTime(1, now, 0.02);
        this.reverbWetGain.gain.setTargetAtTime(0, now, 0.02);
      }
    }

    // LFO Modulation
    if (this.modLfo && this.modLfoGain) {
      const l = this.state.lfo;
      if (l.enabled && l.depth > 0.01) {
        this.modLfo.frequency.setTargetAtTime(l.rate, now, 0.03);
        this.modLfoGain.gain.setTargetAtTime(l.depth, now, 0.03);
      } else {
        this.modLfoGain.gain.setTargetAtTime(0, now, 0.02);
      }
    }
  }

  // --- Voice Triggering (Polyphonic Note Playback) ---

  public async noteOn(midiNote: number, velocity: number = 0.8): Promise<void> {
    await this.initAudio();
    if (!this.ctx) return;

    // Apply octave shift
    const shiftedNote = midiNote + this.state.octaveShift * 12;
    if (shiftedNote < 12 || shiftedNote > 127) return;

    // Polyphony & Stealing logic
    if (this.activeVoices.has(shiftedNote)) {
      this.terminateVoice(shiftedNote, 0.02);
    } else if (this.activeVoices.size >= this.maxPolyphony) {
      // Steal oldest released or oldest playing voice
      let oldestKey = -1;
      let oldestTime = Infinity;
      for (const [key, voice] of this.activeVoices) {
        if (voice.released && voice.startTime < oldestTime) {
          oldestKey = key;
          oldestTime = voice.startTime;
        }
      }
      if (oldestKey === -1) {
        for (const [key, voice] of this.activeVoices) {
          if (voice.startTime < oldestTime) {
            oldestKey = key;
            oldestTime = voice.startTime;
          }
        }
      }
      if (oldestKey !== -1) {
        this.terminateVoice(oldestKey, 0.015);
      }
    }

    const processedVel = processVelocity(velocity, this.state.velocityCurve);
    const now = this.ctx.currentTime;
    const freq = midiToFreq(shiftedNote, this.currentPitchBendSemitones * 100);

    // Create Voice Nodes
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);

    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'lowpass';

    // Key tracking for voice filter
    const keyTrackingOffset = (shiftedNote - 60) * 45 * this.state.filter.keyTracking;
    const baseCutoff = clamp(this.state.filter.cutoff + keyTrackingOffset, 100, 20000);
    voiceFilter.frequency.setValueAtTime(baseCutoff, now);
    voiceFilter.Q.setValueAtTime(this.state.filter.resonance, now);

    // Filter Envelope modulation
    const fEnv = this.state.filterEnvelope;
    const envPeakCutoff = clamp(baseCutoff + this.state.filter.envelopeAmount * 8000 * processedVel, 100, 20000);
    voiceFilter.frequency.linearRampToValueAtTime(envPeakCutoff, now + Math.max(0.005, fEnv.attack));
    voiceFilter.frequency.exponentialRampToValueAtTime(
      clamp(baseCutoff + (envPeakCutoff - baseCutoff) * fEnv.sustain, 100, 20000),
      now + Math.max(0.005, fEnv.attack) + Math.max(0.01, fEnv.decay)
    );

    const voicePan = this.ctx.createStereoPanner();
    voicePan.pan.value = 0;

    // Connect voice chain
    voiceFilter.connect(voiceGain);
    voiceGain.connect(voicePan);

    const voice: VoiceNodes = {
      midiNote: shiftedNote,
      velocity: processedVel,
      startTime: now,
      released: false,
      heldBySustain: false,
      voiceFilter,
      voiceGain,
      voicePan,
    };

    // --- Layer 1: Electric Keys Synthesis ---
    if (this.state.layerKeys.enabled && !this.state.layerKeys.mute) {
      const eParams = this.state.electricKeys;
      const layerOct = this.state.layerKeys.octave * 12;
      const layerDetune = this.state.layerKeys.detune;
      const baseFreq = midiToFreq(shiftedNote + layerOct, layerDetune);

      // Fundamental oscillator
      const eFund = this.ctx.createOscillator();
      eFund.type = 'sine';
      eFund.frequency.setValueAtTime(baseFreq, now);

      const eFundGain = this.ctx.createGain();
      const fundLevel = (0.5 + eParams.bodyTone * 0.5) * processedVel;
      eFundGain.gain.setValueAtTime(0.0001, now);
      eFundGain.gain.linearRampToValueAtTime(fundLevel, now + 0.005);
      eFundGain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, fundLevel * 0.4),
        now + Math.max(0.2, eParams.decayTime * (0.8 + 0.4 * (1 - shiftedNote / 127)))
      );

      eFund.connect(eFundGain);
      eFundGain.connect(voiceFilter);
      eFund.start(now);

      // Bell / Tine Partial (High metallic ring with fast decay)
      if (eParams.bell > 0.02) {
        const eBell = this.ctx.createOscillator();
        eBell.type = 'sine';
        const bellFreq = baseFreq * eParams.tineRatio;
        eBell.frequency.setValueAtTime(bellFreq, now);

        const eBellGain = this.ctx.createGain();
        const bellLevel = eParams.bell * Math.pow(processedVel, 1.2) * 0.8;
        eBellGain.gain.setValueAtTime(0.0001, now);
        eBellGain.gain.linearRampToValueAtTime(bellLevel, now + 0.002);
        // Tine rings briefly and decays quickly
        eBellGain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + Math.max(0.05, 0.3 * (1 - eParams.bell * 0.4))
        );

        eBell.connect(eBellGain);
        eBellGain.connect(voiceFilter);
        eBell.start(now);

        voice.eBell = eBell;
        voice.eBellGain = eBellGain;
      }

      // Mallet Attack Transient (Realistic key strike click)
      if (eParams.malletClick > 0.02 && this.malletBuffer) {
        const malletSrc = this.ctx.createBufferSource();
        malletSrc.buffer = this.malletBuffer;
        const malletGain = this.ctx.createGain();
        malletGain.gain.setValueAtTime(eParams.malletClick * processedVel * 0.4, now);
        malletSrc.connect(malletGain);
        malletGain.connect(voiceFilter);
        malletSrc.start(now);

        voice.eMalletSource = malletSrc;
        voice.eMalletGain = malletGain;
      }

      voice.eFundamental = eFund;
      voice.eFundamentalGain = eFundGain;
    }

    // --- Layer 2: Warm Keys Synthesis ---
    if (this.state.layerWarmth.enabled && !this.state.layerWarmth.mute) {
      const wParams = this.state.warmKeys;
      const layerOct = this.state.layerWarmth.octave * 12;
      const baseFreq = midiToFreq(shiftedNote + layerOct, this.state.layerWarmth.detune);

      const wOsc1 = this.ctx.createOscillator();
      wOsc1.type = 'triangle';
      wOsc1.frequency.setValueAtTime(baseFreq, now);

      const wOsc2 = this.ctx.createOscillator();
      wOsc2.type = 'sawtooth';
      wOsc2.frequency.setValueAtTime(baseFreq * 1.001, now);

      const wMixGain = this.ctx.createGain();
      const warmGainLevel = (0.2 + (1 - wParams.waveformBlend) * 0.6) * processedVel * 0.7;
      wMixGain.gain.setValueAtTime(warmGainLevel, now);

      wOsc1.connect(wMixGain);
      if (wParams.waveformBlend > 0.1) {
        const sawGain = this.ctx.createGain();
        sawGain.gain.value = wParams.waveformBlend * 0.4;
        wOsc2.connect(sawGain);
        sawGain.connect(wMixGain);
      }
      wMixGain.connect(voiceFilter);

      wOsc1.start(now);
      wOsc2.start(now);

      voice.wOsc1 = wOsc1;
      voice.wOsc2 = wOsc2;
      voice.wMixGain = wMixGain;
    }

    // --- Layer 3: Pad Synthesis ---
    if (this.state.layerPad.enabled && !this.state.layerPad.mute) {
      const pParams = this.state.pad;
      const layerOct = this.state.layerPad.octave * 12;
      const baseFreq = midiToFreq(shiftedNote + layerOct, this.state.layerPad.detune);

      const pOscL = this.ctx.createOscillator();
      pOscL.type = pParams.waveType;
      pOscL.frequency.setValueAtTime(baseFreq, now);
      pOscL.detune.setValueAtTime(-pParams.detuneAmount, now);

      const pOscR = this.ctx.createOscillator();
      pOscR.type = pParams.waveType;
      pOscR.frequency.setValueAtTime(baseFreq, now);
      pOscR.detune.setValueAtTime(pParams.detuneAmount, now);

      const pPanL = this.ctx.createStereoPanner();
      pPanL.pan.value = -pParams.stereoSpread;

      const pPanR = this.ctx.createStereoPanner();
      pPanR.pan.value = pParams.stereoSpread;

      const pMixGain = this.ctx.createGain();
      pMixGain.gain.setValueAtTime(0.0001, now);
      // Slower attack curve for pad
      pMixGain.gain.linearRampToValueAtTime(0.35 * processedVel, now + pParams.attackTime);

      pOscL.connect(pPanL);
      pOscR.connect(pPanR);
      pPanL.connect(pMixGain);
      pPanR.connect(pMixGain);
      pMixGain.connect(voiceFilter);

      pOscL.start(now);
      pOscR.start(now);

      voice.pOscL = pOscL;
      voice.pOscR = pOscR;
      voice.pPanL = pPanL;
      voice.pPanR = pPanR;
      voice.pMixGain = pMixGain;
    }

    // Connect voice output to pre-filter bus
    voicePan.connect(this.preFilterBus);

    // Apply Amp Envelope (Attack, Decay, Sustain)
    const env = this.state.ampEnvelope;
    const peakGain = Math.max(0.1, processedVel * 0.85);
    const attackTime = Math.max(0.003, env.attack);
    const decayTime = Math.max(0.01, env.decay);
    const sustainGain = peakGain * clamp(env.sustain, 0.05, 1.0);

    voiceGain.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustainGain), now + attackTime + decayTime);

    this.activeVoices.set(shiftedNote, voice);

    // Notify UI / MIDI activity
    this.notifyMidiActivity(shiftedNote, true);
  }

  public noteOff(midiNote: number): void {
    const shiftedNote = midiNote + this.state.octaveShift * 12;
    const voice = this.activeVoices.get(shiftedNote);
    if (!voice || voice.released) return;

    if (this.sustainPedalDown || this.state.sustainHold) {
      voice.heldBySustain = true;
      return;
    }

    this.releaseVoice(voice);
    this.notifyMidiActivity(shiftedNote, false);
  }

  private releaseVoice(voice: VoiceNodes): void {
    if (!this.ctx || voice.released) return;
    voice.released = true;
    const now = this.ctx.currentTime;
    const releaseTime = Math.max(0.02, this.state.ampEnvelope.release);

    voice.voiceGain.gain.cancelScheduledValues(now);
    voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, now);
    voice.voiceGain.gain.exponentialRampToValueAtTime(0.00001, now + releaseTime);

    // Also ramp down Pad release
    if (voice.pMixGain) {
      const padRelease = Math.max(0.05, this.state.pad.releaseTime);
      voice.pMixGain.gain.cancelScheduledValues(now);
      voice.pMixGain.gain.setValueAtTime(voice.pMixGain.gain.value, now);
      voice.pMixGain.gain.exponentialRampToValueAtTime(0.00001, now + padRelease);
    }

    const totalRelease = Math.max(releaseTime, voice.pMixGain ? this.state.pad.releaseTime : 0);

    setTimeout(() => {
      this.terminateVoice(voice.midiNote, 0.01);
    }, totalRelease * 1000 + 50);
  }

  private terminateVoice(midiNote: number, fadeTime: number = 0.02): void {
    const voice = this.activeVoices.get(midiNote);
    if (!voice) return;

    if (this.ctx) {
      const now = this.ctx.currentTime;
      voice.voiceGain.gain.setTargetAtTime(0, now, fadeTime);
      setTimeout(() => {
        try {
          voice.eFundamental?.stop();
          voice.eBell?.stop();
          voice.wOsc1?.stop();
          voice.wOsc2?.stop();
          voice.pOscL?.stop();
          voice.pOscR?.stop();
          voice.eMalletSource?.stop();
          voice.voicePan.disconnect();
          voice.voiceFilter.disconnect();
          voice.voiceGain.disconnect();
        } catch {
          // Ignore already stopped
        }
      }, fadeTime * 1000 + 20);
    }

    this.activeVoices.delete(midiNote);
    this.notifyMidiActivity(midiNote, false);
  }

  public panicAllNotesOff(): void {
    for (const [note] of this.activeVoices) {
      this.terminateVoice(note, 0.02);
    }
    this.activeVoices.clear();
  }

  // --- MIDI Controls (Pedal, Pitch Bend, Mod Wheel) ---

  public setSustainPedal(down: boolean): void {
    this.sustainPedalDown = down;
    if (!down && !this.state.sustainHold) {
      // Release any voices that were held by sustain
      for (const [, voice] of this.activeVoices) {
        if (voice.heldBySustain) {
          this.releaseVoice(voice);
          this.notifyMidiActivity(voice.midiNote, false);
        }
      }
    }
  }

  public setPitchBend(semitones: number): void {
    this.currentPitchBendSemitones = clamp(semitones, -2, 2);
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const [, voice] of this.activeVoices) {
      const freq = midiToFreq(voice.midiNote, this.currentPitchBendSemitones * 100);
      if (voice.eFundamental) voice.eFundamental.frequency.setTargetAtTime(freq, now, 0.01);
      if (voice.wOsc1) voice.wOsc1.frequency.setTargetAtTime(freq, now, 0.01);
      if (voice.wOsc2) voice.wOsc2.frequency.setTargetAtTime(freq * 1.001, now, 0.01);
    }
  }

  public setModWheel(value: number): void {
    this.currentModWheelValue = clamp(value, 0, 1);
    this.state.lfo.depth = this.currentModWheelValue * 0.7;
    this.applyAllParameters();
  }

  // --- Web MIDI Access ---

  private async initMidi(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) return;

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.updateMidiInputs();
      this.midiAccess.onstatechange = () => {
        this.updateMidiInputs();
      };
    } catch {
      // Web MIDI not supported or denied
    }
  }

  private updateMidiInputs(): void {
    if (!this.midiAccess) return;
    this.midiInputs = [];
    for (const input of this.midiAccess.inputs.values()) {
      this.midiInputs.push({ id: input.id, name: input.name || 'MIDI Keyboard' });
      input.onmidimessage = (event: any) => this.handleMidiMessage(event);
    }
    const names = this.midiInputs.map((i) => i.name);
    for (const cb of this.onDeviceChangeCallbacks) cb(names);
  }

  private handleMidiMessage(event: { data: Uint8Array }): void {
    const [status, data1, data2] = event.data;
    const command = status >> 4;

    switch (command) {
      case 0x9: // Note On
        if (data2 > 0) {
          this.noteOn(data1, data2 / 127);
        } else {
          this.noteOff(data1);
        }
        break;
      case 0x8: // Note Off
        this.noteOff(data1);
        break;
      case 0xb: // Control Change
        if (data1 === 64) {
          // Sustain Pedal
          this.setSustainPedal(data2 >= 64);
        } else if (data1 === 1) {
          // Mod Wheel
          this.setModWheel(data2 / 127);
        } else if (data1 === 7) {
          // Volume
          this.state.masterVolume = (data2 / 127) * 1.2;
          this.applyAllParameters();
        } else if (data1 === 120 || data1 === 123) {
          // All Sound Off / All Notes Off
          this.panicAllNotesOff();
        }
        break;
      case 0xe: // Pitch Bend
        {
          const bendVal = ((data2 << 7) | data1) - 8192;
          this.setPitchBend((bendVal / 8192) * 2);
        }
        break;
    }
  }

  // --- Visualizer & Peak Metering ---

  public getVisualizerData(): { waveform: Uint8Array; spectrum: Uint8Array } {
    if (!this.analyserNode) {
      return {
        waveform: new Uint8Array(256).fill(128),
        spectrum: new Uint8Array(256).fill(0),
      };
    }

    const waveform = new Uint8Array(this.analyserNode.frequencyBinCount);
    const spectrum = new Uint8Array(this.analyserNode.frequencyBinCount);

    this.analyserNode.getByteTimeDomainData(waveform);
    this.analyserNode.getByteFrequencyData(spectrum);

    return { waveform, spectrum };
  }

  public getOutputLevels(): { left: number; right: number } {
    if (!this.analyserNode) return { left: 0, right: 0 };
    const timeData = new Uint8Array(256);
    this.analyserNode.getByteTimeDomainData(timeData);

    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const val = (timeData[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / timeData.length);
    const peak = clamp(rms * 2.8, 0, 1);

    this.leftLevel = this.leftLevel * 0.75 + peak * 0.25;
    this.rightLevel = this.rightLevel * 0.75 + peak * 0.25;

    return { left: this.leftLevel, right: this.rightLevel };
  }

  // --- Listeners & Subscriptions ---

  public subscribeMidiActivity(cb: (note: number, on: boolean) => void): () => void {
    this.onMidiActivityCallbacks.add(cb);
    return () => this.onMidiActivityCallbacks.delete(cb);
  }

  public subscribeDeviceChange(cb: (devices: string[]) => void): () => void {
    this.onDeviceChangeCallbacks.add(cb);
    return () => this.onDeviceChangeCallbacks.delete(cb);
  }

  public getConnectedMidiDevices(): string[] {
    return this.midiInputs.map((i) => i.name);
  }

  private notifyMidiActivity(note: number, on: boolean): void {
    for (const cb of this.onMidiActivityCallbacks) cb(note, on);
  }

  // --- Progression Sequencer (Hardware-Timed Looper) ---

  public async startProgressionLoop(
    chords: ChordDefinition[],
    bpm: number = 112,
    humanize: boolean = true
  ): Promise<void> {
    this.stopProgressionLoop();
    if (!chords || chords.length === 0) return;

    await this.initAudio();
    if (!this.ctx) return;

    this.loopChords = [...chords];
    this.loopBpm = bpm;
    this.loopHumanize = humanize;
    this.loopPlaying = true;
    this.loopCurrentStep = -1;

    this.scheduleNextLoopStep();
  }

  private scheduleNextLoopStep(): void {
    if (!this.loopPlaying || this.loopChords.length === 0) return;

    this.loopCurrentStep = (this.loopCurrentStep + 1) % this.loopChords.length;
    const stepIdx = this.loopCurrentStep;
    const chord = this.loopChords[stepIdx];

    // Notify UI subscribers immediately
    for (const cb of this.loopStepCallbacks) {
      cb(stepIdx, chord);
    }

    const beatMs = (60 / Math.max(30, Math.min(300, this.loopBpm))) * 1000;
    const durationMs = (chord.durationBeats || 4) * beatMs;

    // Trigger notes with subtle humanize timing variation
    const activeNotes = [...chord.notes];
    for (const note of activeNotes) {
      const vel = this.loopHumanize ? 0.72 + Math.random() * 0.16 : 0.82;
      const timingOffset = this.loopHumanize ? Math.random() * 16 : 0;

      const subOn = setTimeout(() => {
        if (this.loopPlaying) {
          this.noteOn(note, vel);
        }
      }, timingOffset);
      this.loopSubTimers.push(subOn);
    }

    // Schedule note offs slightly before next step for clean articulation
    const gateMs = durationMs * 0.92;
    const subOff = setTimeout(() => {
      for (const note of activeNotes) {
        this.noteOff(note);
      }
    }, gateMs);
    this.loopSubTimers.push(subOff);

    // Schedule next chord step
    this.loopTimer = setTimeout(() => {
      // Clear sub-timers for previous step
      this.loopSubTimers = [];
      this.scheduleNextLoopStep();
    }, durationMs);
  }

  public stopProgressionLoop(): void {
    this.loopPlaying = false;
    this.loopCurrentStep = -1;

    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    for (const timer of this.loopSubTimers) {
      clearTimeout(timer);
    }
    this.loopSubTimers = [];

    // Cleanly panic and release any active voices
    this.panicAllNotesOff();

    // Notify UI that playback stopped
    for (const cb of this.loopStepCallbacks) {
      cb(-1, null);
    }
  }

  public isProgressionPlaying(): boolean {
    return this.loopPlaying;
  }

  public getProgressionStep(): number {
    return this.loopCurrentStep;
  }

  public setProgressionBpm(bpm: number): void {
    this.loopBpm = bpm;
  }

  public subscribeProgressionStep(cb: (step: number, chord: ChordDefinition | null) => void): () => void {
    this.loopStepCallbacks.add(cb);
    return () => this.loopStepCallbacks.delete(cb);
  }

  // --- Audio WAV Export ---

  public async renderProgressionToWav(
    notesTimeline: { note: number; velocity: number; time: number; duration: number }[],
    totalDurationSeconds: number
  ): Promise<Blob> {
    const sampleRate = 44100;
    const length = Math.ceil(sampleRate * (totalDurationSeconds + 2.0)); // tail
    const OfflineCtxClass = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(2, length, sampleRate);

    // Render offline with exact engine DSP graph
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = this.state.masterVolume;
    masterGain.connect(offlineCtx.destination);

    // Simple high quality offline voice playback
    for (const item of notesTimeline) {
      const now = item.time;
      const freq = midiToFreq(item.note + this.state.octaveShift * 12);
      const vel = processVelocity(item.velocity, this.state.velocityCurve);

      const osc = offlineCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Bell partial
      const bell = offlineCtx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq * this.state.electricKeys.tineRatio, now);

      const voiceGain = offlineCtx.createGain();
      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.linearRampToValueAtTime(vel * 0.8, now + 0.005);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + item.duration + 0.8);

      const bellGain = offlineCtx.createGain();
      bellGain.gain.setValueAtTime(0.0001, now);
      bellGain.gain.linearRampToValueAtTime(this.state.electricKeys.bell * vel * 0.6, now + 0.002);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(voiceGain);
      bell.connect(bellGain);
      bellGain.connect(voiceGain);
      voiceGain.connect(masterGain);

      osc.start(now);
      bell.start(now);
      osc.stop(now + item.duration + 1.0);
      bell.stop(now + 0.5);
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  private bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // subchunk1size (16 for PCM)
    setUint16(1); // audio format (1 = PCM)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // Data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out.buffer], { type: 'audio/wav' });
  }
}

// Global Singleton for easy app-wide access
export const soulKeysEngine = new SoulKeysEngine();
