/* ═══════════════════════════════════════════════════════════════
   APEX MOTORS — Quantum V8 Engine Audio Synthesis Graph
   Supports V8 fundamental sweeps, straight-cut gear whine,
   sub-bass pilot cocoon shifting, and mechanical click overlays.
   ═══════════════════════════════════════════════════════════════ */

export const GEAR_NAMES = ['N', '1', '2', '3', '4', '5', '6'];
export const GEAR_PITCH_MULT = [1.0, 0.88, 0.76, 0.66, 0.58, 0.51, 0.45];

export class AudioEngine {
  constructor() {
    this._ctx = null;
    this._buses = null;
    this._isStarted = false;
    this._throttleVal = 0;
    this._startInterval = null;
    this._cocoonActive = false;
  }

  get isStarted()   { return this._isStarted; }
  get throttleVal() { return this._throttleVal; }
  get audioCtx()    { return this._ctx; }

  init(modelType) {
    if (this._ctx) return;

    const AC = window.AudioContext || window.webkitAudioContext;
    this._ctx = new AC();
    const ctx = this._ctx;
    const isGT4 = modelType === 'gt4';
    const idleF1 = isGT4 ? 33 : 42;

    // ── OSCILLATORS ──
    const osc1       = ctx.createOscillator();   // Base V8 fundamental
    const osc2       = ctx.createOscillator();   // Harmonic
    const subOsc     = ctx.createOscillator();   // Sub-bass chest rumble
    const exhaustOsc = ctx.createOscillator();   // Exhaust rasp
    const gearOsc    = ctx.createOscillator();   // Gear whine (EVO III only)
    const noise      = this._createNoiseNode(ctx); // Intake hiss

    // ── FILTERS ──
    const filter1       = ctx.createBiquadFilter();
    const filter2       = ctx.createBiquadFilter();
    const subFilter     = ctx.createBiquadFilter();
    const exhaustFilter = ctx.createBiquadFilter();
    const gearFilter    = ctx.createBiquadFilter();
    const noiseFilter   = ctx.createBiquadFilter();

    // ── WAVESHAPER (DISTORTION) ──
    const dist = ctx.createWaveShaper();
    dist.curve = this._makeDistortionCurve(isGT4 ? 12 : 24);
    dist.oversample = '4x';

    // ── GAINS ──
    const gain1       = ctx.createGain();
    const gain2       = ctx.createGain();
    const subGain     = ctx.createGain();
    const exhaustGain = ctx.createGain();
    const gearGain    = ctx.createGain();
    const noiseGain   = ctx.createGain();
    const masterGain  = ctx.createGain();

    // ── CONFIGURE ──
    if (isGT4) {
      osc1.type = 'sawtooth';   osc1.frequency.value = idleF1;
      filter1.type = 'lowpass';  filter1.frequency.value = 75;
      gain1.gain.value = 0.38;

      osc2.type = 'triangle';   osc2.frequency.value = idleF1 * 2;
      filter2.type = 'bandpass'; filter2.frequency.value = 130; filter2.Q.value = 2.5;
      gain2.gain.value = 0.28;

      subOsc.type = 'triangle';  subOsc.frequency.value = idleF1 * 0.5;
      subFilter.type = 'lowpass'; subFilter.frequency.value = 45;
      subGain.gain.value = 0.75; // Enhanced sub base gain for prototype levitation

      exhaustOsc.type = 'sawtooth'; exhaustOsc.frequency.value = idleF1 * 3;
      exhaustFilter.type = 'bandpass'; exhaustFilter.frequency.value = 280; exhaustFilter.Q.value = 1.0;
      exhaustGain.gain.value = 0.12;

      gearGain.gain.value = 0.0;
    } else {
      osc1.type = 'sawtooth';   osc1.frequency.value = idleF1;
      filter1.type = 'lowpass';  filter1.frequency.value = 90;
      gain1.gain.value = 0.32;

      osc2.type = 'sawtooth';   osc2.frequency.value = idleF1 * 2;
      filter2.type = 'bandpass'; filter2.frequency.value = 160; filter2.Q.value = 4.0;
      gain2.gain.value = 0.38;

      subOsc.type = 'triangle';  subOsc.frequency.value = idleF1 * 0.5;
      subFilter.type = 'lowpass'; subFilter.frequency.value = 50;
      subGain.gain.value = 0.60;

      exhaustOsc.type = 'sawtooth'; exhaustOsc.frequency.value = idleF1 * 4;
      exhaustFilter.type = 'bandpass'; exhaustFilter.frequency.value = 380; exhaustFilter.Q.value = 2.5;
      exhaustGain.gain.value = 0.28;

      gearOsc.type = 'sine'; gearOsc.frequency.value = 280;
      gearFilter.type = 'bandpass'; gearFilter.frequency.value = 400; gearFilter.Q.value = 1.0;
      gearGain.gain.value = 0.01;
    }

    noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 300; noiseFilter.Q.value = 1.0;
    noiseGain.gain.value = isGT4 ? 0.015 : 0.025;

    // ── ROUTING ──
    osc1.connect(filter1).connect(gain1).connect(dist);
    osc2.connect(filter2).connect(gain2).connect(dist);
    subOsc.connect(subFilter).connect(subGain).connect(dist);
    exhaustOsc.connect(exhaustFilter).connect(exhaustGain).connect(dist);
    gearOsc.connect(gearFilter).connect(gearGain).connect(masterGain);
    if (noise) noise.connect(noiseFilter).connect(noiseGain).connect(dist);
    dist.connect(masterGain);
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.0;

    osc1.start(); osc2.start(); subOsc.start();
    exhaustOsc.start(); gearOsc.start();
    if (noise) noise.start();

    // ── LFO (Wobble modulation) ──
    const lfo     = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = isGT4 ? 7.2 : 9.2;
    lfoGain.gain.value  = isGT4 ? 1.8 : 2.5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    lfoGain.connect(subOsc.frequency);
    lfo.start();

    this._buses = {
      osc1, osc2, subOsc, exhaustOsc, gearOsc,
      gain1, gain2, subGain, exhaustGain, gearGain,
      filter1, filter2, subFilter, exhaustFilter, gearFilter,
      noiseFilter, noiseGain,
      masterGain, lfo, lfoGain
    };
  }

  startEngine(modelType) {
    this.init(modelType);
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();

    const isGT4  = modelType === 'gt4';
    const idleF1 = isGT4 ? 33 : 42;
    const idleSub = idleF1 * 0.5;
    const idleExh = idleF1 * (isGT4 ? 3 : 4);
    const b = this._buses;

    this._isStarted = true;
    let elapsed = 0;

    if (this._startInterval) clearInterval(this._startInterval);
    this._startInterval = setInterval(() => {
      elapsed += 0.05;
      const starterFreq = 25 + Math.sin(elapsed * 12) * 8 + elapsed * 45;
      const now = this._ctx.currentTime;

      b.osc1.frequency.setValueAtTime(Math.min(starterFreq, idleF1 + 2), now);
      b.osc2.frequency.setValueAtTime(Math.min(starterFreq * 2, idleF1 * 2 + 4), now);
      b.subOsc.frequency.setValueAtTime(Math.min(starterFreq * 0.5, idleSub + 1), now);
      b.exhaustOsc.frequency.setValueAtTime(Math.min(starterFreq * (isGT4 ? 3 : 4), idleExh + 6), now);
      b.masterGain.gain.value = Math.min(elapsed * 0.48, 0.38);

      if (elapsed >= 0.75) {
        clearInterval(this._startInterval);
        this._startInterval = null;
        this._rampParam(b.osc1.frequency, idleF1, 0.35);
        this._rampParam(b.osc2.frequency, idleF1 * 2, 0.35);
        this._rampParam(b.subOsc.frequency, idleSub, 0.35);
        this._rampParam(b.exhaustOsc.frequency, idleExh, 0.35);
        this._rampParam(b.masterGain.gain, 0.32, 0.35);
      }
    }, 50);
  }

  stopEngine() {
    if (!this._isStarted || !this._buses) return;
    this._isStarted = false;
    this._throttleVal = 0;
    const b = this._buses;
    this._rampParam(b.osc1.frequency, 8, 0.75);
    this._rampParam(b.osc2.frequency, 16, 0.75);
    this._rampParam(b.subOsc.frequency, 4, 0.75);
    this._rampParam(b.exhaustOsc.frequency, 24, 0.75);
    this._rampParam(b.gearOsc.frequency, 50, 0.75);
    this._rampParam(b.masterGain.gain, 0.0, 0.75);
  }

  updateThrottle(val, modelType, gearMult) {
    if (!this._isStarted || !this._buses) return;
    this._throttleVal = val;
    const isGT4 = modelType === 'gt4';
    const idleF1 = isGT4 ? 33 : 42;
    const idleF2 = idleF1 * 2;
    const idleSub = idleF1 * 0.5;
    const idleExh = idleF1 * (isGT4 ? 3 : 4);
    const b = this._buses;
    const now = this._ctx.currentTime;

    const pitchScale = this._cocoonActive ? 0.45 : 1.0;
    const tF1  = ((idleF1  + val * (isGT4 ? 120 : 160)) * gearMult) * pitchScale;
    const tF2  = ((idleF2  + val * (isGT4 ? 240 : 320)) * gearMult) * pitchScale;
    const tSub = ((idleSub + val * (isGT4 ? 60 : 80))   * gearMult) * (this._cocoonActive ? 0.7 : 1.0);
    const tExh = ((idleExh + val * (isGT4 ? 360 : 640))  * gearMult) * pitchScale;

    b.osc1.frequency.setValueAtTime(tF1, now);
    b.osc2.frequency.setValueAtTime(tF2, now);
    b.subOsc.frequency.setValueAtTime(tSub, now);
    b.exhaustOsc.frequency.setValueAtTime(tExh, now);

    const cutoffScale = this._cocoonActive ? 0.35 : 1.0;
    b.filter1.frequency.setValueAtTime((((idleF1 * 2.2) + val * 220) * gearMult) * cutoffScale, now);
    b.filter2.frequency.setValueAtTime((((idleF2 * 2.0) + val * 600) * gearMult) * cutoffScale, now);
    b.subFilter.frequency.setValueAtTime(((idleSub * 1.8) + val * 80) * gearMult, now);
    b.exhaustFilter.frequency.setValueAtTime((((idleExh * 1.5) + val * 800) * gearMult) * cutoffScale, now);

    if (!isGT4) {
      b.gearOsc.frequency.setValueAtTime(((260 + val * 900) * gearMult) * pitchScale, now);
      b.gearGain.gain.setValueAtTime(val * 0.05 * (this._cocoonActive ? 0.1 : 1.0), now);
    }

    b.noiseFilter.frequency.setValueAtTime(((280 + val * 1100) * gearMult) * cutoffScale, now);
    b.noiseGain.gain.setValueAtTime(
      (((isGT4 ? 0.015 : 0.025) + val * 0.06) * (0.7 + gearMult * 0.3)) * (this._cocoonActive ? 0.15 : 1.0), now
    );
    b.masterGain.gain.setValueAtTime(0.32 + val * 0.28, now);
  }

  setPilotCocoonMode(active, modelType) {
    if (!this._ctx || !this._buses) return;
    this._cocoonActive = active;
    const b = this._buses;
    const now = this._ctx.currentTime;

    if (active) {
      b.gain1.gain.setValueAtTime(0.12, now);
      b.gain2.gain.setValueAtTime(0.04, now);
      b.subGain.gain.setValueAtTime(1.8, now);
      b.exhaustGain.gain.setValueAtTime(0.02, now);
      b.lfoGain.gain.setValueAtTime(0.6, now);
    } else {
      const isGT4 = modelType === 'gt4';
      b.gain1.gain.setValueAtTime(isGT4 ? 0.38 : 0.32, now);
      b.gain2.gain.setValueAtTime(isGT4 ? 0.28 : 0.38, now);
      b.subGain.gain.setValueAtTime(isGT4 ? 0.75 : 0.60, now);
      b.exhaustGain.gain.setValueAtTime(isGT4 ? 0.12 : 0.28, now);
      b.lfoGain.gain.setValueAtTime(isGT4 ? 1.8 : 2.5, now);
    }

    this.updateThrottle(this._throttleVal, modelType, GEAR_PITCH_MULT[0]);
  }

  triggerBackfire() {
    if (!this._ctx || !this._isStarted || this._cocoonActive) return;
    const ctx = this._ctx;
    const popCount = 1 + Math.floor(Math.random() * 3);
    let delay = 0;

    for (let i = 0; i < popCount; i++) {
      setTimeout(() => {
        if (!this._isStarted) return;
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 45 + Math.random() * 55;
        filt.type = 'bandpass';
        filt.frequency.value = 110 + Math.random() * 140;
        filt.Q.value = 2.2;

        gain.gain.setValueAtTime(0.09 * (0.4 + Math.random() * 0.6), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(filt).connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }, delay);
      delay += 50 + Math.random() * 110;
    }
  }

  ignitionCut() {
    if (!this._buses || !this._ctx) return;
    this._buses.masterGain.gain.setValueAtTime(0.01, this._ctx.currentTime);
    setTimeout(() => {
      if (this._isStarted && this._buses) {
        const target = 0.32 + this._throttleVal * 0.28;
        this._buses.masterGain.gain.linearRampToValueAtTime(target, this._ctx.currentTime + 0.04);
      }
    }, 80);
  }

  playEngageBassDrop() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const tmp = new AC();
      const osc = tmp.createOscillator();
      const g   = tmp.createGain();
      const f   = tmp.createBiquadFilter();

      osc.connect(f).connect(g).connect(tmp.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, tmp.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, tmp.currentTime + 1.8);
      f.type = 'lowpass';
      f.frequency.setValueAtTime(400, tmp.currentTime);
      f.frequency.exponentialRampToValueAtTime(45, tmp.currentTime + 1.8);
      g.gain.setValueAtTime(0.001, tmp.currentTime);
      g.gain.linearRampToValueAtTime(0.65, tmp.currentTime + 0.1);
      g.gain.exponentialRampToValueAtTime(0.40, tmp.currentTime + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, tmp.currentTime + 1.8);
      osc.start();
      osc.stop(tmp.currentTime + 1.85);
    } catch (_) {}
  }

  playTactileClick(type = 'click') {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const tmp = new AC();
      const osc = tmp.createOscillator();
      const g   = tmp.createGain();
      osc.connect(g).connect(tmp.destination);

      if (type === 'hover') {
        osc.frequency.setValueAtTime(1200, tmp.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, tmp.currentTime + 0.04);
        g.gain.setValueAtTime(0.004, tmp.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, tmp.currentTime + 0.04);
        osc.start(); osc.stop(tmp.currentTime + 0.05);
      } else {
        osc.frequency.setValueAtTime(800, tmp.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, tmp.currentTime + 0.08);
        g.gain.setValueAtTime(0.03, tmp.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, tmp.currentTime + 0.08);
        osc.start(); osc.stop(tmp.currentTime + 0.09);
      }
    } catch (_) {}
  }

  playGearClank() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g  = ctx.createGain();
    const f  = ctx.createBiquadFilter();

    o1.type = 'triangle';
    o1.frequency.setValueAtTime(140, t);
    o1.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    o2.type = 'sawtooth';
    o2.frequency.setValueAtTime(800, t);
    o2.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 1.5;

    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    o1.connect(f); o2.connect(f);
    f.connect(g).connect(ctx.destination);
    o1.start(t); o2.start(t);
    o1.stop(t + 0.09); o2.stop(t + 0.09);
  }

  playIntroSweep() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const t = ctx.currentTime;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const f  = ctx.createBiquadFilter();
    const g  = ctx.createGain();
    const analyser = ctx.createAnalyser();

    o1.type = 'sawtooth'; o2.type = 'sawtooth';
    o1.frequency.setValueAtTime(35, t);
    o1.frequency.exponentialRampToValueAtTime(160, t + 0.8);
    o1.frequency.exponentialRampToValueAtTime(45, t + 1.6);
    o2.frequency.setValueAtTime(70, t);
    o2.frequency.exponentialRampToValueAtTime(320, t + 0.8);
    o2.frequency.exponentialRampToValueAtTime(90, t + 1.6);
    f.frequency.setValueAtTime(90, t);
    f.frequency.exponentialRampToValueAtTime(450, t + 0.8);
    f.frequency.exponentialRampToValueAtTime(110, t + 1.6);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    o1.connect(f); o2.connect(f);
    f.connect(g).connect(analyser).connect(ctx.destination);
    o1.start(t); o2.start(t);
    o1.stop(t + 1.65); o2.stop(t + 1.65);

    return analyser;
  }

  dispose() {
    if (this._startInterval) clearInterval(this._startInterval);
    if (this._ctx) {
      this._ctx.close().catch(() => {});
      this._ctx = null;
    }
    this._buses = null;
    this._isStarted = false;
    this._throttleVal = 0;
  }

  _makeDistortionCurve(amount = 20) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  _createNoiseNode(ctx) {
    try {
      const len = ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    } catch (_) { return null; }
  }

  _rampParam(param, target, duration) {
    const now = this._ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(target, now + duration);
  }
}
