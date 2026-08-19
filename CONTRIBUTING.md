# Contributing to Apex Motors Interactive 3D Exhibit

Thank you for your interest in contributing to the **Apex Motors Interactive 3D Exhibit**! We welcome contributions, bug fixes, feature enhancements, and documentation improvements.

---

## 📜 Code of Conduct

Please treat all maintainers and contributors with respect, professionalism, and courtesy.

---

## 🚀 How to Contribute

### 1. Reporting Issues & Bugs
Before creating a new issue, please search existing issues to see if it has already been reported. When filing an issue:
- Use a clear and descriptive title.
- Provide step-by-step instructions to reproduce the bug.
- Include browser type, operating system, and console error logs if applicable.

### 2. Submitting Pull Requests (PRs)
1. Fork the repository `https://github.com/Kaustobh/Apex-Motors`.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes and test locally using a HTTP server (`python -m http.server 3000`).
4. Ensure all module syntax and DOM layout validations pass.
5. Commit your changes using Conventional Commit messages.
6. Push to your fork and open a Pull Request against the `main` branch.

---

## 📌 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or capability.
- `fix:` A bug fix or patch.
- `docs:` Documentation changes only.
- `style:` Code style/formatting changes (no production code logic change).
- `refactor:` Code changes that neither fix a bug nor add a feature.
- `perf:` Performance optimizations (e.g. 3D asset memory management).
- `test:` Adding or updating diagnostic tests.

**Example Commit Message**:
```text
feat(audio): add low-pass filter transition for cockpit cocoon mode
```

---

## 🎨 Coding Standards & Guidelines

- **Vanilla Modern Standards**: Do not introduce heavy build tools or bundlers unless requested. Keep files as native ES Modules.
- **Three.js Asset Safety**: Always dispose of geometries, materials, and textures when swapping or unloading 3D models to avoid WebGL memory leaks.
- **Relative Path Integrity**: Ensure all asset paths remain relative (`./` or filename) to preserve GitHub Pages compatibility.
- **Documentation Maintenance**: Update `README.md` or `project_report.txt` if introducing architectural changes.

---

## 👤 Maintainer

**Kaustobh Bhattacharya**  
Copyright © 2026 Kaustobh Bhattacharya. All rights reserved.
