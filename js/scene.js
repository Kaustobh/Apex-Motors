/* ═══════════════════════════════════════════════════════════════
   APEX MOTORS — Three.js Engine Kernel (Authentic AMG Specifications)
   WebGL renderer, ACES Filmic tone mapping (exposure 1.15),
   levitation offset handler, and robust disposal procedures.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { OrbitControls }  from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader }     from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }    from 'three/addons/loaders/DRACOLoader.js';
import { EXHAUST_OFFSETS } from './shaders.js';

/** Vehicle model specifications (Real Mercedes-AMG Engineering Data). */
export const MODELS = {
  'mercedes_amg_gt4.glb': {
    name: 'AMG GT4',
    audioType: 'gt4',
    spec: { accel: '3.8s', top: '155+ mph', power: '510 hp', eng: '4.0L V8 BiTurbo (M178)' }
  },
  'amg_evo_3.glb': {
    name: 'AMG GT3 EVO',
    audioType: 'evo3',
    spec: { accel: '3.0s', top: '177+ mph', power: '550 hp', eng: '6.3L NA V8 (M159)' }
  }
};

/** Normalized keyframe positions (used for scroll navigation). */
export const KEYFRAMES = {
  'mercedes_amg_gt4.glb': [
    { t: 0.00, p: new THREE.Vector3(0.0,  0.4,  6.5), look: new THREE.Vector3(0, 0.6, 0) },    // Phase 0: Silent Assembly
    { t: 0.15, p: new THREE.Vector3(0.0,  0.4,  6.5), look: new THREE.Vector3(0, 0.6, 0) },    // Pause
    { t: 0.35, p: new THREE.Vector3(-4.5, 0.8,  1.2), look: new THREE.Vector3(0, 0.3, 0) },    // Phase 1: Ignition (Biturbo V8)
    { t: 0.55, p: new THREE.Vector3(1.8,  1.6, -3.8), look: new THREE.Vector3(0, 0.8, -1.5) },  // Phase 2: Aero-Thermal Velocity
    { t: 0.75, p: new THREE.Vector3(0.0,  4.2,  0.2), look: new THREE.Vector3(0, 0.5, 0.2) },   // Phase 3: Brain Scan (Overhead)
    { t: 0.90, p: new THREE.Vector3(0.0,  1.1,  0.5), look: new THREE.Vector3(0, 1.0, -1.5) },  // Phase 4: Pilot Sanctuary
    { t: 1.00, p: new THREE.Vector3(3.5,  1.8,  5.0), look: new THREE.Vector3(0, 0.7, 0) }     // Phase 5: Absolute Freedom (Orbit)
  ],
  'amg_evo_3.glb': [
    { t: 0.00, p: new THREE.Vector3(0.0,  0.4,  6.5), look: new THREE.Vector3(0, 0.6, 0) },    // Phase 0: Silent Assembly
    { t: 0.15, p: new THREE.Vector3(0.0,  0.4,  6.5), look: new THREE.Vector3(0, 0.6, 0) },    // Pause
    { t: 0.35, p: new THREE.Vector3(-3.2, 0.5,  1.8), look: new THREE.Vector3(-0.9, 0.35, 1.2) }, // Phase 1: Focus center-lock wheel
    { t: 0.55, p: new THREE.Vector3(1.5,  1.2, -4.2), look: new THREE.Vector3(0, 0.8, -1.5) },   // Phase 2: Focus swan-neck wing/rear exhaust
    { t: 0.75, p: new THREE.Vector3(0.0,  4.2,  0.2), look: new THREE.Vector3(0, 0.5, 0.2) },   // Phase 3: Brain Scan (Overhead)
    { t: 0.90, p: new THREE.Vector3(0.0,  1.15, 0.6), look: new THREE.Vector3(0, 1.05, -1.2) },  // Phase 4: Focus pilot sanctuary cockpit
    { t: 1.00, p: new THREE.Vector3(3.5,  1.8,  5.0), look: new THREE.Vector3(0, 0.7, 0) }     // Phase 5: Absolute Freedom (Orbit)
  ]
};

/** Hotspot descriptions with real-world AMG telemetry parameters and camera fly-to nodes. */
export const HOTSPOTS = {
  'mercedes_amg_gt4.glb': [
    { label: 'ADJUSTABLE FRONT SPLITTER', pos: new THREE.Vector3(0, 0.2, 2.3),   desc: 'Adjustable carbon-fiber front splitter mapping aero downforce.', telemetry: [{ k:'DOWNFORCE', v:'120 kg'},{ k:'VELOCITY', v:'70 m/s'},{ k:'MATERIAL', v:'Prepreg CF' }], cam: { p: new THREE.Vector3(0, 0.6, 3.8), t: new THREE.Vector3(0, 0.2, 2.3) } },
    { label: 'V8 BITURBO ENGINE',  pos: new THREE.Vector3(0, 0.85, 1.2),  desc: 'AMG M178 4.0L direct injection twin-turbocharged V8 engine.', telemetry: [{ k:'ENGINE', v:'AMG M178'},{ k:'BOOST', v:'1.35 Bar'},{ k:'OIL TEMP', v:'98 °C' }], cam: { p: new THREE.Vector3(0.4, 1.5, 2.5), t: new THREE.Vector3(0, 0.85, 1.2) } },
    { label: 'RACING BRAKE SYSTEM', pos: new THREE.Vector3(-0.9, 0.35, 1.3),desc: '6-piston front brake calipers with ventilated steel discs.',  telemetry: [{ k:'ABS', v:'Setting 5/11'},{ k:'BRAKING', v:'600 Nm'},{ k:'TEMP', v:'420 °C' }], cam: { p: new THREE.Vector3(-2.0, 0.8, 2.2), t: new THREE.Vector3(-0.9, 0.35, 1.3) } },
    { label: 'ALUMINUM SPACEFRAME', pos: new THREE.Vector3(0, 1.15, -0.2),  desc: 'Aluminium spaceframe structure with high-strength steel roll cage.', telemetry: [{ k:'WEIGHT', v:'1390 kg'},{ k:'CAGE', v:'Integrated'},{ k:'RIGID', v:'42 kNm/deg' }], cam: { p: new THREE.Vector3(0.6, 1.6, 1.2), t: new THREE.Vector3(0, 1.15, -0.2) } },
    { label: 'ADJUSTABLE REAR WING', pos: new THREE.Vector3(0, 1.35, -2.1), desc: 'Adjustable carbon-fiber rear wing with multi-step angles.', telemetry: [{ k:'F↓ REAR', v:'340 kg'},{ k:'ATTACK', v:'12.5°'},{ k:'Cd', v:'0.34' }], cam: { p: new THREE.Vector3(0, 1.6, -3.6), t: new THREE.Vector3(0, 1.35, -2.1) } }
  ],
  'amg_evo_3.glb': [
    { label: 'CARBON FLICS & SPLITTER', pos: new THREE.Vector3(0.8, 0.25, 2.2), desc: 'Front carbon-fiber flics and aerodynamic splitter diffuser.', telemetry: [{ k:'DOWNFORCE', v:'150 kg'},{ k:'VELOCITY', v:'84 m/s'},{ k:'MATERIAL', v:'Carbon Autoclave'}], cam: { p: new THREE.Vector3(2.0, 0.7, 3.5), t: new THREE.Vector3(0.8, 0.25, 2.2) } },
    { label: 'NATURALLY ASPIRATED V8', pos: new THREE.Vector3(0, 0.85, 1.1),  desc: 'AMG M159 high-revving 6.3-liter naturally aspirated racing V8.',  telemetry: [{ k:'ENGINE', v:'AMG M159'},{ k:'REDLINE', v:'9,000 RPM'},{ k:'TEMP', v:'780 °C'}], cam: { p: new THREE.Vector3(0.5, 1.6, 2.4), t: new THREE.Vector3(0, 0.85, 1.1) } },
    { label: 'CENTER-LOCK RACING HUB', pos: new THREE.Vector3(-0.9, 0.35, 1.2),desc: 'Fast-release pneumatic center-lock hub with magnesium rims.',   telemetry: [{ k:'LOCK TORQ', v:'650 Nm'},{ k:'UNSPRUNG', v:'-3.2 kg'},{ k:'FASTENER', v:'Center-Lock'}], cam: { p: new THREE.Vector3(-2.2, 0.8, 2.0), t: new THREE.Vector3(-0.9, 0.35, 1.2) } },
    { label: 'FIA SAFETY CELL', pos: new THREE.Vector3(0, 1.15, -0.2),  desc: 'FIA-homologated carbon seat tub and safety steel roll cage.', telemetry: [{ k:'CERT', v:'FIA App. J'},{ k:'CAGE', v:'Cr-Mo Steel'},{ k:'WEIGHT', v:'1280 kg'}], cam: { p: new THREE.Vector3(0.5, 1.5, 1.0), t: new THREE.Vector3(0, 1.15, -0.2) } },
    { label: 'SWAN-NECK REAR WING', pos: new THREE.Vector3(0, 1.45, -2.2), desc: 'Swan-neck mounted rear wing optimizing downforce distribution.', telemetry: [{ k:'F↓ REAR', v:'420 kg'},{ k:'ATTACK', v:'14.2°'},{ k:'Cd', v:'0.32'}], cam: { p: new THREE.Vector3(0, 1.7, -3.8), t: new THREE.Vector3(0, 1.45, -2.2) } }
  ]
};

export class SceneManager {
  constructor(canvas) {
    const isMobile = window.innerWidth < 768;

    // ── RENDERER ──
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ── SCENE ──
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030305, 0.025);

    // ── CAMERA ──
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60);
    const initKf = KEYFRAMES['mercedes_amg_gt4.glb'];
    this.camera.position.copy(initKf[0].p);
    this.camera.lookAt(initKf[0].look);

    // ── CONTROLS ──
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 15.0;
    this.controls.maxPolarAngle = Math.PI * 0.51;
    this.controls.enablePan = false;
    this.controls.enabled = false;

    // ── LOADERS ──
    this._gltfLoader = new GLTFLoader();
    this._draco = new DRACOLoader();
    this._draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/');
    this._gltfLoader.setDRACOLoader(this._draco);

    this.currentModel = null;
    this._isMobile = isMobile;
    this.modelBaseY = 0;
    this.targetLevitationY = 0;
    this.currentLevitationY = 0;

    // ── ENVIRONMENT BUILD ──
    this._buildLighting();
    this._buildPlinth();
    this._buildGrid();
    this._buildDustParticles();
    this._buildLaserScanner();
  }

  _buildLighting() {
    this.ambient = new THREE.AmbientLight(0x13141f, 1.2);
    this.scene.add(this.ambient);

    // Key Light
    this.keyLight = new THREE.DirectionalLight(0xffedd5, 3.8);
    this.keyLight.position.set(-5, 8, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Fill & Rim
    this.fillLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
    this.fillLight.position.set(6, 3, -3);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffffff, 4.5);
    this.rimLight.position.set(0, 5, -8);
    this.scene.add(this.rimLight);

    this.underglow = new THREE.PointLight(0x00e5ff, 0.15, 6.0, 2);
    this.underglow.position.set(0, -0.2, 0);
    this.scene.add(this.underglow);
  }

  _buildPlinth() {
    const plinthGeo = new THREE.BoxGeometry(3.0, 0.1, 5.6);
    const plinthMat = new THREE.MeshPhysicalMaterial({
      color: 0x07080c,
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -0.05, 0);
    plinth.receiveShadow = true;
    this.scene.add(plinth);

    const frameGeo = new THREE.BoxGeometry(3.06, 0.02, 5.66);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.8,
      roughness: 0.3, metalness: 0.8
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0.01, 0);
    this.scene.add(frame);
  }

  _buildGrid() {
    const grid = new THREE.GridHelper(30, 30, 0x00e5ff, 0x0a0c10);
    grid.material.opacity = 0.18;
    grid.material.transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);
  }

  _buildDustParticles() {
    const count = this._isMobile ? 250 : 600;
    const geo = new THREE.BufferGeometry();
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      velocities[i * 3]     = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] =  Math.random() * 0.002 + 0.001;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._dustVelocities = velocities;

    this.dustMaterial = new THREE.PointsMaterial({
      size: 0.012,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.dustParticles = new THREE.Points(geo, this.dustMaterial);
    this.scene.add(this.dustParticles);
  }

  _buildLaserScanner() {
    const geo = new THREE.RingGeometry(1.68, 1.70, 48);
    this.laserRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.laserRing = new THREE.Mesh(geo, this.laserRingMat);
    this.laserRing.rotation.x = -Math.PI / 2;
    this.laserRing.position.y = 0.55;
    this.laserRing.visible = false;
    this.scene.add(this.laserRing);
  }

  loadModel(filename, flameMaterial, flames, onDone, onProgress, onError) {
    this._gltfLoader.load(
      filename,
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.8 / maxDim;
        model.scale.setScalar(scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = -box.min.y * scale;

        this.modelBaseY = model.position.y;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              if (child.material.roughness !== undefined)
                child.material.roughness = Math.max(child.material.roughness, 0.32);
              if (child.material.metalness !== undefined)
                child.material.metalness = Math.min(child.material.metalness, 0.8);
            }
          }
        });

        const offsets = EXHAUST_OFFSETS[filename];
        if (offsets && flames) {
          flames.left.position.copy(offsets.left);
          flames.right.position.copy(offsets.right);
          model.add(flames.left);
          model.add(flames.right);
        }

        this.currentModel = model;
        this.scene.add(model);
        onDone(model);
      },
      onProgress,
      onError
    );
  }

  disposeCurrentModel() {
    if (!this.currentModel) return;

    this.currentModel.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          const texKeys = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'envMap', 'clearcoatMap', 'clearcoatNormalMap'];
          for (const key of texKeys) {
            if (mat[key] && mat[key].dispose) mat[key].dispose();
          }
          mat.dispose();
        }
      }
    });

    this.scene.remove(this.currentModel);
    this.currentModel = null;
  }

  update(t) {
    if (this.dustParticles) {
      const pos = this.dustParticles.geometry.attributes.position.array;
      const vel = this._dustVelocities;
      for (let i = 0, n = pos.length / 3; i < n; i++) {
        pos[i * 3]     += vel[i * 3];
        pos[i * 3 + 1] += vel[i * 3 + 1];
        pos[i * 3 + 2] += vel[i * 3 + 2];
        if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = 0;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.currentModel && this.targetLevitationY > 0) {
      this.currentLevitationY += (this.targetLevitationY - this.currentLevitationY) * 0.08;
      const floatOffset = Math.sin(t * 2.0) * 0.04;
      this.currentModel.position.y = this.modelBaseY + this.currentLevitationY + floatOffset;
    } else if (this.currentModel) {
      this.currentLevitationY += (0.0 - this.currentLevitationY) * 0.08;
      this.currentModel.position.y = this.modelBaseY + this.currentLevitationY;
    }

    if (this.laserRing && this.laserRing.visible) {
      this.laserRing.position.z = Math.sin(t * 1.6) * 2.5;
      this.laserRingMat.opacity = 0.38 + Math.sin(t * 2.2) * 0.12;
    }
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setThemeColor(hex) {
    this.underglow.color.setHex(hex);
    this.laserRingMat.color.setHex(hex);
    this.dustMaterial.color.setHex(hex);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
