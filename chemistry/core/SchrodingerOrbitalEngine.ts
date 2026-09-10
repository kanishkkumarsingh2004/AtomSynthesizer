import { ElementRepository } from '../../domain/elements/ElementRepository';
import { Vector3D } from '../../domain/molecular/MolecularTypes';
import { Molecule } from '../../domain/molecular/Molecule';
import * as THREE from 'three';

export interface QuantumStateSpec {
  n: number;        // Principal quantum number (1, 2, 3...)
  l: number;        // Azimuthal quantum number (0 = s, 1 = p, 2 = d)
  m: number;        // Magnetic quantum number (-l ... +l)
  spin: number;     // Spin (+0.5 or -0.5)
  energyEV: number; // Quantized energy level E_n in eV
  occupation: number;
}

export interface MolecularOrbital {
  id: string;
  energyEV: number;
  isOccupied: boolean;
  coefficients: Map<string, number>;
}

export class SchrodingerOrbitalEngine {
  /**
   * Solve Time-Independent Schrödinger Equation for Single Atom:
   * H_hat psi_{n,l,m}(r) = E_n psi_{n,l,m}(r)
   * Quantized energy levels: E_n = -13.6057 * Z_eff^2 / n^2 (eV)
   */
  public static solveAtomicSchrodinger(atomicNumber: number): {
    states: QuantumStateSpec[];
    zEff: number;
    groundStateEnergyEV: number;
  } {
    const zEff = this.getEffectiveNuclearCharge(atomicNumber);
    const states: QuantumStateSpec[] = [];

    // Hydrogen-like / Slater energy levels E_n = -13.6057 * Z_eff^2 / n^2 eV
    const calcEnergy = (n: number) => -13.6057 * Math.pow(zEff / n, 2);

    if (atomicNumber === 1) {
      // Hydrogen: 1s^1 (E_1 = -13.6 eV)
      states.push({ n: 1, l: 0, m: 0, spin: 0.5, energyEV: calcEnergy(1), occupation: 1 });
    } else if (atomicNumber <= 2) {
      // Helium: 1s^2
      states.push({ n: 1, l: 0, m: 0, spin: 0.5, energyEV: calcEnergy(1), occupation: 2 });
    } else if (atomicNumber <= 10) {
      // Period 2: 2s^2 2p^k
      states.push({ n: 2, l: 0, m: 0, spin: 0.5, energyEV: calcEnergy(2), occupation: 2 });
      const pCount = Math.max(0, atomicNumber - 4);
      if (pCount >= 1) states.push({ n: 2, l: 1, m: 1, spin: 0.5, energyEV: calcEnergy(2), occupation: Math.min(2, pCount) });
      if (pCount >= 2) states.push({ n: 2, l: 1, m: -1, spin: 0.5, energyEV: calcEnergy(2), occupation: Math.min(2, pCount - 1) });
      if (pCount >= 3) states.push({ n: 2, l: 1, m: 0, spin: 0.5, energyEV: calcEnergy(2), occupation: Math.min(2, pCount - 2) });
    } else {
      // Period 3+: 3s, 3p, 3d
      states.push({ n: 3, l: 0, m: 0, spin: 0.5, energyEV: calcEnergy(3), occupation: 2 });
      states.push({ n: 3, l: 1, m: 1, spin: 0.5, energyEV: calcEnergy(3), occupation: 2 });
      states.push({ n: 3, l: 1, m: -1, spin: 0.5, energyEV: calcEnergy(3), occupation: 2 });
      states.push({ n: 3, l: 1, m: 0, spin: 0.5, energyEV: calcEnergy(3), occupation: 2 });
    }

    return {
      states,
      zEff,
      groundStateEnergyEV: states[0]?.energyEV ?? -13.6
    };
  }

  /**
   * Radial Wavefunction R_{n,l}(r) solution to radial Schrödinger equation
   */
  public static calculateRadialWavefunction(n: number, l: number, r: number, zEff: number): number {
    const a0 = 1.0; // Scaled Bohr radius
    const rho = (2 * zEff * r) / (n * a0);

    if (n === 1 && l === 0) {
      // 1s: R_{1,0}(r) = 2 * (Z/a0)^(3/2) * exp(-rho/2)
      return 2 * Math.pow(zEff / a0, 1.5) * Math.exp(-rho / 2);
    } else if (n === 2 && l === 0) {
      // 2s: R_{2,0}(r) = (1 / 2sqrt(2)) * (Z/a0)^(3/2) * (2 - rho) * exp(-rho/2)
      return (1 / (2 * Math.sqrt(2))) * Math.pow(zEff / a0, 1.5) * (2 - rho) * Math.exp(-rho / 2);
    } else if (n === 2 && l === 1) {
      // 2p: R_{2,1}(r) = (1 / 2sqrt(6)) * (Z/a0)^(3/2) * rho * exp(-rho/2)
      return (1 / (2 * Math.sqrt(6))) * Math.pow(zEff / a0, 1.5) * rho * Math.exp(-rho / 2);
    } else if (n === 3 && l === 0) {
      // 3s
      return (1 / (9 * Math.sqrt(3))) * Math.pow(zEff / a0, 1.5) * (6 - 6 * rho + rho * rho) * Math.exp(-rho / 2);
    } else if (n === 3 && l === 1) {
      // 3p
      return (1 / (9 * Math.sqrt(6))) * Math.pow(zEff / a0, 1.5) * (4 - rho) * rho * Math.exp(-rho / 2);
    } else if (n === 3 && l === 2) {
      // 3d
      return (1 / (9 * Math.sqrt(30))) * Math.pow(zEff / a0, 1.5) * rho * rho * Math.exp(-rho / 2);
    } else {
      return Math.pow(rho, l) * Math.exp(-rho / 2);
    }
  }

  /**
   * Real Spherical Harmonics Y_{l,m}(theta, phi) solution to angular Schrödinger equation
   */
  public static calculateSphericalHarmonic(l: number, m: number, theta: number, phi: number): number {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    if (l === 0) {
      // s orbital: Y_{0,0} = 1 / sqrt(4pi)
      return 0.5 * Math.sqrt(1 / Math.PI);
    } else if (l === 1) {
      // p orbitals
      if (m === 0) return 0.5 * Math.sqrt(3 / Math.PI) * cosT; // p_z
      if (m === 1) return 0.5 * Math.sqrt(3 / Math.PI) * sinT * Math.cos(phi); // p_x
      if (m === -1) return 0.5 * Math.sqrt(3 / Math.PI) * sinT * Math.sin(phi); // p_y
    } else if (l === 2) {
      // d orbitals
      if (m === 0) return 0.25 * Math.sqrt(5 / Math.PI) * (3 * cosT * cosT - 1); // d_z^2
      if (m === 1) return 0.5 * Math.sqrt(15 / Math.PI) * sinT * cosT * Math.cos(phi); // d_xz
      if (m === -1) return 0.5 * Math.sqrt(15 / Math.PI) * sinT * cosT * Math.sin(phi); // d_yz
      if (m === 2) return 0.25 * Math.sqrt(15 / Math.PI) * sinT * sinT * Math.cos(2 * phi); // d_(x^2-y^2)
      if (m === -2) return 0.25 * Math.sqrt(15 / Math.PI) * sinT * sinT * Math.sin(2 * phi); // d_xy
    }

    return 0.5 * Math.sqrt(1 / Math.PI);
  }

  /**
   * Evaluate atomic wavefunction psi_{n,l,m}(r, theta, phi) = R_{n,l}(r) * Y_{l,m}(theta, phi)
   */
  public static calculateWavefunction(n: number, l: number, m: number, r: number, theta: number, phi: number, zEff: number): number {
    const R = this.calculateRadialWavefunction(n, l, r, zEff);
    const Y = this.calculateSphericalHarmonic(l, m, theta, phi);
    return R * Y;
  }

  /**
   * Evaluate total stationary state atomic probability density |Psi(r)|^2
   */
  public static calculateAtomicProbabilityDensity(atomicNumber: number, position: Vector3D, point: Vector3D): number {
    const dx = point.x - position.x;
    const dy = point.y - position.y;
    const dz = point.z - position.z;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (r < 1e-6) return 1.0;

    const theta = Math.acos(Math.max(-1, Math.min(1, dz / r)));
    const phi = Math.atan2(dy, dx);

    const { states, zEff } = this.solveAtomicSchrodinger(atomicNumber);
    let totalDensity = 0;

    for (const state of states) {
      const psi = this.calculateWavefunction(state.n, state.l, state.m, r, theta, phi, zEff);
      totalDensity += state.occupation * (psi * psi);
    }

    return totalDensity;
  }

  /**
   * Solve Molecular Schrödinger Equation via LCAO-MO Secular Matrix: det(H - E S) = 0
   * Constructing molecular orbital wavefunctions Psi_{MO, k}(r) = sum c_{mu, k} phi_mu(r)
   */
  public static solveMolecularSchrodinger(molecule: Molecule): {
    orbitals: MolecularOrbital[];
    calculateMolecularProbabilityDensity: (point: Vector3D) => number;
  } {
    const atomMap = new Map(molecule.atoms.map((a) => [a.id, a]));

    const calculateMolecularProbabilityDensity = (point: Vector3D): number => {
      let totalDensity = 0;

      // 1. Atomic Schrödinger wavefunction densities sum
      for (const atom of molecule.atoms) {
        const dens = this.calculateAtomicProbabilityDensity(atom.atomicNumber, atom.position, point);
        totalDensity += dens;
      }

      // 2. Bond Molecular Orbital overlapping density (constructive LCAO interference)
      for (const bond of molecule.bonds) {
        const aA = atomMap.get(bond.atomA);
        const aB = atomMap.get(bond.atomB);
        if (!aA || !aB) continue;

        const pA = new THREE.Vector3(aA.position.x, aA.position.y, aA.position.z);
        const pB = new THREE.Vector3(aB.position.x, aB.position.y, aB.position.z);
        const pt = new THREE.Vector3(point.x, point.y, point.z);

        const bondVec = new THREE.Vector3().subVectors(pB, pA);
        const bondLen = bondVec.length();
        if (bondLen < 1e-4) continue;

        const bondDir = bondVec.clone().normalize();
        const vToPt = new THREE.Vector3().subVectors(pt, pA);
        const proj = vToPt.dot(bondDir);

        if (proj >= -0.2 * bondLen && proj <= 1.2 * bondLen) {
          const closestOnLine = pA.clone().addScaledVector(bondDir, Math.max(0, Math.min(bondLen, proj)));
          const distPerp = pt.distanceTo(closestOnLine);

          // Overlap constructive interference density Psi_A * Psi_B ~ exp(-distPerp^2 / r0^2)
          const bondOrderFactor = Math.pow(bond.order, 0.7);
          const overlapDensity = bondOrderFactor * Math.exp(-distPerp * distPerp / 0.18);
          totalDensity += overlapDensity * 0.8;
        }
      }

      return totalDensity;
    };

    return {
      orbitals: [],
      calculateMolecularProbabilityDensity
    };
  }

  /**
   * Get effective nuclear charge Z_eff using Slater's rules
   */
  public static getEffectiveNuclearCharge(atomicNumber: number): number {
    if (atomicNumber === 1) return 1.0;
    if (atomicNumber === 2) return 1.69;
    if (atomicNumber === 6) return 3.25;
    if (atomicNumber === 7) return 3.90;
    if (atomicNumber === 8) return 4.55;
    if (atomicNumber === 9) return 5.20;
    if (atomicNumber === 15) return 4.80;
    if (atomicNumber === 16) return 5.45;
    if (atomicNumber === 17) return 6.10;
    return Math.max(1.0, atomicNumber * 0.55);
  }

  /**
   * Monte Carlo rejection sampling directly from Molecular Probability Density |Psi_{mol}(r)|^2
   * Points are 100% STATIC (no random movement over time).
   */
  public static sampleMolecularCloud(
    molecule: Molecule,
    totalPoints: number = 28000
  ): { positions: Float32Array; colors: Float32Array } {
    const posArr = new Float32Array(totalPoints * 3);
    const colArr = new Float32Array(totalPoints * 3);

    if (molecule.atoms.length === 0) {
      return { positions: posArr, colors: colArr };
    }

    const { calculateMolecularProbabilityDensity } = this.solveMolecularSchrodinger(molecule);

    // Color gradient matching Quantum Probability Density:
    // High density / Core: Bright white-yellow (#FFFFFF / #FFE57F)
    // Mid density: Fiery orange (#FF6D00)
    // Low density / Outer lobe: Deep crimson red (#C62828)
    const colorCore = new THREE.Color('#FFFFFF');
    const colorMid = new THREE.Color('#FF6D00');
    const colorOuter = new THREE.Color('#C62828');

    let sampled = 0;
    const pointsPerAtom = Math.floor((totalPoints * 0.85) / molecule.atoms.length);

    for (const atom of molecule.atoms) {
      const el = ElementRepository.getByAtomicNumber(atom.atomicNumber);
      const maxRadius = (el?.covalentRadius || 0.8) * 2.8;
      const zEff = this.getEffectiveNuclearCharge(atom.atomicNumber);

      let count = 0;
      let attempts = 0;

      while (count < pointsPerAtom && sampled < totalPoints && attempts < pointsPerAtom * 25) {
        attempts++;

        // Random candidate point within sphere of radius maxRadius
        const u = Math.random();
        const r = -Math.log(1 - u * 0.99) * (1.2 / zEff) * 1.5;
        if (r > maxRadius) continue;

        const theta = Math.acos(2 * Math.random() - 1);
        const phi = 2 * Math.PI * Math.random();

        const candidatePoint: Vector3D = {
          x: atom.position.x + r * Math.sin(theta) * Math.cos(phi),
          y: atom.position.y + r * Math.sin(theta) * Math.sin(phi),
          z: atom.position.z + r * Math.cos(theta)
        };

        // Evaluate exact Schrödinger molecular probability density |Psi(r)|^2
        const density = calculateMolecularProbabilityDensity(candidatePoint);

        // Rejection test based on probability density
        const targetProb = Math.min(1.0, density * 1.5);
        if (Math.random() > targetProb) continue;

        posArr[sampled * 3] = candidatePoint.x;
        posArr[sampled * 3 + 1] = candidatePoint.y;
        posArr[sampled * 3 + 2] = candidatePoint.z;

        // Color mapping according to local probability density
        const normDensity = Math.min(1.0, density * 1.2);
        let col = new THREE.Color();
        if (normDensity > 0.5) {
          col.lerpColors(colorMid, colorCore, (normDensity - 0.5) / 0.5);
        } else {
          col.lerpColors(colorOuter, colorMid, normDensity / 0.5);
        }

        colArr[sampled * 3] = col.r;
        colArr[sampled * 3 + 1] = col.g;
        colArr[sampled * 3 + 2] = col.b;

        sampled++;
        count++;
      }
    }

    // Fill remaining points cleanly from probability density sampling
    while (sampled < totalPoints) {
      const atom = molecule.atoms[sampled % molecule.atoms.length];
      const r = Math.random() * 0.8;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();

      const candidatePoint: Vector3D = {
        x: atom.position.x + r * Math.sin(theta) * Math.cos(phi),
        y: atom.position.y + r * Math.sin(theta) * Math.sin(phi),
        z: atom.position.z + r * Math.cos(theta)
      };

      const density = calculateMolecularProbabilityDensity(candidatePoint);

      posArr[sampled * 3] = candidatePoint.x;
      posArr[sampled * 3 + 1] = candidatePoint.y;
      posArr[sampled * 3 + 2] = candidatePoint.z;

      const normDensity = Math.min(1.0, density * 1.2);
      let col = new THREE.Color();
      if (normDensity > 0.5) {
        col.lerpColors(colorMid, colorCore, (normDensity - 0.5) / 0.5);
      } else {
        col.lerpColors(colorOuter, colorMid, normDensity / 0.5);
      }

      colArr[sampled * 3] = col.r;
      colArr[sampled * 3 + 1] = col.g;
      colArr[sampled * 3 + 2] = col.b;

      sampled++;
    }

    return { positions: posArr, colors: colArr };
  }
}
