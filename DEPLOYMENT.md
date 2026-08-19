# Deployment Guide — Apex Motors Interactive 3D Exhibit

This document outlines the step-by-step procedure for deploying the **Apex Motors Interactive 3D Exhibit** to **GitHub Pages**, configuring automated workflows, and troubleshooting static asset delivery.

---

## 🎯 Target Deployment Architecture

- **Hosting Platform**: GitHub Pages
- **Repository**: `https://github.com/Kaustobh/Apex-Motors`
- **Live URL**: `https://kaustobh.github.io/Apex-Motors/`
- **Deployment Strategy**: Automated GitHub Actions Workflow (`deploy.yml`) / Direct Branch Deploy

---

## 🛠️ Step-by-Step GitHub Pages Setup

### Option 1: Automated Deployment via GitHub Actions (Recommended)

The repository includes a pre-configured GitHub Actions workflow located at `.github/workflows/deploy.yml`.

1. Push your code to the `main` branch of `https://github.com/Kaustobh/Apex-Motors.git`:
   ```bash
   git add .
   git commit -m "feat: complete project initialization, documentation, and GitHub Pages setup"
   git branch -M main
   git remote add origin https://github.com/Kaustobh/Apex-Motors.git
   git push -u origin main
   ```
2. Navigate to your repository on GitHub: **`https://github.com/Kaustobh/Apex-Motors`**.
3. Go to **Settings > Pages** (under Code and automation).
4. Under **Build and deployment > Source**, select **GitHub Actions**.
5. The deployment workflow will automatically trigger on every push to `main` and deploy the exhibit to `https://kaustobh.github.io/Apex-Motors/`.

---

### Option 2: Deploying from Branch (`main` / `gh-pages`)

If you prefer deploying directly from the `main` branch:

1. Push all files to the `main` branch.
2. In GitHub, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Select `main` branch and `/ (root)` directory, then click **Save**.
5. GitHub Pages will build and publish your site within 1-2 minutes.

---

## ⚙️ Critical Static Asset Configurations

### 1. `.nojekyll` File
GitHub Pages uses Jekyll by default, which ignores files starting with underscores (`_`) or certain extensions. To prevent build failures or missing asset issues:
- An empty `.nojekyll` file is included in the root directory.

### 2. Portable Relative Paths
All paths in `index.html`, `css/main.css`, and `js/scene.js` are written using relative notation (`./` or relative filenames):
- Stylesheet: `css/main.css`
- App Module: `js/app.js`
- 3D GLB Models: `'mercedes_amg_gt4.glb'`, `'amg_evo_3.glb'`
- Backgrounds: `'bg_gold.jpg'`, `'bg_red.jpg'`

This guarantees that assets load properly regardless of whether the site is hosted on a user subdomain (`https://kaustobh.github.io/Apex-Motors/`) or a custom domain.

---

## 🔍 Troubleshooting & Common Issues

### Issue 1: Page returns a 404 or blank screen after deployment
- **Cause**: GitHub Pages build takes 1–3 minutes to complete after pushing code.
- **Fix**: Check the **Actions** tab on your GitHub repository to verify the status of the `Deploy to GitHub Pages` workflow.

### Issue 2: 3D Models (`.glb`) fail to load locally
- **Cause**: Browser CORS security policy blocks `fetch()` requests when opening `index.html` via `file://`.
- **Fix**: Always run a local web server (e.g. `python -m http.server 3000` or `npx serve`) during local testing.

### Issue 3: Content Security Policy or CDN issues with ESM Shims
- **Cause**: Browser unable to resolve `importmap` specifiers.
- **Fix**: `index.html` includes `es-module-shims.js` and explicit jsDelivr CDN URLs for Three.js (`v0.165.0`).

---

## 👤 Maintainer
**Kaustobh Bhattacharya**  
Copyright © 2026 Kaustobh Bhattacharya. All rights reserved.
