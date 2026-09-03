# ⚛️ Quantum Mechanics & Statistical Thermodynamics Mathematics Guide

This document presents the complete mathematical, quantum mechanical, and statistical thermodynamic framework implemented in **AtomSynthesizer**.

---

## 📑 Table of Contents
1. [The Total Molecular Hamiltonian & Born-Oppenheimer Approximation](#1-the-total-molecular-hamiltonian--born-oppenheimer-approximation)
2. [Extended Hückel Theory (EHT) & Molecular Orbital Engine](#2-extended-hückel-theory-eht--molecular-orbital-engine)
3. [Gasteiger Electronegativity Equalization & Electric Dipole Vector](#3-gasteiger-electronegativity-equalization--electric-dipole-vector)
4. [First-Principles Electric Dipole Polarizability](#4-first-principles-electric-dipole-polarizability)
5. [Morse Potential & Anharmonic Vibrational States](#5-morse-potential--anharmonic-vibrational-states)
6. [Hooke's Law Vibrational Frequencies & Zero-Point Quantum Energy](#6-hookes-law-vibrational-frequencies--zero-point-quantum-energy)
7. [Moments of Inertia Tensor & Rigid Rotor Rotational Constants](#7-moments-of-inertia-tensor--rigid-rotor-rotational-constants)
8. [Canonical Partition Functions ($Q_{\text{total}}$)](#8-canonical-partition-functions-q_texttotal)
9. [Macroscopic Statistical Thermodynamic Derivatives ($U, C_p, S^\circ, \Delta G^\circ, K_{\text{eq}}$)](#9-macroscopic-statistical-thermodynamic-derivatives-u-c_p-s^\circ-\delta-g^\circ-k_texteq)
10. [Arrhenius Reaction Kinetics & Chemical Dissociation](#10-arrhenius-reaction-kinetics--chemical-dissociation)
11. [Sub-Atomic Nuclear Physics & Electron Trajectories](#11-sub-atomic-nuclear-physics--electron-trajectories)

---

## 1. The Total Molecular Hamiltonian & Born-Oppenheimer Approximation

For a molecular system containing $N$ electrons and $M$ nuclei, the time-independent Schrödinger equation is:

$$\hat{H} \Psi = E \Psi$$

The total molecular Hamiltonian operator $\hat{H}$ accounts for all kinetic and potential energies:

$$\hat{H} = -\sum_{i=1}^{N} \frac{\hbar^2}{2m_e} \nabla_i^2 - \sum_{A=1}^{M} \frac{\hbar^2}{2M_A} \nabla_A^2 - \sum_{i=1}^{N}\sum_{A=1}^{M} \frac{Z_A e^2}{4\pi\epsilon_0 r_{iA}} + \sum_{i<j}^{N} \frac{e^2}{4\pi\epsilon_0 r_{ij}} + \sum_{A<B}^{M} \frac{Z_A Z_B e^2}{4\pi\epsilon_0 R_{AB}}$$

### Terms Breakdown:
1. **Term 1**: Kinetic energy operator of $N$ electrons ($m_e = 9.109 \times 10^{-31}\text{ kg}$).
2. **Term 2**: Kinetic energy operator of $M$ nuclei ($M_A \gg m_e$).
3. **Term 3**: Attractive Coulomb potential between electrons and nuclei at distance $r_{iA}$.
4. **Term 4**: Repulsive Coulomb potential between pairs of electrons at distance $r_{ij}$.
5. **Term 5**: Repulsive Coulomb potential between pairs of nuclei at distance $R_{AB}$.

### Born-Oppenheimer Separation:
Because nuclear mass is thousands of times larger than electron mass ($M_A / m_e \approx 1836 \dots 300,000$), nuclear velocity is negligible relative to electronic motion. Freezing nuclear coordinates simplifies the total wavefunction:

$$\Psi_{\text{total}}(\mathbf{r}, \mathbf{R}) = \Psi_{\text{electronic}}(\mathbf{r}; \mathbf{R}) \times \Psi_{\text{nuclear}}(\mathbf{R})$$

Evaluating $E_{\text{electronic}}(\mathbf{R})$ across varied nuclear positions maps out the **Potential Energy Surface (PES)** $V(\mathbf{R})$.

---

## 2. Extended Hückel Theory (EHT) & Molecular Orbital Engine

AtomSynthesizer constructs the valence shell Hamiltonian matrix $\mathbf{H}$ using **Extended Hückel Theory (EHT)** across valence atomic orbitals ($1s$ for $\text{H}$, $2s, 2p$ for $\text{C}, \text{N}, \text{O}$, etc.).

### A. Diagonal Elements ($H_{ii}$) — Valence Orbital Ionization Potentials (VOIP):
Diagonal matrix elements represent the effective energy of an electron in atomic orbital $i$, adjusted for atomic partial charge $q_i$:

$$H_{ii} = -\text{VOIP}_i + 1.2 \cdot q_i \text{ (eV)}$$

Standard baseline VOIPs:
- $\text{Hydrogen (1s)}$: $\text{VOIP} = 13.60\text{ eV}$
- $\text{Carbon (2p)}$: $\text{VOIP} = 11.26\text{ eV}$
- $\text{Nitrogen (2p)}$: $\text{VOIP} = 14.53\text{ eV}$
- $\text{Oxygen (2p)}$: $\text{VOIP} = 15.85\text{ eV}$

### B. Off-Diagonal Elements ($H_{ij}$) — Wolfsberg-Helmholz Resonance Integrals:
Off-diagonal coupling elements between bonded orbitals $i$ and $j$ separated by interatomic distance $R_{ij}$:

$$H_{ij} = K_{\text{WH}} \cdot S_{ij}(R_{ij}) \cdot \left( \frac{H_{ii} + H_{jj}}{2} \right) \cdot \text{Order}^{0.6}$$

where $K_{\text{WH}} = 1.75$ (Wolfsberg-Helmholz constant) and the valence overlap integral is:

$$S_{ij}(R_{ij}) = \exp\left( -1.15 \frac{R_{ij}}{r_{i,\text{cov}} + r_{j,\text{cov}}} \right)$$

### C. Secular Determinant & Eigenvalues:
Solving the generalized eigenvalue problem:

$$\det(\mathbf{H} - \varepsilon \mathbf{S}) = 0$$

yields $N_{\text{orbital}}$ molecular orbital energy levels $\varepsilon_1 \le \varepsilon_2 \le \dots \le \varepsilon_N$.

Filling valence electrons ($2 e^-$ per orbital) determines:
- **HOMO Energy ($E_{\text{HOMO}}$)**: $\varepsilon_{N_{\text{occ}}}$
- **LUMO Energy ($E_{\text{LUMO}}$)**: $\varepsilon_{N_{\text{occ}} + 1}$
- **HOMO-LUMO Gap ($\Delta E_{\text{gap}}$)**: $\Delta E_{\text{gap}} = |E_{\text{LUMO}} - E_{\text{HOMO}}|$

---

## 3. Gasteiger Electronegativity Equalization & Electric Dipole Vector

Atomic partial charges $q_i$ are computed by iteratively transferring fractional charge based on orbital electronegativity $\chi_i(q) = a + b q + c q^2$:

$$\delta q_{ij} = \frac{\chi_j - \chi_i}{a_i + a_j}$$

### Electric Dipole Vector ($\vec{\mu}$):
The 3D electric dipole vector $\vec{\mu} = (p_x, p_y, p_z)^T$ is evaluated in Debye ($\text{D}$) where $1\text{ e}\cdot\text{\AA} = 4.8032\text{ D}$:

$$p_x = 4.8032 \sum_{i=1}^{M} q_i \cdot x_i, \quad p_y = 4.8032 \sum_{i=1}^{M} q_i \cdot y_i, \quad p_z = 4.8032 \sum_{i=1}^{M} q_i \cdot z_i$$

$$\mu = |\vec{\mu}| = \sqrt{p_x^2 + p_y^2 + p_z^2} \text{ (Debye)}$$

---

## 4. First-Principles Electric Dipole Polarizability

Electric dipole polarizability $\alpha_{\text{total}}$ measures electron cloud distortion under an external electric field $\vec{E}$:

$$\alpha_{\text{total}} = (f_{\text{diffuse}} \times f_{\text{vib\_zp}}) \cdot \alpha_{\text{electronic}} + \alpha_{\text{orientational}} \text{ (\AA}^3\text{)}$$

where:
- $f_{\text{diffuse}} = 1.10$ (corrects for missing diffuse valence orbitals).
- $f_{\text{vib\_zp}} = 1.04$ (corrects for zero-point nuclear expansion).
- Electronic polarizability:
  $$\alpha_{\text{electronic}} = \frac{1}{3} \text{Tr}(\mathbf{\alpha}_{\text{elec}}) = \frac{1}{3} (\alpha_{xx} + \alpha_{yy} + \alpha_{zz})$$
- Debye-Langevin orientational polarizability:
  $$\alpha_{\text{orientational}} = \frac{\mu^2}{3 k_B T} \text{ (\AA}^3\text{)}$$

---

## 5. Morse Potential & Anharmonic Vibrational States

For real chemical bonds, harmonic parabolic potentials fail at high vibrational levels. AtomSynthesizer models bond energy using the **Morse Potential**:

$$V(R) = D_e \left( 1 - e^{-a (R - R_e)} \right)^2$$

where $D_e$ is the well depth (bond dissociation energy) and $a = \sqrt{\frac{k}{2 D_e}}$.

Solving the 1D Schrödinger equation with the Morse potential gives quantized energy levels:

$$E_v = h \nu_e \left( v + \frac{1}{2} \right) - h \nu_e x_e \left( v + \frac{1}{2} \right)^2 \quad (v = 0, 1, 2, \dots)$$

where the anharmonicity constant is:

$$x_e = \frac{h \nu_e}{4 D_e}$$

---

## 6. Hooke's Law Vibrational Frequencies & Zero-Point Quantum Energy

### A. Fundamental Vibration Frequency ($\nu$):
Bond stretching vibrations are calculated using Hooke's Law modified for reduced mass:

$$\mu_{AB} = \frac{m_A \cdot m_B}{m_A + m_B} \text{ (in amu)}$$

$$\nu = \frac{1}{2\pi c} \sqrt{\frac{k}{\mu_{AB} \cdot u}} \text{ (in cm}^{-1}\text{)}$$

where $c = 2.9979 \times 10^{10}\text{ cm/s}$, $u = 1.66054 \times 10^{-27}\text{ kg/amu}$, and force constants are:
- Single Bond: $k \approx 500\text{ N/m}$
- Double Bond: $k \approx 1000\text{ N/m}$
- Triple Bond: $k \approx 1500\text{ N/m}$

### B. Quantum Zero-Point Vibrational Energy ($E_{\text{ZPVE}}$):
At $0\text{ K}$, molecules retain ground-state vibrational energy ($v = 0$):

$$E_{\text{ZPVE}} = \sum_{i=1}^{3N-6} \frac{1}{2} h \nu_i = 0.00598 \sum_{i=1}^{3N-6} \nu_i \text{ (in kJ/mol)}$$

---

## 7. Moments of Inertia Tensor & Rigid Rotor Rotational Constants

Center of mass:

$$\vec{r}_{\text{cm}} = \frac{\sum_{i=1}^{M} m_i \vec{r}_i}{\sum_{i=1}^{M} m_i}$$

Shifted coordinates $\vec{r}'_i = \vec{r}_i - \vec{r}_{\text{cm}}$. The $3 \times 3$ Moment of Inertia tensor is:

$$\mathbf{I} = \begin{pmatrix} \sum m_i (y_i'^2 + z_i'^2) & -\sum m_i x_i' y_i' & -\sum m_i x_i' z_i' \\ -\sum m_i x_i' y_i' & \sum m_i (x_i'^2 + z_i'^2) & -\sum m_i y_i' z_i' \\ -\sum m_i x_i' z_i' & -\sum m_i y_i' z_i' & \sum m_i (x_i'^2 + y_i'^2) \end{pmatrix}$$

Diagonalizing $\mathbf{I}$ gives principal moments $I_A \le I_B \le I_C$. Rotational constants in $\text{cm}^{-1}$:

$$\tilde{A} = \frac{h}{8\pi^2 I_A c}, \quad \tilde{B} = \frac{h}{8\pi^2 I_B c}, \quad \tilde{C} = \frac{h}{8\pi^2 I_C c}$$

Rotational energy levels:

$$E_J = \tilde{B} J (J + 1) \quad (J = 0, 1, 2, \dots)$$

---

## 8. Canonical Partition Functions ($Q_{\text{total}}$)

In Quantum Statistical Mechanics, the canonical partition function $Q$ connects microscale quantum states to macroscale thermal properties:

$$Q_{\text{total}} = q_{\text{trans}} \times q_{\text{rot}} \times q_{\text{vib}} \times q_{\text{elec}}$$

### Components:
1. **Translational**:
   $$q_{\text{trans}} = \left( \frac{2\pi m k_B T}{h^2} \right)^{3/2} \frac{k_B T}{P}$$
2. **Rotational**:
   - Linear: $q_{\text{rot}} = \frac{k_B T}{\sigma h c \tilde{B}}$
   - Non-linear (Asymmetric Top): $q_{\text{rot}} = \frac{\sqrt{\pi}}{\sigma} \left( \frac{k_B T}{h c \tilde{A}} \frac{k_B T}{h c \tilde{B}} \frac{k_B T}{h c \tilde{C}} \right)^{1/2}$
3. **Vibrational**:
   $$q_{\text{vib}} = \prod_{i=1}^{3N-6} \frac{e^{-\hbar\omega_i / 2 k_B T}}{1 - e^{-\hbar\omega_i / k_B T}}$$
4. **Electronic**:
   $$q_{\text{elec}} \approx g_0 \text{ (ground-state degeneracy)}$$

---

## 9. Macroscopic Statistical Thermodynamic Derivatives ($U, C_p, S^\circ, \Delta G^\circ, K_{\text{eq}}$)

### A. Internal Thermal Energy ($U$):
$$U = k_B T^2 \left( \frac{\partial \ln Q}{\partial T} \right)_V = U_{\text{trans}} + U_{\text{rot}} + U_{\text{vib}} \text{ (in kJ/mol)}$$

- $U_{\text{trans}} = \frac{3}{2} R T$
- $U_{\text{rot}} = \frac{3}{2} R T$ (non-linear) or $R T$ (linear)
- $U_{\text{vib}} = R \sum_{i=1}^{3N-6} \left( \frac{\Theta_{\text{vib}, i}}{2} + \frac{\Theta_{\text{vib}, i}}{e^{\Theta_{\text{vib}, i} / T} - 1} \right)$

### B. Molar Heat Capacity at Constant Pressure ($C_p$):
$$C_p = C_v + R = \left( \frac{\partial U}{\partial T} \right)_V + R \text{ (in J/mol}\cdot\text{K)}$$

where Einstein vibrational heat capacity contribution is:

$$C_{v, \text{vib}} = R \sum_{i=1}^{3N-6} \left( \frac{\Theta_{\text{vib}, i}}{T} \right)^2 \frac{e^{\Theta_{\text{vib}, i} / T}}{\left( e^{\Theta_{\text{vib}, i} / T} - 1 \right)^2}$$

### C. Absolute Entropy ($S^\circ$):
$$S^\circ = R \left( \ln Q_{\text{total}} + 1 \right) + \frac{U_{\text{total}}}{T} \text{ (in J/mol}\cdot\text{K)}$$

### D. Gibbs Free Energy ($\Delta G_f^\circ$) & Equilibrium Constant ($K_{\text{eq}}$):
$$\Delta G_f^\circ = \Delta H_f^\circ - T \cdot \Delta S^\circ \text{ (in kJ/mol)}$$

$$K_{\text{eq}} = \exp\left( -\frac{\Delta G_f^\circ}{R T} \right)$$

---

## 10. Arrhenius Reaction Kinetics & Chemical Dissociation

Reaction rate constant $k(T)$ is evaluated using the Arrhenius equation:

$$k(T) = A \cdot \exp\left( -\frac{E_a}{R T} \right)$$

where:
- $A$: Pre-exponential frequency factor ($10^{13}\text{ s}^{-1}$).
- $E_a$: Activation energy barrier evaluated from bond dissociation energy sum ($\text{kJ/mol}$).
- When kinetic energy exceeds activation energy ($E_k > E_a$ at high temperatures), chemical dissociation / pyrolysis occurs.

---

## 11. Sub-Atomic Nuclear Physics & Electron Trajectories

Sub-atomic rendering scales relative nucleon sizes:
- Protons ($p^+$): Charge $+e$, mass $1.007276\text{ amu}$, constituent valence quarks $u u d$ (2 Up Quarks $+\frac{2}{3}e$ + 1 Down Quark $-\frac{1}{3}e$).
- Neutrons ($n^0$): Charge $0$, mass $1.008665\text{ amu}$, constituent valence quarks $u d d$ (1 Up Quark $+\frac{2}{3}e$ + 2 Down Quarks $-\frac{1}{3}e$).
- Nuclear radius packing: $R_{\text{nucleus}} \approx 0.05 \cdot A^{1/3}\text{ \AA}$.
- Orbiting valence electrons ($e^-$): Point-particles traversing 3D parametric orbital trajectories $\vec{r}(t) = (1-u)\vec{r}_A + u\vec{r}_B + \hat{n}_{\perp} A_{\text{orb}} \sin(\omega t + \phi)$.

---

## 12. Quantum Chromodynamics (QCD) & $SU(3)_c$ Quark Field Mathematics

### A. Quark Flavors & Spin ($\frac{1}{2}$) Algebra:
Quarks are fundamental spin-$\frac{1}{2}$ fermions in 2D complex Hilbert space $\mathbb{C}^2$, governed by $SU(2)$ Lie algebra and Pauli spin matrices $\mathbf{\hat{S}} = \frac{\hbar}{2} \boldsymbol{\sigma}$:

$$\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad \sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad \sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$

$$[\sigma_j, \sigma_k] = 2i \sum_l \epsilon_{jkl} \sigma_l, \quad \hat{S}^2 \chi_{\pm} = \frac{3}{4} \hbar^2 \chi_{\pm}$$

### B. Relativistic Dirac Equation & Chirality:
Relativistic quarks follow the 4-component Dirac bispinor equation $\left( i \gamma^\mu \partial_\mu - \frac{mc}{\hbar} \right) \psi(x) = 0$ with Clifford algebra $\{\gamma^\mu, \gamma^\nu\} = 2\eta^{\mu\nu} I_4$.

Helicity $\hat{h} = \mathbf{\Sigma} \cdot \frac{\mathbf{p}}{|\mathbf{p}|}$ and Chirality projection operators $P_L = \frac{1-\gamma^5}{2}, P_R = \frac{1+\gamma^5}{2}$.

### C. Color Charge & 8 Gell-Mann Matrices ($\lambda^a$):
Local color gauge symmetry is governed by $SU(3)_c$ with color vectors $\psi_{\text{color}} = (c_R, c_G, c_B)^T$ and 8 Gell-Mann matrix generators $T^a = \frac{1}{2} \lambda^a$:

$$\lambda^1 = \begin{pmatrix}0&1&0\\1&0&0\\0&0&0\end{pmatrix}, \, \lambda^2 = \begin{pmatrix}0&-i&0\\i&0&0\\0&0&0\end{pmatrix}, \, \lambda^3 = \begin{pmatrix}1&0&0\\0&-1&0\\0&0&0\end{pmatrix}, \dots, \, \lambda^8 = \frac{1}{\sqrt{3}}\begin{pmatrix}1&0&0\\0&1&0\\0&0&-2\end{pmatrix}$$

$$[T^a, T^b] = i \sum_{c=1}^{8} f^{abc} T^c$$

### D. The QCD Lagrangian Density ($\mathcal{L}_{\text{QCD}}$):
$$\mathcal{L}_{\text{QCD}} = \sum_f \bar{\psi}_f \left( i \gamma^\mu D_\mu - m_f \right) \psi_f - \frac{1}{4} G_{\mu\nu}^a G_a^{\mu\nu}$$

where:
- Gauge Covariant Derivative: $D_\mu = \partial_\mu + i g_s \sum_{a=1}^8 A_\mu^a T^a$
- Gluon Field Strength Tensor: $G_{\mu\nu}^a = \partial_\mu A_\nu^a - \partial_\nu A_\mu^a + g_s \sum_{b,c=1}^8 f^{abc} A_\mu^b A_\nu^c$

---

## 13. QCD Thermodynamics & Quark-Gluon Plasma (QGP) Equation of State

At extreme temperatures ($T \ge 10^{12}\text{ K}$) or baryon density, hadronic matter undergoes a deconfinement phase transition into a **Quark-Gluon Plasma (QGP)**.

### A. Path-Integral Grand Canonical Partition Function ($\mathcal{Z}$):
$$\mathcal{Z}(V,T,\mu) = \int \mathcal{D}\bar{\psi} \mathcal{D}\psi \mathcal{D}A \exp \left[ \int_{0}^{1/k_B T} d\tau \int_V d^3x \, \mathcal{L}_{\text{QCD}}(\psi, \bar{\psi}, A; \mu) \right]$$

where $\mathcal{L}_{\text{QCD}}(\mu) = \mathcal{L}_{\text{QCD}} + \sum_f \mu_f \bar{\psi}_f \gamma^0 \psi_f$.

### B. Ideal QGP Stefan-Boltzmann Limit:
Degrees of freedom for $N_f = 2$ light flavors ($u, d$):
- Gluons ($d_g$): $8 \times 2 = 16$
- Quarks ($d_q$): $N_f \times 3 \times 2 \times 2 = 24$

Grand Thermodynamic Potential ($\Omega$):

$$\frac{\Omega}{V} = -\frac{\pi^2 T^4}{90} \left[ d_g + \frac{7}{8} d_q \right] = -\frac{37\pi^2}{90} T^4$$

Ultra-Relativistic Equation of State:
- **Pressure ($P$)**: $P = \frac{37\pi^2}{90} T^4$
- **Energy Density ($\varepsilon$)**: $\varepsilon = 3P = \frac{37\pi^2}{30} T^4$
- **Entropy Density ($s$)**: $s = \frac{\partial P}{\partial T} = \frac{74\pi^2}{45} T^3$

### C. MIT Bag Model & Confinement Trace Anomaly ($\Delta$):
Including vacuum bag pressure $B$ to trap quarks:

$$P_{\text{QGP}} = \frac{37\pi^2}{90} T^4 - B, \quad \varepsilon_{\text{QGP}} = \frac{37\pi^2}{30} T^4 + B, \quad \varepsilon_{\text{QGP}} = 3 P_{\text{QGP}} + 4B$$

Conformal trace anomaly:

$$\Delta = \frac{\varepsilon - 3P}{T^4} = \frac{4B}{T^4}$$

### D. Critical Transition Temperature ($T_c$):
Equating QGP pressure to pion gas pressure ($P_{\text{hadron}} = \frac{3\pi^2}{90} T^4$):

$$P_{\text{QGP}} = P_{\text{hadron}} \implies \frac{34\pi^2}{90} T_c^4 = B \implies T_c = \left( \frac{90 B}{34 \pi^2} \right)^{1/4}$$

Using $B^{1/4} \approx 200\text{ MeV}$, the critical deconfinement temperature evaluates to:

$$T_c \approx 144\text{ MeV} \quad (\sim 1.6 \times 10^{12} \text{ Kelvin})$$

### E. AdS/CFT Quantum Bound for Relativistic Viscosity Ratio ($\eta/s$):
$$\frac{\eta}{s} \ge \frac{\hbar}{4\pi k_B}$$

---

## 14. Chemical Graph Theory & Preferred IUPAC Name (PIN) Canonicalization

AtomSynthesizer converts chemical graphs $G = (V, E, L_V, L_E)$ into Preferred IUPAC Names (PIN) via topological sorting and Cahn-Ingold-Prelog (CIP) stereochemical algorithms.

### A. Morgan Algorithm & Canonical Graph Invariants:
Vertex invariants are updated iteratively until equivalence partitioning stabilizes:

$$W_i^{(t+1)} = \sum_{j \in N(i)} W_j^{(t)}$$

### B. 5-Step IUPAC Rule Hierarchy:
1. **Principal Group Suffix Anchor**: Carboxylic acid > Ester > Amide > Nitrile > Aldehyde > Ketone > Alcohol > Amine > Alkene > Alkyne > Alkane.
2. **Principal Parent Chain**: Max suffix groups $\to$ Max chain length $\to$ Max unsaturations.
3. **Lowest Locant Set Rule**: Numbering direction chosen to minimize locant set $A = \{a_1, a_2, \dots\}$.
4. **Punctuation Rules**: Number-to-Number $\to$ `,` | Number-to-Letter $\to$ `-` | Letter-to-Letter $\to$ Direct word merge.
5. **3D Cahn-Ingold-Prelog (CIP) Stereodescriptors**:
   - **Chiral Centers ($R/S$)**: Evaluated via 3D scalar triple product of CIP priority vectors:
     $$\text{Sign} = \vec{v}_{14} \cdot (\vec{v}_{24} \times \vec{v}_{34}) \implies \begin{cases} > 0 & (R) \text{ (Rectus / Clockwise)} \\ < 0 & (S) \text{ (Sinister / Counter-clockwise)} \end{cases}$$
   - **Alkene Double Bond ($E/Z$)**: Dihedral angle between high-priority CIP vectors: $\theta \approx 0^\circ \implies (Z)$ (Zusammen) vs $\theta \approx 180^\circ \implies (E)$ (Entgegen).

---

## 15. Born-Oppenheimer PES Energy Minimization & Force Field Geometry Extraction

Equilibrium 3D molecular geometries are calculated by finding local minima on the Born-Oppenheimer Potential Energy Surface (PES) where atomic forces vanish ($\mathbf{g} = \mathbf{0}$).

### A. Atomic Forces & Newton-Raphson Minimization Step:
Forces are the negative gradient of total potential energy:

$$\mathbf{F}_A = -\nabla_A E = -\left(\frac{\partial E}{\partial x_A}, \frac{\partial E}{\partial y_A}, \frac{\partial E}{\partial z_A}\right)^T$$

Newton-Raphson update step using the $3M \times 3M$ Hessian matrix $\mathbf{H}$ ($H_{ij} = \frac{\partial^2 E}{\partial R_i \partial R_j}$):

$$\Delta \mathbf{R} = -\mathbf{H}^{-1} \mathbf{g}$$

### B. 3D Vector Calculus Geometry Extraction:
- **3D Bond Length ($d$)**:
  $$d = \|\mathbf{v}_{AB}\| = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$$

- **3D Bond Angle ($\theta$)**:
  $$\mathbf{u}_{BA} = \frac{\mathbf{R}_A - \mathbf{R}_B}{\|\mathbf{R}_A - \mathbf{R}_B\|}, \quad \mathbf{u}_{BC} = \frac{\mathbf{R}_C - \mathbf{R}_B}{\|\mathbf{R}_C - \mathbf{R}_B\|}$$
  $$\theta = \arccos(\mathbf{u}_{BA} \cdot \mathbf{u}_{BC}) = \arccos\left( \frac{\mathbf{v}_{BA} \cdot \mathbf{v}_{BC}}{\|\mathbf{v}_{BA}\| \|\mathbf{v}_{BC}\|} \right)$$

- **3D Dihedral Torsion Angle ($\phi$)**:
  $$\phi = \text{atan2}\left( (\mathbf{n}_1 \times \mathbf{n}_2) \cdot \hat{\mathbf{b}}_2, \; \mathbf{n}_1 \cdot \mathbf{n}_2 \right), \quad \mathbf{n}_1 = \mathbf{b}_1 \times \mathbf{b}_2, \; \mathbf{n}_2 = \mathbf{b}_2 \times \mathbf{b}_3$$

### C. Empirical Molecular Mechanics (MM) Potential Energy Equation:
$$E_{\text{total}} = \sum_{\text{bonds}} K_d (d - d_0)^2 + \sum_{\text{angles}} K_\theta (\theta - \theta_0)^2 + \sum_{\text{dihedrals}} V_n [1 + \cos(n\phi - \gamma)] + \sum_{i < j} 4\varepsilon_{ij} \left[ \left(\frac{\sigma_{ij}}{r_{ij}}\right)^{12} - \left(\frac{\sigma_{ij}}{r_{ij}}\right)^6 \right]$$
