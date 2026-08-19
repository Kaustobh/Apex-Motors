/* ═══════════════════════════════════════════════════════════════
   APEX MOTORS — UI & Virtual Scroll Timeline Orchestration
   Damped input physics, cinematic keyframe matrices,
   and dynamic post-processing & audio triggers per phase.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { MODELS, KEYFRAMES, HOTSPOTS } from './scene.js';
import { GEAR_NAMES, GEAR_PITCH_MULT } from './audioEngine.js';

const LOGS_DB = [
  { pct: 0,   msg: '> SYS // INITIATING BOOT SEQUENCE...' },
  { pct: 5,   msg: '> DIAG // VALIDATING STRUCTURAL HASH...' },
  { pct: 12,  msg: '> GEOM // RESOLVING SPACEFRAME TOPOLOGY...' },
  { pct: 22,  msg: '> MAT // LOADING PBR SURFACE MAPS...' },
  { pct: 35,  msg: '> AERO // COMPUTING FLUID VELOCITY GRADIENTS...' },
  { pct: 48,  msg: '> PHYS // CALIBRATING SUSPENSION GEOMETRY...' },
  { pct: 60,  msg: '> TEL // INITIALIZING TELEMETRY ARRAYS...' },
  { pct: 72,  msg: '> AUDIO // SYNTHESIZING V8 WAVEFORM...' },
  { pct: 85,  msg: '> GPU // COMPILING SHADER PIPELINE...' },
  { pct: 94,  msg: '> FINAL // ASSEMBLING RENDER GRAPH...' },
  { pct: 100, msg: '> READY // ALL SUBSYSTEMS NOMINAL ✓' }
];

const NARRATIVE_TEXTS = {
  'mercedes_amg_gt4.glb': {
    themeColorHex: 0x00e5ff,
    ethos: 'Engineered for maximum endurance and accessibility. The AMG GT4 combines a production-based 4.0L V8 twin-turbocharged platform with highly sophisticated driver assistance electronics, serving as the benchmark platform for GT4 customer racing worldwide.',
    trackExp: 'A masterclass in balanced precision. The Biturbo engine delivers linear, predictable power across the rev range, working in harmony with an 11-setting adjustable ABS to offer confidence through challenging corner entries and long stints.',
    p0: {
      label: 'APEX MOTORSPORT // LAB DECK',
      title: 'THE PURITY OF<br><em>LEVITATION</em>',
      desc: 'Mercedes-AMG GT4 spaceframe engineering. A real-time audit of aluminum chassis, direct-injection Biturbo dynamics, and adjustable aerodynamics.'
    },
    p1: {
      label: '01 // STRUCTURAL MATRIX',
      title: 'VEHICLE IGNITION<br><em>INITIATED</em>',
      desc: 'The 4.0-liter twin-turbocharged M178 V8 comes alive. Pneumatic starter valves build pressure, settling the Biturbo engine at a 33 Hz idle rumble.',
      telemetry: `MODEL SPECIFICATION: AMG GT4<br/>
ENGINE CODE: AMG M178 V8 BITURBO<br/>
GEARBOX: 6-SPEED SEQUENTIAL COMPETITION<br/>
CHASSIS: LIGHTWEIGHT ALUMINUM SPACEFRAME<br/>
BRAKES: 6-PISTON FRONT ABS ACTIVE`
    },
    p2: {
      label: '02 // THERMODYNAMICS',
      title: 'MANIPULATING<br><em>ATMOSPHERIC TENSION</em>',
      desc: 'Adjustable front splitter and prepreg carbon rear wing profile generate up to 120 kg of front downforce. Air channels redirect thermal energy away from intercoolers.'
    },
    p3: {
      label: '03 // AERODYNAMIC AUDIT',
      title: 'AERODYNAMIC<br><em>BALANCE OPTIMIZATION</em>',
      desc: 'Adjustable aerodynamic configurations balance front splitter entry angles with rear wing profiles. Underbody diffuser tunnels shape airflow velocity to optimize downforce distribution.',
      col2: `SPLITTER ANGLE: -1.5°<br/>
REAR WING ATTACK: 12.5°<br/>
DIFFUSER VELOCITY: 240 km/h`,
      col3: `GURNEY FLAP: 4.0 mm<br/>
RIDE HEIGHT F/R: 55 / 72 mm<br/>
AERO BALANCE: NOMINAL`
    },
    p4: {
      quote: '"Control is a state of cognitive flow."',
      desc: 'Cockpit configurations minimize distractions. Digital layout projects telemetry directly onto the racing yoke.'
    }
  },
  'amg_evo_3.glb': {
    themeColorHex: 0xff1a1a,
    ethos: 'The absolute peak of customer GT racing. The GT3 EVO features a brutal, high-revving 6.3L naturally aspirated V8 and an extreme aerodynamic body kit with front dive planes and a swan-neck rear wing designed for maximum downforce and cornering speed.',
    trackExp: 'A visceral, raw racing experience. The M159 engine screams to its 9,000 RPM redline with instant throttle response. High aerodynamic efficiency generates massive lateral grip, demanding precise inputs and rewarded by phenomenal cornering speeds.',
    p0: {
      label: 'APEX MOTORSPORT // EVO DECK',
      title: 'THE VELOCITY OF<br><em>EXCITATION</em>',
      desc: 'Mercedes-AMG GT3 EVO racing dynamics. Auditing the high-revving naturally aspirated M159 power plant, carbon-fiber aerodynamics, and magnesium wheel assemblies.'
    },
    p1: {
      label: '01 // STRUCTURAL MATRIX',
      title: 'V8 IGNITION<br><em>ENGAGED</em>',
      desc: 'The naturally aspirated 6.3-liter V8 engine roars to life. The M159 racing block builds oil pressure, establishing a high-frequency 42 Hz baseline exhaust note.',
      telemetry: `MODEL SPECIFICATION: AMG GT3 EVO<br/>
ENGINE CODE: AMG M159 NA V8<br/>
GEARBOX: 6-SPEED RACING TRANSAXLE<br/>
CHASSIS: CARBON-REINFORCED SPACEFRAME<br/>
BRAKES: MAG-LOCK WHEELS CENTER HUB`
    },
    p2: {
      label: '02 // THERMODYNAMICS',
      title: 'HARNESSING<br><em>BOUNDARY LAYERS</em>',
      desc: 'Carbon-fiber front flics and swan-neck rear wing mounts preserve the pressure surface, delivering 420 kg of downforce to stabilize high-speed turn-in at 84 m/s.'
    },
    p3: {
      label: '03 // DOWNFORCE AUDIT',
      title: 'MAXIMUM DOWNFORCE<br><em>DYNAMICS</em>',
      desc: 'Carbon-fiber front dive planes and adjustable swan-neck rear wing mounts maximize downforce. Optimized underbody Venturi tunnels generate ground effect to maximize high-speed lateral grip.',
      col2: `FRONT FLICS: DUAL DECK<br/>
SWAN-NECK ATTACK: 14.2°<br/>
VENTURI TUNNELS: ACTIVE`,
      col3: `REAR GURNEY: 6.0 mm<br/>
RIDE HEIGHT F/R: 42 / 56 mm<br/>
AERO BALANCE: OPTIMAL`
    },
    p4: {
      quote: '"Precision is the elimination of noise."',
      desc: 'Carbon-fiber seat tub and integrated safety cell isolate the driver. Biometric telemetry maps grip stress and steering latency.'
    }
  }
};

export class UIController {
  /**
   * @param {import('./scene.js').SceneManager} sm - Scene manager instance.
   * @param {import('./audioEngine.js').AudioEngine} audio - Audio engine instance.
   * @param {THREE.ShaderMaterial} flameMat - Exhaust flame shader material.
   * @param {{ left: THREE.Mesh, right: THREE.Mesh }} flames - Flame meshes.
   */
  constructor(sm, audio, flameMat, flames) {
    this.sm = sm;
    this.audio = audio;
    this.flameMat = flameMat;
    this.flames = flames;

    // ── STATE ──
    this.currentFile = 'mercedes_amg_gt4.glb';
    this.showroomUnlocked = false;
    this.isTransitioning = false;
    this.currentGear = 0;
    this.throttleActive = false;
    this.throttleVal = 0;

    // ── VIRTUAL SCROLL SYSTEM ──
    this.targetScroll = 0.0;
    this.scrollProxy = { progress: 0.0 };

    this._dom = {};
    this._printedLogs = new Set();
    this._hotspotEls = [];
    this._cursorPos = { x: 0, y: 0 };
    this._ringPos  = { x: 0, y: 0 };
    this._chassisScanRAF = null;
    this._oscilloscopeRAF = null;
  }

  /* ══════════════════════════════════════════
     INITIALIZATION
     ══════════════════════════════════════════ */
  init() {
    this._cacheDOMRefs();
    this._initVirtualScroll();
    this._initKeyboardHandler();
    this._initCursorSystem();
    this._initModelSwitcher();
    this._initEngineControls();
    this._initNarrativeTicks();
    this._initHeritageCards();
    this._initExitButton();
    this._initResizeHandler();
    this._updateSpecBox();
    this._updateNarrativeTexts(this.currentFile);
  }

  _cacheDOMRefs() {
    const $ = (id) => document.getElementById(id);
    this._dom = {
      lring: $('lring'),
      bar: $('iproginr'), pct: $('ipct'),
      loadLogs: $('load-logs'),
      engageBtn: $('engage-btn'),
      nav: $('nav'),
      hmodel: $('hmodel'), hgear: $('hgear'),
      mswitcher: $('mswitcher'),
      igniteBtn: $('ignite-btn'),
      exhaustGlow: $('exhaust-glow'),
      nexit: $('nexit-btn'),
      ticks: $('narrative-ticks'),
      cursorRing: $('cursor-ring'),
      cursorDot: $('cursor-dot'),
      cursorLabel: $('cursor-label'),
      chassisCanvas: $('chassis-scan-cv'),
      oscilloCanvas: $('oscilloscope-cv'),
      timelineFill: $('timeline-fill'),
      hudOverlay: $('unlocked-hud-overlay'),
      leverTrack: $('lever-track'),
      leverFill: $('lever-fill'),
      leverThumb: $('lever-thumb')
    };
  }

  /* ══════════════════════════════════════════
     LOADING TERMINAL
     ══════════════════════════════════════════ */
  onLoadProgress(prog) {
    const d = this._dom;
    const estimated = 36750000;
    const total = (prog.total && prog.total > 0) ? prog.total : estimated;
    const p = Math.min(Math.round((prog.loaded / total) * 100), 100);
    if (d.bar) d.bar.style.width = p + '%';
    const loadedMB = (prog.loaded / 1048576).toFixed(1);
    const totalMB  = (total / 1048576).toFixed(1);
    if (d.pct) {
      d.pct.textContent = (prog.total > 0)
        ? `${p}% — ${loadedMB} / ${totalMB} MB`
        : `${loadedMB} MB`;
    }

    LOGS_DB.forEach(entry => {
      if (p >= entry.pct && !this._printedLogs.has(entry.pct)) {
        this._printedLogs.add(entry.pct);
        this._addLogEntry(entry.msg);
      }
    });
  }

  onLoadComplete() {
    const d = this._dom;
    const spinner = d.lring.querySelector('.lr-svg');
    if (spinner) spinner.style.display = 'none';

    d.engageBtn.style.display = 'block';
    requestAnimationFrame(() => { d.engageBtn.style.opacity = '1'; });

    d.engageBtn.addEventListener('click', () => {
      this.audio.playEngageBassDrop();
      d.lring.style.opacity = '0';
      setTimeout(() => {
        d.lring.style.display = 'none';
        this._showChrome();
      }, 800);
    }, { once: true });
  }

  onLoadError() {
    this._addLogEntry('ERROR // ASSET RETRIEVAL FAILED. CHECK CONSOLE.');
  }

  _addLogEntry(msg) {
    if (!this._dom.loadLogs) return;
    const el = document.createElement('div');
    el.className = 'log-entry';
    el.textContent = msg;
    this._dom.loadLogs.appendChild(el);
    this._dom.loadLogs.scrollTop = this._dom.loadLogs.scrollHeight;
  }

  _showChrome() {
    const d = this._dom;
    if (d.nav) d.nav.style.opacity = '1';
    if (d.ticks) d.ticks.style.opacity = '1';
    this._updateTimeline(0.0);
  }

  /* ══════════════════════════════════════════
     VIRTUAL SCROLL TIMELINE (DAMPED LOGIC)
     ══════════════════════════════════════════ */
  _initVirtualScroll() {
    const onScrollEvent = (deltaY) => {
      if (this.showroomUnlocked) {
        if (deltaY < 0) {
          this._exitShowroomToScroll();
        }
        return;
      }

      const step = deltaY * 0.00065;
      this.targetScroll = Math.max(0.0, Math.min(1.0, this.targetScroll + step));

      if (typeof gsap !== 'undefined') {
        gsap.to(this.scrollProxy, {
          progress: this.targetScroll,
          duration: 1.4,
          ease: 'power4.out',
          overwrite: 'auto',
          onUpdate: () => {
            this._updateTimeline(this.scrollProxy.progress);
          }
        });
      } else {
        this.scrollProxy.progress += (this.targetScroll - this.scrollProxy.progress) * 0.08;
        this._updateTimeline(this.scrollProxy.progress);
      }
    };

    window.addEventListener('wheel', (e) => {
      onScrollEvent(e.deltaY);
    }, { passive: true });

    let startY = 0;
    window.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const deltaY = startY - e.touches[0].clientY;
      startY = e.touches[0].clientY;
      onScrollEvent(deltaY * 2.2);
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     DYNAMIC TIMELINE MATRIX (0.0 -> 1.0)
     ══════════════════════════════════════════ */
  _updateTimeline(p) {
    const d = this._dom;

    if (d.timelineFill) d.timelineFill.style.width = (p * 100) + '%';

    let activePhase = 0;
    if (p >= 0.15 && p < 0.35) activePhase = 1;
    else if (p >= 0.35 && p < 0.55) activePhase = 2;
    else if (p >= 0.55 && p < 0.75) activePhase = 3;
    else if (p >= 0.75 && p < 0.90) activePhase = 4;
    else if (p >= 0.90) activePhase = 5;

    for (let i = 0; i <= 5; i++) {
      const el = document.getElementById(`phase-${i}`);
      if (el) el.classList.toggle('active', i === activePhase);
    }

    this._interpolateCamera(p);

    const modelType = MODELS[this.currentFile].audioType;

    // Phase 0: Silent Assembly
    if (p < 0.15) {
      this.flameMat.uniforms.uThrottle.value = 0.0;
      this.flameMat.uniforms.uIonBurn.value = 0.0;
      this.sm.underglow.intensity = 0.15;
      this.sm.targetLevitationY = 0.0;
      this.sm.laserRing.visible = false;
      this.audio.setPilotCocoonMode(false, modelType);
    }
    // Phase 1: Magnetic Ignition
    else if (p >= 0.15 && p < 0.35) {
      const phaseProgress = (p - 0.15) / 0.20;
      this.sm.targetLevitationY = 0.25;
      this.flameMat.uniforms.uThrottle.value = 0.3 * phaseProgress;
      this.flameMat.uniforms.uIonBurn.value = 0.0;
      this.sm.underglow.intensity = 0.15 + phaseProgress * 0.8;
      this.sm.laserRing.visible = false;
      this.audio.setPilotCocoonMode(false, modelType);
    }
    // Phase 2: Aero-Thermal Velocity
    else if (p >= 0.35 && p < 0.55) {
      const phaseProgress = (p - 0.35) / 0.20;
      this.sm.targetLevitationY = 0.25;
      this.flameMat.uniforms.uThrottle.value = 0.3 + phaseProgress * 0.5;
      this.flameMat.uniforms.uIonBurn.value = phaseProgress;
      this.sm.underglow.intensity = 0.95;
      this.sm.laserRing.visible = false;
      this.audio.setPilotCocoonMode(false, modelType);
    }
    // Phase 3: The Mechanical Brain
    else if (p >= 0.55 && p < 0.75) {
      this.sm.targetLevitationY = 0.25;
      this.flameMat.uniforms.uThrottle.value = 0.4;
      this.flameMat.uniforms.uIonBurn.value = 1.0;
      this.sm.underglow.intensity = 0.95;
      this.sm.laserRing.visible = true;
      this.audio.setPilotCocoonMode(false, modelType);
    }
    // Phase 4: Pilot Sanctuary
    else if (p >= 0.75 && p < 0.90) {
      this.sm.targetLevitationY = 0.25;
      this.flameMat.uniforms.uThrottle.value = 0.25;
      this.flameMat.uniforms.uIonBurn.value = 1.0;
      this.sm.underglow.intensity = 1.2;
      this.sm.laserRing.visible = false;
      this.audio.setPilotCocoonMode(true, modelType);
    }
    // Phase 5: Absolute Freedom
    else if (p >= 0.90 && !this.showroomUnlocked) {
      this._unlockShowroom();
    }

    const tickIdx = Math.min(2, Math.floor(p / 0.35));
    const ticks = document.querySelectorAll('.nt-tick');
    ticks.forEach((tick, idx) => tick.classList.toggle('act', idx === tickIdx));
  }

  _interpolateCamera(p) {
    if (this.showroomUnlocked || this.isTransitioning) return;

    const kf = KEYFRAMES[this.currentFile] || KEYFRAMES['mercedes_amg_gt4.glb'];
    let from = kf[0], to = kf[1];
    for (let i = 0; i < kf.length - 1; i++) {
      if (p >= kf[i].t && p <= kf[i+1].t) {
        from = kf[i];
        to = kf[i+1];
        break;
      }
    }

    const duration = to.t - from.t;
    const ratio = duration > 0 ? (p - from.t) / duration : 1.0;
    const easedRatio = this._easeBezier(ratio);

    this.sm.camera.position.lerpVectors(from.p, to.p, easedRatio);
    const target = new THREE.Vector3().lerpVectors(from.look, to.look, easedRatio);
    this.sm.camera.lookAt(target);
    this.sm.controls.target.copy(target);
  }

  _easeBezier(t) {
    return t * t * (3 - 2 * t);
  }

  /* ══════════════════════════════════════════
     SHOWROOM UNLOCK & INTERACTIVE SYSTEMS
     ══════════════════════════════════════════ */
  _unlockShowroom() {
    this.showroomUnlocked = true;
    const d = this._dom;

    this.sm.controls.enabled = false;
    this.isTransitioning = true;

    if (d.hudOverlay) d.hudOverlay.classList.add('active');
    if (d.ticks) d.ticks.style.opacity = '0';

    if (!this.audio.isStarted) {
      this._toggleIgnition();
    }

    const targetKf = KEYFRAMES[this.currentFile] || KEYFRAMES['mercedes_amg_gt4.glb'];
    const pEnd = targetKf[6].p; // index 6 is t = 1.00
    const lookEnd = targetKf[6].look;

    if (typeof gsap !== 'undefined') {
      gsap.to(this.sm.camera.position, {
        x: pEnd.x, y: pEnd.y, z: pEnd.z,
        duration: 1.5, ease: 'power2.out'
      });
      gsap.to(this.sm.controls.target, {
        x: lookEnd.x, y: lookEnd.y, z: lookEnd.z,
        duration: 1.5, ease: 'power2.out',
        onComplete: () => {
          this.isTransitioning = false;
          this.sm.controls.enabled = true; // Enable OrbitControls at wide zoom!
        }
      });
    } else {
      this.sm.camera.position.copy(pEnd);
      this.sm.camera.lookAt(lookEnd);
      this.sm.controls.target.copy(lookEnd);
      this.isTransitioning = false;
      this.sm.controls.enabled = true;
    }
  }

  _lockShowroom() {
    this.showroomUnlocked = false;
    const d = this._dom;

    this.sm.controls.enabled = false;

    this.targetScroll = 0.0;
    this.scrollProxy.progress = 0.0;

    if (d.hudOverlay) d.hudOverlay.classList.remove('active');
    if (d.ticks) d.ticks.style.opacity = '1';

    if (this.audio.isStarted) {
      this._toggleIgnition();
    }

    this._updateTimeline(0.0);
  }

  _exitShowroomToScroll() {
    this.showroomUnlocked = false;
    const d = this._dom;

    // Disable OrbitControls
    this.sm.controls.enabled = false;

    // Reset controls target
    this.sm.controls.target.set(0, 0.7, 0);

    // Hide HUD console overlay and show ticks
    if (d.hudOverlay) d.hudOverlay.classList.remove('active');
    if (d.ticks) d.ticks.style.opacity = '1';

    // Transition audio back to cocoon mode (Phase 4 cocoon)
    const modelType = MODELS[this.currentFile].audioType;
    this.audio.setPilotCocoonMode(true, modelType);

    // Set scroll targets just below the showroom threshold
    this.targetScroll = 0.89;

    const targetKf = KEYFRAMES[this.currentFile] || KEYFRAMES['mercedes_amg_gt4.glb'];
    const pTarget = targetKf[5].p; // Phase 4 keyframe at index 5
    const lookTarget = targetKf[5].look;

    if (typeof gsap !== 'undefined') {
      this.isTransitioning = true;
      gsap.to(this.sm.camera.position, {
        x: pTarget.x, y: pTarget.y, z: pTarget.z,
        duration: 1.2, ease: 'power2.out'
      });
      gsap.to(this.sm.controls.target, {
        x: lookTarget.x, y: lookTarget.y, z: lookTarget.z,
        duration: 1.2, ease: 'power2.out',
        onComplete: () => {
          this.isTransitioning = false;
        }
      });
      gsap.to(this.scrollProxy, {
        progress: 0.89,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: () => {
          this._updateTimeline(this.scrollProxy.progress);
        }
      });
    } else {
      this.scrollProxy.progress = 0.89;
      this._updateTimeline(0.89);
    }
  }

  /* ══════════════════════════════════════════
     HOTSPOTS HUD CALCULATIONS
     ══════════════════════════════════════════ */
  updateHotspots() {
    if (!this.showroomUnlocked || this.isTransitioning) {
      this._hideAllHotspots();
      return;
    }

    const hs = HOTSPOTS[this.currentFile] || [];
    const container = document.getElementById('hotspots-container');
    if (!container) return;

    while (this._hotspotEls.length < hs.length) {
      const el = this._createHotspotElement(this._hotspotEls.length, hs[this._hotspotEls.length]);
      container.appendChild(el);
      this._hotspotEls.push(el);
    }

    const cam = this.sm.camera;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vec = new THREE.Vector3();

    hs.forEach((hotspot, i) => {
      const el = this._hotspotEls[i];
      if (!el) return;

      vec.copy(hotspot.pos);
      vec.project(cam);

      if (vec.z > 1) { el.style.display = 'none'; return; }

      const sx = (vec.x *  0.5 + 0.5) * w;
      const sy = (vec.y * -0.5 + 0.5) * h;

      el.style.display = 'block';
      el.style.left = sx + 'px';
      el.style.top  = sy + 'px';
    });
  }

  _createHotspotElement(idx, hs) {
    const wrap = document.createElement('div');
    wrap.className = 'hotspot-marker';
    wrap.style.position = 'absolute';
    wrap.style.pointerEvents = 'auto';
    wrap.innerHTML = `
      <div class="hs-ring"></div>
      <div class="hs-dot"></div>
      <div class="hs-tooltip">
        <div class="hs-header-row">
          <span class="hs-title">${hs.label}</span>
          <span class="hs-status-log">ACTIVE</span>
        </div>
        <div class="hs-desc">${hs.desc}</div>
        <div class="hs-telemetry-grid">
          ${hs.telemetry.map(t => `
            <div class="hs-t-item">
              <span class="hs-t-lbl">${t.k}</span>
              <span class="hs-t-val">${t.v}</span>
            </div>
          `).join('')}
        </div>
        <div class="hs-pulse-bar"><div class="hs-pulse-bar-fill"></div></div>
      </div>
    `;

    // Click → fly to hotspot camera position
    wrap.addEventListener('click', () => {
      if (hs.cam && typeof gsap !== 'undefined') {
        this.flyToCamera(hs.cam.p, hs.cam.t);
      }
      this.audio.playTactileClick('click');
    });

    wrap.addEventListener('mouseenter', () => { this.audio.playTactileClick('hover'); });
    return wrap;
  }

  _hideAllHotspots() {
    this._hotspotEls.forEach(el => { el.style.display = 'none'; });
  }

  flyToCamera(pos, target) {
    if (this.isTransitioning || typeof gsap === 'undefined') return;
    this.isTransitioning = true;

    gsap.to(this.sm.camera.position, {
      x: pos.x, y: pos.y, z: pos.z,
      duration: 1.6, ease: 'power3.inOut'
    });
    gsap.to(this.sm.controls.target, {
      x: target.x, y: target.y, z: target.z,
      duration: 1.6, ease: 'power3.inOut',
      onComplete: () => { this.isTransitioning = false; }
    });
  }

  /* ══════════════════════════════════════════
     KEYBOARD NAVIGATION
     ══════════════════════════════════════════ */
  _initKeyboardHandler() {
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();

      if (key === ' ' || key === 'space') {
        e.preventDefault();
        this._toggleIgnition();
      } else if (key === 'w' || key === 'arrowup') {
        e.preventDefault();
        if (this.audio.isStarted && !this.throttleActive) {
          this.throttleActive = true;
          this._startThrottleLoop();
        }
      } else if (key === 'x') {
        this._shiftUp();
      } else if (key === 'z') {
        this._shiftDown();
      } else if (key === 'e') {
        this._triggerBackfire();
      } else if (key === 'tab') {
        e.preventDefault();
        this._switchModel();
      } else if (key === 'h') {
        const legend = document.getElementById('hotkeys-legend');
        if (legend) legend.classList.toggle('show');
      }
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        this.throttleActive = false;
      }
    });
  }

  /* ── THROTTLE TRIGGER MECHANICS ── */
  _startThrottleLoop() {
    const ramp = () => {
      if (!this.throttleActive || !this.audio.isStarted) {
        this._releaseThrottle();
        return;
      }
      this.throttleVal = Math.min(this.throttleVal + 0.025, 1.0);
      this._applyThrottle(this.throttleVal);
      requestAnimationFrame(ramp);
    };
    ramp();
  }

  _releaseThrottle() {
    const decay = () => {
      this.throttleVal = Math.max(this.throttleVal - 0.04, 0);
      this._applyThrottle(this.throttleVal);
      if (this.throttleVal > 0.001) {
        requestAnimationFrame(decay);
      } else {
        this.throttleVal = 0;
        this._applyThrottle(0);
      }
    };
    decay();
  }

  _applyThrottle(val) {
    const modelType = MODELS[this.currentFile].audioType;
    const gm = GEAR_PITCH_MULT[this.currentGear] || 1.0;
    this.audio.updateThrottle(val, modelType, gm);
    this.flameMat.uniforms.uThrottle.value = val;

    if (this._dom.leverFill) {
      this._dom.leverFill.style.width = (val * 100) + '%';
      this._dom.leverThumb.style.left = (val * 100) + '%';
    }

    if (this._dom.exhaustGlow) {
      this._dom.exhaustGlow.classList.toggle('revving', val > 0.1);
    }
  }

  /* ── IGNITION ── */
  _toggleIgnition() {
    const modelType = MODELS[this.currentFile].audioType;
    const d = this._dom;
    if (!this.audio.isStarted) {
      this.audio.startEngine(modelType);
      if (d.igniteBtn) { d.igniteBtn.textContent = 'SYSTEM ACTIVE'; d.igniteBtn.classList.add('active'); }
    } else {
      this.audio.stopEngine();
      this.currentGear = 0;
      this.throttleVal = 0;
      this.throttleActive = false;
      this.flameMat.uniforms.uThrottle.value = 0;
      this.flameMat.uniforms.uBackfire.value = 0;
      if (d.igniteBtn) { d.igniteBtn.textContent = 'IGNITE REACTION'; d.igniteBtn.classList.remove('active'); }
      this._updateGearHUD();
      this._applyThrottle(0);
    }
  }

  /* ── GEARS ── */
  _shiftUp() {
    if (!this.audio.isStarted || this.currentGear >= 6) return;
    this.currentGear++;
    this.audio.playGearClank();
    this._updateGearHUD();
    if (this.throttleVal > 0.3) {
      this.audio.ignitionCut();
      this._triggerBackfire();
    }
  }

  _shiftDown() {
    if (!this.audio.isStarted || this.currentGear <= 0) return;
    this.currentGear--;
    this.audio.playGearClank();
    this._updateGearHUD();
  }

  _updateGearHUD() {
    const d = this._dom;
    if (d.hgear) {
      d.hgear.textContent = GEAR_NAMES[this.currentGear] || 'N';
      d.hgear.style.color = this.currentGear === 0 ? '#7000FF' : '#F1F4F9';
    }
  }

  _triggerBackfire() {
    if (!this.audio.isStarted) return;
    this.audio.triggerBackfire();
    this.flameMat.uniforms.uBackfire.value = 1.0;

    if (typeof gsap !== 'undefined') {
      gsap.to(this.flameMat.uniforms.uBackfire, {
        value: 0.0, duration: 0.45, ease: 'power2.out'
      });

      const cam = this.sm.camera;
      const ox = cam.position.x, oy = cam.position.y;
      gsap.to(cam.position, {
        x: ox + (Math.random() - 0.5) * 0.14,
        y: oy + (Math.random() - 0.5) * 0.14,
        duration: 0.04
      });
      gsap.to(cam.position, {
        x: ox, y: oy, duration: 0.22, delay: 0.04, ease: 'elastic.out(1,0.6)'
      });
    }

    if (navigator.vibrate) navigator.vibrate(14);
  }

  /* ══════════════════════════════════════════
     MODEL SWITCHER
     ══════════════════════════════════════════ */
  _initModelSwitcher() {
    const btns = document.querySelectorAll('#mswitcher .showroom-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.file;
        if (target && target !== this.currentFile) {
          this.currentFile = target;
          this._switchToModel(target);
          this.audio.playTactileClick('click');
        }
      });
    });
  }

  _switchModel() {
    const files = Object.keys(MODELS);
    const idx = files.indexOf(this.currentFile);
    const nextFile = files[(idx + 1) % files.length];
    this.currentFile = nextFile;
    this._switchToModel(nextFile);
  }

  _switchToModel(filename) {
    // 1. Reset showroom state & scroll positions immediately
    this.showroomUnlocked = false;
    this.targetScroll = 0.0;
    this.scrollProxy.progress = 0.0;

    const d = this._dom;
    if (d.hudOverlay) d.hudOverlay.classList.remove('active');
    if (d.ticks) {
      d.ticks.style.opacity = '1';
      // Reset active tick class
      const ticks = document.querySelectorAll('.nt-tick');
      ticks.forEach((tick, idx) => tick.classList.toggle('act', idx === 0));
    }
    if (d.timelineFill) d.timelineFill.style.width = '0%';

    // Reset narrative active sections to Phase 0
    for (let i = 0; i <= 5; i++) {
      const el = document.getElementById(`phase-${i}`);
      if (el) el.classList.toggle('active', i === 0);
    }

    // 2. Shut down audio engine
    if (this.audio.isStarted) {
      this.audio.stopEngine();
      this.audio.dispose();
    }
    this.currentGear = 0;
    this.throttleVal = 0;
    this.throttleActive = false;
    this.flameMat.uniforms.uThrottle.value = 0;
    this.flameMat.uniforms.uBackfire.value = 0;
    this._updateGearHUD();
    this._applyThrottle(0);

    // Disable OrbitControls during fly-back
    this.sm.controls.enabled = false;
    this.isTransitioning = true;

    const targetKf = KEYFRAMES[filename] || KEYFRAMES['mercedes_amg_gt4.glb'];
    const pStart = targetKf[0].p;
    const lookStart = targetKf[0].look;

    if (typeof gsap !== 'undefined') {
      // 3. Cinematic camera fly-back animation
      gsap.to(this.sm.camera.position, {
        x: pStart.x, y: pStart.y, z: pStart.z,
        duration: 1.4, ease: 'power2.inOut'
      });
      gsap.to(this.sm.controls.target, {
        x: lookStart.x, y: lookStart.y, z: lookStart.z,
        duration: 1.4, ease: 'power2.inOut'
      });

      // 4. Holographic de-materialize
      if (this.sm.currentModel) {
        gsap.to(this.sm.currentModel.scale, {
          x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.in'
        });
        gsap.to(this.sm.currentModel.position, {
          y: this.sm.currentModel.position.y - 0.4, duration: 0.8, ease: 'power2.in',
          onComplete: () => {
            this.isTransitioning = false;
            this._loadNextModel(filename);
          }
        });
        gsap.to(this.sm.underglow, {
          intensity: 0.0, duration: 0.6
        });
      } else {
        setTimeout(() => {
          this.isTransitioning = false;
          this._loadNextModel(filename);
        }, 1400);
      }
    } else {
      this.sm.camera.position.copy(pStart);
      this.sm.camera.lookAt(lookStart);
      this.sm.controls.target.copy(lookStart);
      this.isTransitioning = false;
      this._loadNextModel(filename);
    }
  }

  _loadNextModel(filename) {
    const d = this._dom;
    this.sm.disposeCurrentModel();
    this._hotspotEls.forEach(el => el.remove());
    this._hotspotEls = [];

    const m = MODELS[filename];
    if (d.hmodel) d.hmodel.textContent = m ? m.name : '';
    this._updateSpecBox();
    this._updateModelSwitcherBtns();
    this._updateNarrativeTexts(filename);

    this.sm.loadModel(
      filename, this.flameMat, this.flames,
      (model) => {
        if (model) {
          const targetScale = model.scale.x;
          model.scale.set(0, 0, 0);
          model.position.y -= 0.4;

          if (typeof gsap !== 'undefined') {
            gsap.to(model.scale, {
              x: targetScale, y: targetScale, z: targetScale, duration: 0.8, ease: 'power2.out',
              onComplete: () => {
                if (this.showroomUnlocked) this.sm.controls.enabled = true;
              }
            });
            gsap.to(model.position, {
              y: this.sm.modelBaseY, duration: 0.8, ease: 'power2.out'
            });
            gsap.to(this.sm.underglow, {
              intensity: 1.2, duration: 0.8
            });

            // Trigger scanner ring sweep over the materialized car
            this.sm.laserRing.visible = true;
            this.sm.laserRing.position.z = -2.5;
            gsap.to(this.sm.laserRing.position, {
              z: 2.5, duration: 1.2, ease: 'power1.inOut',
              onComplete: () => {
                this.sm.laserRing.visible = false;
              }
            });
          } else {
            model.scale.setScalar(targetScale);
            model.position.y = this.sm.modelBaseY;
            if (this.showroomUnlocked) this.sm.controls.enabled = true;
          }
        }
      },
      (prog) => {},
      null
    );
  }

  _updateModelSwitcherBtns() {
    const btns = document.querySelectorAll('#mswitcher .showroom-btn');
    btns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.file === this.currentFile);
    });
  }

  _updateSpecBox() {
    const m = MODELS[this.currentFile];
    if (!m) return;
    const ids = ['sp-accel', 'sp-top', 'sp-pow', 'sp-eng'];
    const vals = [m.spec.accel, m.spec.top, m.spec.power, m.spec.eng];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = vals[i];
    });

    const texts = NARRATIVE_TEXTS[this.currentFile];
    if (texts) {
      const ethosEl = document.getElementById('hud-ethos');
      if (ethosEl) ethosEl.textContent = texts.ethos;

      const trackExpEl = document.getElementById('hud-track-exp');
      if (trackExpEl) trackExpEl.textContent = texts.trackExp;
    }
  }

  _updateNarrativeTexts(filename) {
    const texts = NARRATIVE_TEXTS[filename];
    if (!texts) return;

    // Body class toggle
    document.body.classList.toggle('theme-evo', filename === 'amg_evo_3.glb');

    // Update Three.js scene colors
    this.sm.setThemeColor(texts.themeColorHex);

    // Update DOM text fields
    const $ = (id) => document.getElementById(id);
    
    if ($('p0-label')) $('p0-label').textContent = texts.p0.label;
    if ($('p0-title')) $('p0-title').innerHTML = texts.p0.title;
    if ($('p0-desc')) $('p0-desc').textContent = texts.p0.desc;

    if ($('p1-label')) $('p1-label').textContent = texts.p1.label;
    if ($('p1-title')) $('p1-title').innerHTML = texts.p1.title;
    if ($('p1-desc')) $('p1-desc').textContent = texts.p1.desc;
    if ($('p1-telemetry')) $('p1-telemetry').innerHTML = texts.p1.telemetry;

    if ($('p2-label')) $('p2-label').textContent = texts.p2.label;
    if ($('p2-title')) $('p2-title').innerHTML = texts.p2.title;
    if ($('p2-desc')) $('p2-desc').textContent = texts.p2.desc;

    if ($('p3-label')) $('p3-label').textContent = texts.p3.label;
    if ($('p3-title')) $('p3-title').innerHTML = texts.p3.title;
    if ($('p3-desc')) $('p3-desc').textContent = texts.p3.desc;
    if ($('p3-col2')) $('p3-col2').innerHTML = texts.p3.col2;
    if ($('p3-col3')) $('p3-col3').innerHTML = texts.p3.col3;

    if ($('p4-quote')) $('p4-quote').textContent = texts.p4.quote;
    if ($('p4-desc')) $('p4-desc').textContent = texts.p4.desc;
  }

  /* ══════════════════════════════════════════
     TACTILE LEVER & INTERACTIVE BUTTONS
     ══════════════════════════════════════════ */
  _initEngineControls() {
    const d = this._dom;

    if (d.igniteBtn) {
      d.igniteBtn.addEventListener('click', () => {
        this._toggleIgnition();
        this.audio.playTactileClick('click');
      });
    }

    let isDragging = false;
    const updateLever = (clientX) => {
      const rect = d.leverTrack.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.throttleVal = pct;
      this._applyThrottle(pct);
    };

    if (d.leverTrack) {
      d.leverTrack.addEventListener('mousedown', (e) => {
        if (!this.audio.isStarted) return;
        isDragging = true;
        updateLever(e.clientX);
      });
      document.addEventListener('mousemove', (e) => {
        if (isDragging) updateLever(e.clientX);
      });
      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          this.throttleActive = false;
          this._releaseThrottle();
        }
      });
    }
  }

  /* ══════════════════════════════════════════
     NARRATIVE TICKS
     ══════════════════════════════════════════ */
  _initNarrativeTicks() {
    const ticks = document.querySelectorAll('.nt-tick');
    ticks.forEach((tick, i) => {
      tick.addEventListener('click', () => {
        const targets = [0.0, 0.35, 0.95];
        this.targetScroll = targets[i];

        if (typeof gsap !== 'undefined') {
          gsap.to(this.scrollProxy, {
            progress: this.targetScroll,
            duration: 1.6,
            ease: 'power4.out',
            overwrite: 'auto',
            onUpdate: () => { this._updateTimeline(this.scrollProxy.progress); }
          });
        } else {
          this.scrollProxy.progress = this.targetScroll;
          this._updateTimeline(this.targetScroll);
        }
        this.audio.playTactileClick('click');
      });
    });
  }

  /* ══════════════════════════════════════════
     EXIT BUTTON
     ══════════════════════════════════════════ */
  _initExitButton() {
    const d = this._dom;
    if (d.nexit) {
      d.nexit.addEventListener('click', () => {
        this._exitShowroomToScroll();
        this.audio.playTactileClick('click');
      });
    }
  }

  /* ══════════════════════════════════════════
     CUSTOM CURSOR SYSTEM
     ══════════════════════════════════════════ */
  _initCursorSystem() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('mousemove', (e) => {
      this._cursorPos.x = e.clientX;
      this._cursorPos.y = e.clientY;
    });

    const interactives = '.showroom-btn, .nt-tick, #nexit-btn, #intro-test-audio-btn, #engage-btn, #lever-track';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => { this._setCursorStyle('hover'); });
      el.addEventListener('mouseleave', () => { this._setCursorStyle('default'); });
    });

    const canvas = this.sm.renderer.domElement;
    canvas.addEventListener('mouseenter', () => {
      if (this.showroomUnlocked) this._setCursorStyle('canvas');
    });
    canvas.addEventListener('mouseleave', () => { this._setCursorStyle('default'); });
  }

  _setCursorStyle(mode) {
    const d = this._dom;
    if (!d.cursorRing) return;

    switch (mode) {
      case 'hover':
        d.cursorRing.style.width = '36px';
        d.cursorRing.style.height = '36px';
        d.cursorRing.style.borderColor = '#ffffff';
        d.cursorLabel.style.opacity = '0';
        break;
      case 'canvas':
        d.cursorRing.style.width = '40px';
        d.cursorRing.style.height = '40px';
        d.cursorRing.style.borderColor = '#00E5FF';
        d.cursorLabel.textContent = 'DRAG TO ORBIT';
        d.cursorLabel.style.opacity = '1';
        break;
      default:
        d.cursorRing.style.width = '24px';
        d.cursorRing.style.height = '24px';
        d.cursorRing.style.borderColor = '#00E5FF';
        d.cursorLabel.style.opacity = '0';
    }
  }

  updateCursor() {
    const d = this._dom;
    if (!d.cursorDot) return;

    this._ringPos.x += (this._cursorPos.x - this._ringPos.x) * 0.15;
    this._ringPos.y += (this._cursorPos.y - this._ringPos.y) * 0.15;

    d.cursorDot.style.left  = this._cursorPos.x + 'px';
    d.cursorDot.style.top   = this._cursorPos.y + 'px';
    d.cursorRing.style.left = this._ringPos.x + 'px';
    d.cursorRing.style.top  = this._ringPos.y + 'px';
    d.cursorLabel.style.left = this._ringPos.x + 'px';
    d.cursorLabel.style.top  = this._ringPos.y + 'px';
  }

  /* ══════════════════════════════════════════
     HERITAGE CARDS
     ══════════════════════════════════════════ */
  _initHeritageCards() {
    this._initChassisScanner();
    this._initOscilloscope();

    const audioBtn = document.getElementById('intro-test-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const analyser = this.audio.playIntroSweep();
        if (analyser) this._drawLiveSpectrum(analyser);
      });
    }
  }

  _initChassisScanner() {
    const cv = this._dom.chassisCanvas;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth * 2;
    const H = cv.height = cv.offsetHeight * 2;

    const verts = [
      [-1.0, -0.4, -1.2], [1.0, -0.4, -1.2],
      [-1.0, -0.4, 1.2],  [1.0, -0.4, 1.2],
      [-0.9, 0.0, -1.0],  [0.9, 0.0, -1.0],
      [-0.9, 0.0, 1.0],   [0.9, 0.0, 1.0],
      [-0.7, 0.3, -0.4],  [0.7, 0.3, -0.4],
      [-0.7, 0.3, 0.4],   [0.7, 0.3, 0.4]
    ];
    const edges = [[0,1],[2,3],[0,2],[1,3],[4,5],[6,7],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7],[4,8],[5,9],[6,10],[7,11],[8,9],[10,11],[8,10],[9,11]];

    let angle = 0;
    let speed = 0.012;
    const camDist = 3.3;

    const card = cv.closest('.h-card');
    if (card) {
      card.addEventListener('mouseenter', () => { speed = 0.048; });
      card.addEventListener('mouseleave', () => { speed = 0.012; });
    }

    const project = (v) => {
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const x = v[0] * cosA - v[2] * sinA;
      const z = v[0] * sinA + v[2] * cosA;
      const perspective = camDist / (camDist + z);
      return [W / 2 + x * W * 0.25 * perspective, H / 2 - v[1] * H * 0.5 * perspective];
    };

    const draw = () => {
      angle += speed;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const [x1, y1] = project(verts[a]);
        const [x2, y2] = project(verts[b]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });

      ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
      verts.forEach(v => {
        const [x, y] = project(v);
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      });

      const laserY = H * 0.5 + Math.sin(angle * 2.2) * H * 0.35;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, laserY); ctx.lineTo(W, laserY); ctx.stroke();

      this._chassisScanRAF = requestAnimationFrame(draw);
    };
    draw();
  }

  _initOscilloscope() {
    const cv = this._dom.oscilloCanvas;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth * 2;
    const H = cv.height = cv.offsetHeight * 2;

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.038 - t * 2.8) * Math.cos(x * 0.008 + t * 0.4) * H * 0.20;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      this._oscilloscopeRAF = requestAnimationFrame(draw);
    };
    draw();
  }

  _drawLiveSpectrum(analyser) {
    const cv = this._dom.oscilloCanvas;
    if (!cv || !analyser) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    let frames = 0;

    if (this._oscilloscopeRAF) cancelAnimationFrame(this._oscilloscopeRAF);

    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, W, H);
      const barW = W / bufLen * 2.5;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 255;
        const barH = v * H * 0.8;
        ctx.fillStyle = `rgba(0, 229, 255, ${0.3 + v * 0.7})`;
        ctx.fillRect(i * barW, H - barH, barW - 1, barH);
      }
      frames++;
      if (frames < 120) {
        this._oscilloscopeRAF = requestAnimationFrame(draw);
      } else {
        this._initOscilloscope();
      }
    };
    draw();
  }

  _initResizeHandler() {
    window.addEventListener('resize', () => {
      this.sm.resize(window.innerWidth, window.innerHeight);
    });
  }

  dispose() {
    if (this._chassisScanRAF)  cancelAnimationFrame(this._chassisScanRAF);
    if (this._oscilloscopeRAF) cancelAnimationFrame(this._oscilloscopeRAF);
  }
}
