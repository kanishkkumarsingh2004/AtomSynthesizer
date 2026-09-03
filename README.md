# ⚛️ AtomSynthesizer — 3D Molecular CAD, Sub-Atomic Physics & Quantum Chemistry Workbench

**AtomSynthesizer** is a high-performance, web-based 3D Molecular CAD suite, Sub-Atomic Physics visualizer, and Quantum Chemistry simulation workbench built with **Next.js 16**, **React Three Fiber (Three.js)**, **TypeScript**, and **Zustand**.

📖 **[Read Full Quantum Mathematics & Thermodynamics Guide](docs/quantum_maths.md)**

---

## 🌟 Key Features & Scientific Engines

### 1. ⚛️ Extended Hückel & Hückel MO Quantum Mechanics Engine
- **Valence Shell Matrix Hamiltonian Solver**: Diagonalizes valence orbital Hamiltonians ($H_{ii} = -\text{VOIP}_i + 1.2 q_i$ and $H_{ij} = 1.75 S_{ij} \frac{H_{ii} + H_{jj}}{2}$) to compute molecular orbital energy levels for both $\sigma$-bonded and $\pi$-conjugated species.
- **HOMO & LUMO Analysis**: Calculates **HOMO Energy ($E_{\text{HOMO}}$)**, **LUMO Energy ($E_{\text{LUMO}}$)**, and the **HOMO-LUMO Energy Gap ($\Delta E_{\text{gap}}$)** in electron-volts ($\text{eV}$).
- **Electric Dipole Moment Vector**: Calculates Gasteiger-Marsili electronegativity equalization partial charges $q_i$ and derives the 3D electric dipole vector $\vec{\mu} = (p_x, p_y, p_z)^T$ and net magnitude $|\vec{\mu}|$ in Debye ($\text{D}$).
- **First-Principles Electric Dipole Polarizability ($\alpha_{\text{total}}$)**: Computes dipole polarizability with diffuse basis set ($f_{\text{diffuse}} = 1.10$) and zero-point vibrational ($f_{\text{vib\_zp}} = 1.04$) corrections:
  $$\alpha_{\text{total}} = (1.10 \times 1.04) \cdot \frac{1}{3} \text{Tr}(\mathbf{\alpha}_{\text{elec}}) + \frac{\mu^2}{3 k_B T} \text{ (\AA}^3\text{)}$$

### 2. 🔬 Sub-Atomic Nucleus & Real-Time Electron Orbital Visualizer (`Atomic Nucleus & Electrons`)
- **Proton ($p^+$) & Neutron ($n^0$) Packed Nuclear Clusters**: Replaces generic CPK spheres with packed nuclear clusters of individual **Protons ($p^+$ in crimson red `#EF4444`)** and **Neutrons ($n^0$ in cyan `#0EA5E9`)** with exact nucleon counts ($Z$ protons and $A-Z$ neutrons).
- **Point-Particle Orbiting Electrons ($e^-$)**: Replaces static bond cylinders with **glowing electric yellow point-particle Electrons ($e^-$)** executing real-time 3D orbital trajectories between adjacent nuclei along $\sigma$ and $\pi$ bond orbitals ($2 e^-$ per single bond, $4 e^-$ per double bond, $6 e^-$ per triple bond).

### 3. 🛍️ Preset Molecule Marketplace & 3D Library
- **Pre-built 3D Structures**: Instant 1-click loading of benchmark molecules into the 3D workstation:
  - **Neopentane ($\text{C}_5\text{H}_{12}$ / 2,2-Dimethylpropane)**: Quaternary tetrahedral alkane ($T_d$ symmetry).
  - **Isobutane ($\text{C}_4\text{H}_{10}$ / 2-Methylpropane)**: Branched alkane ($C_{3v}$ symmetry).
  - **Methane ($\text{CH}_4$)**, **Propane ($\text{C}_3\text{H}_8$)**, **Water ($\text{H}_2\text{O}$)**, **Carbon Dioxide ($\text{CO}_2$)**, **Benzene ($\text{C}_6\text{H}_6$)**, **Ethanol ($\text{C}_2\text{H}_5\text{OH}$)**, **Acetone ($\text{C}_3\text{H}_6\text{O}$)**.

### 4. 🔗 Octet Rule & Electronegativity Auto-Bonding Engine
- **Physical Covalent Distance Cutoff ($1.25 \times r_{\text{single}}$)**: Max bond distance threshold set to $1.25 \times (r_A + r_B)$, preventing spurious cross-bonds between separated 1,3-atoms.
- **Pauling Electronegativity Difference ($\Delta\chi > 1.7$)**: Distinguishes ionic interactions ($\text{Na}^+, \text{Cl}^-$) from covalent electron sharing.
- **Strict Octet & Duet Hard Caps**: Strictly enforces maximum valence capacity (Hydrogen max 1, Carbon max 4, Halogens max 1, Oxygen max 2-3, Nitrogen max 3-4).

### 5. 🏷️ IUPAC Systematic Nomenclature Engine
- **Canonical Systematic Naming**: Automatically analyzes generated 3D molecular structures and derives IUPAC systematic names.
- Identifies parent carbon chains (`meth-`, `eth-`, `prop-`, `but-`, `pent-`, etc.), unsaturation (`-ane`, `-ene`, `-yne`), ring cyclization (`cyclo-`), functional group suffixes (`-ol`, `-oic acid`), and halogen prefixes (`fluoro-`, `chloro-`, `bromo-`, `iodo-`).

### 6. 📐 VSEPR 3D Geometry Alignment & Energy Minimization
- **Molecular Mechanics (MM) Potential Energy**: Calculates total potential energy $E_{\text{potential}} = E_{\text{bond}} + E_{\text{angle}} + E_{\text{repulsion}} + E_{\text{instability}}$ in $\text{kJ/mol}$.
- **Automatic 3D Tetrahedral Pop-Out**: Automatically breaks 2D coplanar symmetry for 4-coordinate $sp^3$ molecules, popping them into their true $109.5^\circ$ 3D tetrahedral ground state!

### 7. 🌡️ Quantum Statistical Thermodynamics & Partition Functions
- **Canonical Partition Function ($Q_{\text{total}} = q_{\text{trans}} \times q_{\text{rot}} \times q_{\text{vib}} \times q_{\text{elec}}$)**:
  - **Translational**: $q_{\text{trans}} = \left( \frac{2\pi m k_B T}{h^2} \right)^{3/2} \frac{R T}{P}$
  - **Rotational**: $q_{\text{rot}} = \frac{\sqrt{\pi}}{\sigma} \left( \frac{k_B T}{h c \tilde{A}} \frac{k_B T}{h c \tilde{B}} \frac{k_B T}{h c \tilde{C}} \right)^{1/2}$
  - **Vibrational**: $q_{\text{vib}} = \prod_{i=1}^{3N-6} \frac{e^{-\hbar\omega_i / 2 k_B T}}{1 - e^{-\hbar\omega_i / k_B T}}$
- **Internal Thermal Energy ($U$)**: $U = U_{\text{trans}} + U_{\text{rot}} + U_{\text{vib}} = k_B T^2 \left(\frac{\partial \ln Q}{\partial T}\right)_V$ (in $\text{kJ/mol}$).
- **Molar Heat Capacity ($C_p$)**: $C_p = C_v + R = \left(\frac{\partial U}{\partial T}\right)_V + R$ (in $\text{J/mol}\cdot\text{K}$).
- **Rotational Constant ($\tilde{B}$)**: Derived from the Moments of Inertia tensor $\mathbf{I} = \text{diag}(I_{xx}, I_{yy}, I_{zz})$: $\tilde{B} = \frac{h}{8 \pi^2 I c}$ (in $\text{cm}^{-1}$).
- **Standard Enthalpy ($\Delta H_f^\circ$) & Gibbs Free Energy ($\Delta G_f^\circ$)**: $\Delta G^\circ = \Delta H^\circ - T \Delta S^\circ$, $K_{\text{eq}} = \exp\left(-\frac{\Delta G^\circ}{R T}\right)$.

---

## ⚡ Live Real-Time 60 FPS Physics & 3D Thermal Motion

When **Live Physics** or thermal simulation is active:
1. Relaxes bond lengths and VSEPR angles towards equilibrium ground state.
2. Performs 3D harmonic bond stretching and angle bending oscillations with amplitude scaling with temperature ($A_{\text{vib}} \propto T^{0.75}$).
3. **Spacebar Shortcut**: Pressing `Spacebar` cleanly pauses and resumes all 3D thermal motion and physics in real time.

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

AtomSynthesizer includes modular TypeScript unit test suites:

- **Thermodynamics & Reaction Kinetics Tests**:
  ```bash
  npx tsx tests/thermo.test.ts
  ```
- **Physics, VSEPR & 3D Pop-Out Tests**:
  ```bash
  npx tsx tests/physics.test.ts
  ```
- **Quantum Mechanics & Nomenclature Tests**:
  ```bash
  npx tsx tests/quantum.test.ts
  ```
- **Domain & Serialization Tests**:
  ```bash
  npx tsx tests/unit.test.ts
  ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Space` | **Pause / Resume** | Toggle 3D thermal motion & physics animation |
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
│   ├── core/            # Quantum, VSEPR, Thermo & Physics Engines
│   │   ├── QuantumEngine.ts            # Extended Hückel & HMO Quantum Solver
│   │   ├── NomenclatureEngine.ts       # Systematic IUPAC Naming Engine
│   │   ├── GeometryOptimizationEngine.ts # MM Force Field & VSEPR Alignment
│   │   ├── ExplosionPhysicsEngine.ts   # Chemical Dissociation & Blast Physics
│   │   ├── ThermodynamicsEngine.ts     # Enthalpy, Entropy, Gibbs & Keq
│   │   ├── ReactionLogicEngine.ts      # Arrhenius Kinetics & Reaction Pathways
│   │   ├── ReactionSimulationEngine.ts # 3D Thermal Vibrations & Brownian Motion
│   │   └── AutoBondEngine.ts           # Octet & Electronegativity Auto-Bonding
│   ├── library/
│   │   └── MoleculePresets.ts          # Preset Marketplace Molecule Library
│   ├── exporters/       # JSON Export Services
│   └── parsers/         # JSON Parsing Services
├── components/
│   ├── inspector/       # Scientific Property Inspector Panels
│   ├── marketplace/     # Molecule Preset Marketplace Modal
│   ├── molecular/       # React Three Fiber 3D Canvas & Sub-Atomic Renderers
│   │   ├── AtomicNucleusRenderer.tsx   # Sub-Atomic Protons/Neutrons & Orbiting e-
│   │   └── MoleculeRenderer.tsx        # 3D Ball & Stick, Space Filling, Nucleus
│   ├── periodic-table/  # Interactive 118-Element Periodic Table
│   └── workspace/       # Workstation Layout, Header Toolbar & Status Bar
├── domain/              # Clean Domain Entities (Molecule, Atom, Bond)
├── stores/              # Zustand Workspace & Molecule State Management
└── tests/               # TypeScript Test Suites
```
