/* ═══════════════════════════════════════════════════════════════
   APEX MOTORS — Volumetric Levitation/Exhaust Flame Shaders
   Custom ShaderMaterial pass for dual exhaust and undercarriage glow.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

/**
 * Creates the custom ShaderMaterial for quantum engine / levitation flames.
 * Incorporates:
 * - uTime (time elapsed)
 * - uThrottle (throttle/thrust factor, extending cone size & intensity)
 * - uBackfire (instantaneous combustion spike)
 * - uIonBurn (0.0 = plasma cyan #00E5FF, 1.0 = deep electric violet #7000FF)
 *
 * @returns {THREE.ShaderMaterial} The configured flame shader material.
 */
export function createFlameShaderMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:     { value: 0.0 },
      uThrottle: { value: 0.0 },
      uBackfire: { value: 0.0 },
      uIonBurn:  { value: 0.0 }
    },

    vertexShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uThrottle;
      uniform float uBackfire;

      void main() {
        vUv = uv;
        // Dynamically scale/extend the flame tip position based on throttle + backfire
        vec3 pos = position;
        if (pos.z < 0.0) {
          pos.z *= (1.0 + uThrottle * 0.8 + uBackfire * 1.5);
          pos.xy *= (1.0 + uThrottle * 0.2 + uBackfire * 0.5);
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,

    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uThrottle;
      uniform float uBackfire;
      uniform float uIonBurn;
      varying vec2 vUv;

      void main() {
        // vUv.y = 0 at base, 1 at tip. Faded at tip.
        float fade = smoothstep(1.0, 0.0, vUv.y);

        // Volumetric coordinate offset pattern
        float noise = sin(vUv.y * 22.0 - uTime * 65.0) 
                    * cos(vUv.x * 12.0 + uTime * 35.0) * 0.16;

        float intensity = fade * (0.2 + uThrottle * 1.2 + uBackfire * 3.5);
        intensity += noise * fade * (uThrottle + uBackfire * 2.0);
        intensity = clamp(intensity, 0.0, 3.5);

        // Color profiles
        // Cyan (#00E5FF): vec3(0.0, 0.9, 1.0)
        // Deep electric violet (#7000FF): vec3(0.44, 0.0, 1.0)
        vec3 colBaseCyan   = vec3(0.0, 0.9, 1.0);
        vec3 colTipCyan    = vec3(0.0, 0.45, 0.7);

        vec3 colBaseViolet = vec3(0.44, 0.0, 1.0);
        vec3 colTipViolet  = vec3(0.12, 0.0, 0.6);

        // Dynamic transition using uIonBurn
        vec3 colBase = mix(colBaseCyan, colBaseViolet, uIonBurn);
        vec3 colTip  = mix(colTipCyan, colTipViolet, uIonBurn);

        // Backfire state: shifts to white-hot core wrapped in neon lime greens
        if (uBackfire > 0.08) {
          colBase = vec3(1.0, 1.0, 1.0); // White-hot
          colTip  = vec3(0.72, 1.0, 0.18); // Neon lime (#B8FF2E)
        }

        vec3 finalCol = mix(colBase, colTip, vUv.y);

        gl_FragColor = vec4(finalCol * intensity * 2.5, intensity);
      }
    `,

    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
}

/**
 * Creates two cone meshes representing the left and right exhaust flames.
 *
 * @param {THREE.ShaderMaterial} material - The flame shader material.
 * @returns {{ left: THREE.Mesh, right: THREE.Mesh }}
 */
export function createExhaustFlames(material) {
  const geo = new THREE.ConeGeometry(0.055, 0.45, 16, 8, true);
  geo.translate(0, 0.225, 0);
  geo.rotateX(-Math.PI * 0.5);

  const left  = new THREE.Mesh(geo, material);
  const right = new THREE.Mesh(geo, material);

  left.castShadow  = false;  left.receiveShadow  = false;
  right.castShadow = false;  right.receiveShadow = false;

  return { left, right };
}

/**
 * Pre-defined exhaust pipe offsets relative to the vehicle models.
 */
export const EXHAUST_OFFSETS = {
  'mercedes_amg_gt4.glb': {
    left:  new THREE.Vector3(-0.38, 0.22, -2.25),
    right: new THREE.Vector3( 0.38, 0.22, -2.25)
  },
  'amg_evo_3.glb': {
    left:  new THREE.Vector3(-0.42, 0.24, -2.15),
    right: new THREE.Vector3( 0.42, 0.24, -2.15)
  }
};
