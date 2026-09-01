# ⚛️ AtomSynthesizer — 3D Molecular CAD & Quantum Chemistry Workbench

**AtomSynthesizer** is a high-performance, web-based 3D Molecular CAD suite and Quantum Chemistry simulation workbench built with **Next.js 16**, **React Three Fiber (Three.js)**, **TypeScript**, and **Zustand**.

---

## 🌟 Key Features & Chemistry Engines

### 1. ⚛️ Hückel Molecular Orbital (HMO) Quantum Engine
- **Jacobi Eigenvalue Solver**: Solves symmetric Hückel matrix Hamiltonians ($H_{ij}$) to compute $\pi$-molecular orbital energy levels in electron-volts ($\text{eV}$).
- **HOMO & LUMO Analysis**: Computes Highest Occupied Molecular Orbital (HOMO), Lowest Unoccupied Molecular Orbital (LUMO), and the **HOMO-LUMO Energy Gap** ($\Delta E_{\text{HOMO-LUMO}}$).
- **Electric Dipole Moment Vector**: Calculates Gasteiger-Marsili electronegativity equalization partial atomic charges and derives 3D electric dipole vector $\vec{\mu}$ and net magnitude $|\vec{\mu}|$ in Debye ($\text{D}$).

### 2. 🏷️ IUPAC Systematic Nomenclature Engine
- **Canonical Systematic Naming**: Automatically analyzes generated 3D molecular structures and derives IUPAC systematic names.
- Identifies parent carbon chains (`meth-`, `eth-`, `prop-`, `but-`, `pent-`, etc.), unsaturation (`-ane`, `-ene`, `-yne`), ring cyclization (`cyclo-`), functional group suffixes (`-ol`, `-oic acid`), and halogen prefixes (`fluoro-`, `chloro-`, `bromo-`, `iodo-`).
- Handles inorganic species (`Water (Oxidane)`, `Ammonia (Azane)`, diatomic elements).

### 3. 📐 VSEPR 3D Geometry Alignment & Energy Minimization
- **Molecular Mechanics (MM) Potential Energy**: Calculates total potential energy $E_{\text{potential}} = E_{\text{bond}} + E_{\text{angle}} + E_{\text{repulsion}} + E_{\text{instability}}$ in $\text{kJ/mol}$.
- **VSEPR 3D Bond Angle Targets**:
  - **$AX_4$ (Tetrahedral)**: $109.47^\circ$ (e.g., $CH_4$ Methane).
  - **$AX_3$ (Trigonal Planar / Pyramidal)**: $120.0^\circ$ planar or $107.0^\circ$ ($NH_3$).
  - **$AX_2$ (Bent / Linear)**: $104.5^\circ$ ($H_2O$) or $180.0^\circ$ ($CO_2$).
- **Automatic 3D Tetrahedral Pop-Out**: Automatically breaks 2D coplanar symmetry for 4-coordinate $sp^3$ molecules placed on a flat plane, popping them into their true $109.5^\circ$ 3D tetrahedral ground state!

### 4. 💥 Chemical Explosion & Dissociation Physics Engine
- **Instability Detection**: Automatically detects hyper-energetic / over-bonded unstable states (such as over-bonded $H_4$ rings).
- **Dissociation Shockwaves**: Breaks unstable bonds and calculates radial blast impulses $\vec{v}_{\text{blast}}$, converting hyper-energetic species into ground-state products ($H_4 \rightarrow 2 H_2$).
- **3D Particle Explosion Shockwave**: Renders 3D expanding energy blast rings and shockwave particles in the WebGL viewport.

### 5. 🌡️ Chemical Thermodynamics & Arrhenius Reaction Kinetics
- **Standard Enthalpy ($\Delta H_f^\circ$ in $\text{kJ/mol}$)**: Calculated from bond dissociation energies. Identifies Exothermic ($\Delta H^\circ < 0$) vs Endothermic ($\Delta H^\circ > 0$) states.
- **Standard Molar Entropy ($S^\circ$ in $\text{J/mol}\cdot\text{K}$)**: Evaluates translational, rotational, and vibrational entropy using statistical mechanics.
- **Gibbs Free Energy ($\Delta G^\circ = \Delta H^\circ - T \Delta S^\circ$)**: Determines process spontaneity ($\Delta G^\circ < 0$ exergonic).
- **Equilibrium Constant ($K_{eq}$)**: Calculates $K_{eq} = \exp\left(-\frac{\Delta G^\circ}{R T}\right)$.
- **Arrhenius Rate Constant ($k$)**: Computes $k = A \exp\left(-\frac{E_a}{R T}\right)$ with activation energy $E_a$ evaluation.

### 6. 🟢 3D Atomic Quantum Nucleus & $s, p, d, f$ Orbit Shell Visualizer
- **Aufbau Subshell Parsing**: Parses $1s^2 2s^2 2p^6 3s^2 3p^6 4s^2 3d^{10} \dots$ electron configurations across **$K, L, M, N, O, P, Q$** shells for all 118 periodic table elements ($Z = 1 \dots 118$).
- **3D Nucleus & Electron Orbits**: Renders a dense 3D cluster of red Protons and blue Neutrons surrounded by 3D silver orbit rings with orbiting green electron spheres.

### 7. 🔗 Intelligent Proximity Auto-Bonding Engine
- **Valence-Driven Bond Orders**: Automatically assigns Single ($1$), Double ($2$), or Triple ($3$) bonds based on proximity and required valence capacity.
- **Hydrogen Constraint**: Strictly enforces maximum valence capacity of $1$ for Hydrogen ($H$) and monovalent Halogens ($F, Cl, Br, I$).

---

## ⚡ Live Real-Time 60 FPS Physics Simulation

When **Live Physics** is enabled, the WebGL frame loop continuously:
1. Relaxes bond lengths and VSEPR angles towards equilibrium targets.
2. Applies realistic thermal harmonic vibrations (strained bonds vibrate with higher amplitude).
3. Automatically auto-bonds nearby atoms and relaxes them live in 3D space.

---

## 🚀 Setup & Getting Started

### Prerequisites
- **Node.js**: v18.0+ or v20.0+
- **pnpm**: v11.0+

### Installation & Run

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run Production Build**:
   ```bash
   pnpm build
   ```

---

## 🧪 Testing Suite

AtomSynthesizer includes modular unit test suites:

- **Extended Domain & Serialization Tests**:
  ```bash
  npx tsx tests/unit.test.ts
  ```
- **Physics, VSEPR & 3D Pop-Out Tests**:
  ```bash
  npx tsx tests/physics.test.ts
  ```
- **Quantum Mechanics & Nomenclature Tests**:
  ```bash
  npx tsx tests/quantum.test.ts
  ```
- **Thermodynamics & Reaction Kinetics Tests**:
  ```bash
  npx tsx tests/thermo.test.ts
  ```
- **Quantum Shell & spdf Configuration Tests**:
  ```bash
  npx tsx tests/quantum_shell.test.ts
  ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `V` | **Select Tool** | Select and inspect atoms/bonds |
| `M` | **Move Tool** | Drag atoms in 3D space |
| `R` | **Rotate Tool** | Orbit/rotate molecular graph |
| `A` | **Add Atom Tool** | Place active element on canvas |
| `B` | **Create Bond Tool** | Connect bonds between atoms |
| `D` / `Delete` | **Delete** | Remove selected atoms/bonds |
| `Ctrl + Z` | **Undo** | Revert last action |
| `Ctrl + Shift + Z` | **Redo** | Reapply undone action |

---

## 🏗️ Architecture & Project Structure

```
AtomSynthesizer/
├── application/         # Commands, History & Persistence Services
├── chemistry/
│   ├── core/            # Core Quantum, VSEPR, Thermo & Physics Engines
│   │   ├── QuantumEngine.ts            # HMO & Dipole Moment Solver
│   │   ├── NomenclatureEngine.ts       # Systematic IUPAC Naming Engine
│   │   ├── GeometryOptimizationEngine.ts # MM Force Field & VSEPR Alignment
│   │   ├── ExplosionPhysicsEngine.ts   # Chemical Dissociation & Blast Physics
│   │   ├── ThermodynamicsEngine.ts     # Enthalpy, Entropy, Gibbs & Keq
│   │   ├── ReactionLogicEngine.ts      # Arrhenius Kinetics & Reaction Pathways
│   │   ├── QuantumShellEngine.ts       # spdf Subshell & K,L,M,N,O,P,Q Shells
│   │   └── AutoBondEngine.ts           # Valence-driven Proximity Auto-Bonding
│   ├── exporters/       # JSON Export Services
│   └── parsers/         # JSON Parsing Services
├── components/
│   ├── inspector/       # Scientific Property Inspector Panels
│   ├── molecular/       # React Three Fiber 3D Canvas & Quantum Renderers
│   ├── periodic-table/  # Interactive 118-Element Periodic Table
│   └── workspace/       # Workstation Layout, Header Toolbar & Status Bar
├── data/
│   └── elements.json    # Complete 118-Element Periodic Table Dataset
├── domain/              # Clean Domain Entities (Molecule, Atom, Bond)
├── stores/              # Zustand Workspace & Molecule State Management
└── tests/               # TypeScript Test Suites
```
