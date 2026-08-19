# APEX MOTORS — Mercedes-AMG Interactive 3D Exhibit

[![GitHub Pages Deployment](https://img.shields.io/github/deployments/Kaustobh/Apex-Motors/github-pages?label=GitHub%20Pages&logo=github&style=flat-square)](https://kaustobh.github.io/Apex-Motors/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![WebGL 2.0](https://img.shields.io/badge/WebGL-2.0-orange?style=flat-square&logo=webgl)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
[![Three.js](https://img.shields.io/badge/Three.js-v0.165.0-black?style=flat-square&logo=three.js)](https://threejs.org/)

An interactive, museum-grade 3D digital exhibit showcasing two legendary race cars: the **Mercedes-AMG GT4** and the **Mercedes-AMG GT3 EVO**. Built on modern vanilla ES Modules, Three.js, custom GLSL shaders, and the native Web Audio API.

---

## 🌟 Live Demo

Experience the live interactive exhibit directly on GitHub Pages:
👉 **[https://kaustobh.github.io/Apex-Motors/](https://kaustobh.github.io/Apex-Motors/)**

---

## 🏎️ Vehicle Specifications

| Vehicle | Engine | Power | Torque | Top Speed | Aerodynamics & Highlights |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mercedes-AMG GT4** | AMG M178 4.0L V8 Biturbo | 510 hp | 630 Nm | 155+ mph | Autoclave carbon splitter (120 kg downforce), 11-stage ABS |
| **Mercedes-AMG GT3 EVO** | AMG M159 6.3L NA V8 | 550 hp | 650 Nm | 177+ mph | Swan-neck wing (420 kg downforce), Magnesium center-lock hubs |

---

## ✨ Key Features

- **Kinematic 3D Scroll Journey**: Damped virtual scroll mapping 5 narrative phases to camera positions, lighting intensity, and soundscapes.
- **Holographic Model Crossfade**: Seamless model hot-swapping with de-materialization scaling and horizontal laser scanner ring sweeps.
- **Synthesized V8 Audio Engine**: Native Web Audio API DSP synthesis modeling M178 Biturbo and high-revving 9,000 RPM M159 acoustics, gearbox shifts, and exhaust backfire pops.
- **Procedural GLSL Shaders**: Custom volumetric combustion flame shaders animated with Simplex 3D noise and throttle uniforms.
- **Interactive Hotspot Matrix**: 5 spatial 3D coordinate hotspots per vehicle with camera fly-to perspective tweens and component telemetry.
- **Fixed Silk Backdrops**: Dynamic theme switching between Golden (`bg_gold.jpg`) and Racing Red (`bg_red.jpg`) silk textures with transparent WebGL canvas integration.
- **Reorganized Dual-Sidebar HUD**: Themed monospace telemetry, design ethos cards, track dynamics profile, ignition buttons, and throttle capacitance lever.

---

## 🛠️ Tech Stack & Dependencies

- **HTML5 & CSS3 Design System**: CSS variables, glassmorphism, responsive sidebar layout.
- **JavaScript (ES6+ ESM)**: Zero external build tools; native browser ES Module imports.
- **Three.js (v0.165.0)**: WebGL 3D renderer, shadow maps, camera matrices, GLTF loader.
- **GSAP (v3.12.5)**: Camera timeline orchestration, smooth easing, and interactive flight tweens.
- **Web Audio API**: Real-time sound synthesis (oscillators, waveshapers, biquad filters, gain nodes).

---

## 🚀 Local Setup & Development

Because the project utilizes native ES Modules and loads static `.glb` assets, opening `index.html` directly via `file://` will be blocked by browser CORS security policies. Use a local HTTP web server to run it locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+) **OR** [Python 3](https://www.python.org/)

### Quick Start Commands

#### Option A: Using Python (Built-in)
```bash
# Clone the repository
git clone https://github.com/Kaustobh/Apex-Motors.git
cd Apex-Motors

# Start local server on port 3000
python -m http.server 3000
```
Open your browser at `http://localhost:3000`

#### Option B: Using Node.js `npx serve`
```bash
# Run using npx serve
npx serve .
```

---

## 📂 Project Structure

```
Apex-Motors/
├── index.html                  # Main application HTML entry point
├── bg_gold.jpg                 # Fixed background texture (AMG GT4)
├── bg_red.jpg                  # Fixed background texture (AMG GT3 EVO)
├── mercedes_amg_gt4.glb        # 3D Model Asset (Mercedes-AMG GT4)
├── amg_evo_3.glb               # 3D Model Asset (Mercedes-AMG GT3 EVO)
├── project_report.txt          # Technical report & system architecture
├── .nojekyll                   # Disables Jekyll processing on GitHub Pages
├── .gitignore                  # Git exclusion rules
├── README.md                   # Project documentation & overview
├── DEPLOYMENT.md               # GitHub Pages deployment & troubleshooting guide
├── CONTRIBUTING.md             # Guidelines for contributors
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── css/
│   └── main.css                # Design tokens, glassmorphism, HUD layout styling
└── js/
    ├── app.js                  # Main entry point and initialization loop
    ├── scene.js                # Three.js pipeline, lighting, camera keyframes
    ├── audioEngine.js           # Web Audio API V8 sound synthesizer
    ├── uiController.js         # Damped virtual scroll & HUD interaction logic
    └── shaders.js              # Volumetric exhaust flame GLSL shader code
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to explore, customize, and build upon it.

---

## 👤 Author & Copyright

**Kaustobh Bhattacharya**  
Copyright © 2026 Kaustobh Bhattacharya. All rights reserved.
