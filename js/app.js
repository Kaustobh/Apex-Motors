/* ═══════════════════════════════════════════════════════════════
   APEX MOTORS — Main Application Entry Point (ES Module)
   Wires up SceneManager, AudioEngine, and UIController,
   starting the core loop and initiating the first model load.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { AudioEngine } from './audioEngine.js';
import { createFlameShaderMaterial, createExhaustFlames } from './shaders.js';
import { UIController } from './uiController.js';

// Attach THREE to window so external addons (like OrbitControls) can access it easily if needed
window.THREE = THREE;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('cv');
  if (!canvas) {
    console.error('Core WebGL canvas element "#cv" was not found.');
    return;
  }

  // ── INIT SCENE MANAGER ──
  const sm = new SceneManager(canvas);

  // ── INIT AUDIO ENGINE ──
  const audio = new AudioEngine();

  // ── CREATE EXHAUST SHADERS & FLAMES ──
  const flameMat = createFlameShaderMaterial();
  const flames = createExhaustFlames(flameMat);

  // ── INIT UI CONTROLLER ──
  const ui = new UIController(sm, audio, flameMat, flames);
  ui.init();

  // ── LOAD INITIAL MODEL ──
  const initialModel = 'mercedes_amg_gt4.glb';
  sm.loadModel(
    initialModel,
    flameMat,
    flames,
    (model) => {
      if (model) {
        ui.onLoadComplete();
      } else {
        ui.onLoadError();
      }
    },
    (prog) => {
      ui.onLoadProgress(prog);
    },
    (err) => {
      ui.onLoadError();
    }
  );

  // ── CORE RENDER & UPDATE LOOP ──
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Update Three.js animations (particles, laser scanner, underglow)
    sm.update(elapsed);

    // Update custom cursor tracking
    ui.updateCursor();

    // Update 3D hotspot screen space positions
    ui.updateHotspots();

    // Update flame shader uniform time
    if (flameMat.uniforms.uTime) {
      flameMat.uniforms.uTime.value = elapsed;
    }

    // Render WebGL frame
    sm.render();
  }

  animate();
});
