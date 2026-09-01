import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { Vector3D } from '../../domain/molecular/MolecularTypes';
import { magnitude } from '../../lib/math';

export interface OrbitalLevel {
  index: number;
  energyBeta: number; // In units of beta (x_i where E_i = alpha + x_i * beta)
  energyEV: number;   // Approximate energy in eV (relative to alpha = -11.2 eV, beta = -2.7 eV)
  occupied: boolean;
  electronCount: number; // 0, 1, or 2
  coefficients: number[]; // eigenvector coefficients for each pi atom
}

export interface QuantumAnalysisResult {
  hasConjugation: boolean;
  piAtomIds: string[];
  orbitals: OrbitalLevel[];
  homoIndex: number | null;
  lumoIndex: number | null;
  homoLumoGapEV: number | null;
  totalPiEnergyEV: number | null;
  dipoleVector: Vector3D; // in Debye (D)
  dipoleMagnitude: number; // in Debye (D)
  partialCharges: Map<string, number>;
  status: 'COMPUTED';
  method: 'Hückel MO + Gasteiger Electronegativity Equalization';
}

// Heteroatom parameters for Hückel MO theory: alpha_X = alpha_0 + h_X * beta_0, beta_XY = k_XY * beta_0
const HUCKEL_H_PARAMS: Record<number, number> = {
  6: 0.0,   // Carbon
  7: 1.5,   // Nitrogen (pyrrole-like / 2-electron donor)
  8: 2.0,   // Oxygen (ether/alcohol-like)
  9: 3.0,   // Fluorine
  15: 1.0,  // Phosphorus
  16: 1.0,  // Sulfur
  17: 2.0   // Chlorine
};

const HUCKEL_K_PARAMS: Record<string, number> = {
  '6-6': 1.0,
  '6-7': 0.8,
  '6-8': 0.8,
  '7-7': 1.0,
  '7-8': 0.7,
  '6-16': 0.6
};

// Jacobi Eigenvalue Solver for symmetric matrices
function jacobiEigenvalue(matrix: number[][]): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = matrix.length;
  const A = matrix.map((row) => [...row]);
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1.0 : 0.0))
  );

  const maxIter = 100;
  for (let iter = 0; iter < maxIter; iter++) {
    // Find off-diagonal element with max magnitude
    let maxVal = 0;
    let p = 0;
    let q = 0;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j]) > maxVal) {
          maxVal = Math.abs(A[i][j]);
          p = i;
          q = j;
        }
      }
    }

    if (maxVal < 1e-9) break; // Converged

    const diff = A[q][q] - A[p][p];
    let t: number;
    if (Math.abs(A[p][q]) < 1e-12) {
      t = 0;
    } else {
      const phi = diff / (2 * A[p][q]);
      t = 1 / (Math.abs(phi) + Math.sqrt(phi * phi + 1));
      if (phi < 0) t = -t;
    }

    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;
    const tau = s / (1 + c);

    const temp = A[p][q];
    A[p][q] = 0;
    A[p][p] -= t * temp;
    A[q][q] += t * temp;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const a_ip = A[i][p];
        const a_iq = A[i][q];
        A[i][p] = a_ip - s * (a_iq + tau * a_ip);
        A[p][i] = A[i][p];
        A[i][q] = a_iq + s * (a_ip - tau * a_iq);
        A[q][i] = A[i][q];
      }
    }

    for (let i = 0; i < n; i++) {
      const v_ip = V[i][p];
      const v_iq = V[i][q];
      V[i][p] = v_ip - s * (v_iq + tau * v_ip);
      V[i][q] = v_iq + s * (v_ip - tau * v_iq);
    }
  }

  const eigenvalues = Array.from({ length: n }, (_, i) => A[i][i]);
  const eigenvectors = Array.from({ length: n }, (_, col) =>
    Array.from({ length: n }, (_, row) => V[row][col])
  );

  return { eigenvalues, eigenvectors };
}

export class QuantumEngine {
  /**
   * Calculates Partial Charges using Gasteiger-Marsili Electronegativity Equalization
   */
  public static calculatePartialCharges(graph: MolecularGraph): Map<string, number> {
    const charges = new Map<string, number>();
    const atoms = graph.getAllAtoms();

    for (const atom of atoms) {
      charges.set(atom.id, atom.formalCharge);
    }

    // Iterate charge transfer based on electronegativity differences
    const alpha = -11.2; // eV baseline
    const beta = -2.7;   // eV baseline

    for (let iter = 0; iter < 4; iter++) {
      for (const bond of graph.getAllBonds()) {
        const atomA = graph.getAtom(bond.atomA);
        const atomB = graph.getAtom(bond.atomB);
        if (!atomA || !atomB) continue;

        const elA = ElementRepository.getByAtomicNumber(atomA.atomicNumber);
        const elB = ElementRepository.getByAtomicNumber(atomB.atomicNumber);

        const chiA = (elA?.electronegativity ?? 2.5) + (charges.get(atomA.id) || 0) * 1.2;
        const chiB = (elB?.electronegativity ?? 2.5) + (charges.get(atomB.id) || 0) * 1.2;

        const deltaChi = (chiB - chiA) * 0.1 * bond.order;

        charges.set(atomA.id, (charges.get(atomA.id) || 0) + deltaChi);
        charges.set(atomB.id, (charges.get(atomB.id) || 0) - deltaChi);
      }
    }

    return charges;
  }

  /**
   * Calculates Electric Dipole Moment Vector in Debye (D)
   */
  public static calculateDipoleMoment(
    graph: MolecularGraph,
    partialCharges: Map<string, number>
  ): { vector: Vector3D; magnitude: number } {
    let px = 0;
    let py = 0;
    let pz = 0;

    // Convert e*Å to Debye (1 e*Å = 4.8032 Debye)
    const CONVERSION = 4.8032;

    for (const atom of graph.getAllAtoms()) {
      const q = partialCharges.get(atom.id) || 0;
      px += q * atom.position.x;
      py += q * atom.position.y;
      pz += q * atom.position.z;
    }

    const vector: Vector3D = {
      x: Math.round(px * CONVERSION * 1000) / 1000,
      y: Math.round(py * CONVERSION * 1000) / 1000,
      z: Math.round(pz * CONVERSION * 1000) / 1000
    };

    const mag = Math.round(magnitude(vector) * 1000) / 1000;

    return { vector, magnitude: mag };
  }

  /**
   * Solves Hückel Molecular Orbital (HMO) theory for pi-conjugated systems
   */
  public static analyzeQuantumMechanics(graph: MolecularGraph): QuantumAnalysisResult {
    const partialCharges = this.calculatePartialCharges(graph);
    const dipole = this.calculateDipoleMoment(graph, partialCharges);

    const atoms = graph.getAllAtoms();
    
    // Find conjugated pi-atoms (carbons with double/triple bonds, heteroatoms with lone pairs)
    const piAtoms = atoms.filter((atom) => {
      const bonds = graph.getBondsForAtom(atom.id);
      const hasMultipleBond = bonds.some((b) => b.order > 1 || b.aromatic);
      const isConjugatedHeteroatom = [7, 8, 9, 15, 16, 17].includes(atom.atomicNumber) && bonds.length > 0;
      return hasMultipleBond || isConjugatedHeteroatom;
    });

    if (piAtoms.length < 2) {
      return {
        hasConjugation: false,
        piAtomIds: [],
        orbitals: [],
        homoIndex: null,
        lumoIndex: null,
        homoLumoGapEV: null,
        totalPiEnergyEV: null,
        dipoleVector: dipole.vector,
        dipoleMagnitude: dipole.magnitude,
        partialCharges,
        status: 'COMPUTED',
        method: 'Hückel MO + Gasteiger Electronegativity Equalization'
      };
    }

    const n = piAtoms.length;
    const atomIndexMap = new Map<string, number>();
    piAtoms.forEach((atom, idx) => atomIndexMap.set(atom.id, idx));

    // Construct Hückel Hamiltonian matrix H (in beta units)
    const H: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      const atom = piAtoms[i];
      const h_param = HUCKEL_H_PARAMS[atom.atomicNumber] ?? 0.0;
      H[i][i] = h_param; // Diagonal Coulomb integral parameter
    }

    for (const bond of graph.getAllBonds()) {
      const idxA = atomIndexMap.get(bond.atomA);
      const idxB = atomIndexMap.get(bond.atomB);
      if (idxA !== undefined && idxB !== undefined) {
        const elA = piAtoms[idxA].atomicNumber;
        const elB = piAtoms[idxB].atomicNumber;
        const pairKey = `${Math.min(elA, elB)}-${Math.max(elA, elB)}`;
        const k_param = HUCKEL_K_PARAMS[pairKey] ?? (bond.order >= 2 ? 1.0 : 0.8);
        H[idxA][idxB] = k_param;
        H[idxB][idxA] = k_param;
      }
    }

    const { eigenvalues, eigenvectors } = jacobiEigenvalue(H);

    // Combine eigenvalues with eigenvectors and sort from lowest energy (most negative x_i) to highest
    const ALPHA_EV = -11.2; // eV baseline for C 2p
    const BETA_EV = -2.7;   // eV per beta unit

    const pairedOrbitals = eigenvalues.map((val, i) => ({
      energyBeta: val,
      energyEV: Math.round((ALPHA_EV + val * BETA_EV) * 100) / 100,
      coefficients: eigenvectors[i]
    }));

    // Sort by energy (eigenvalues ascending: lower x_i means more stable energy E = alpha + x*beta, wait! beta is negative)
    // E = alpha + x * beta. If beta < 0, larger x means LOWER energy (more stable).
    // So descending x = ascending energy.
    pairedOrbitals.sort((a, b) => b.energyBeta - a.energyBeta);

    // Fill electrons into orbitals (Aufbau principle: 2 electrons per orbital)
    let totalPiElectrons = n; // Simple baseline pi-electron count
    let homoIndex: number | null = null;
    let lumoIndex: number | null = null;
    let totalPiEnergyEV = 0;

    const orbitals: OrbitalLevel[] = pairedOrbitals.map((orb, i) => {
      let count = 0;
      if (totalPiElectrons >= 2) {
        count = 2;
        totalPiElectrons -= 2;
        homoIndex = i;
      } else if (totalPiElectrons === 1) {
        count = 1;
        totalPiElectrons -= 1;
        homoIndex = i;
      } else {
        count = 0;
        if (lumoIndex === null && homoIndex !== null) {
          lumoIndex = i;
        }
      }

      totalPiEnergyEV += count * orb.energyEV;

      return {
        index: i + 1,
        energyBeta: Math.round(orb.energyBeta * 1000) / 1000,
        energyEV: orb.energyEV,
        occupied: count > 0,
        electronCount: count,
        coefficients: orb.coefficients.map((c) => Math.round(c * 1000) / 1000)
      };
    });

    let homoLumoGapEV: number | null = null;
    if (homoIndex !== null && lumoIndex !== null) {
      homoLumoGapEV = Math.round(Math.abs(orbitals[lumoIndex].energyEV - orbitals[homoIndex].energyEV) * 100) / 100;
    }

    return {
      hasConjugation: true,
      piAtomIds: piAtoms.map((a) => a.id),
      orbitals,
      homoIndex,
      lumoIndex,
      homoLumoGapEV,
      totalPiEnergyEV: Math.round(totalPiEnergyEV * 100) / 100,
      dipoleVector: dipole.vector,
      dipoleMagnitude: dipole.magnitude,
      partialCharges,
      status: 'COMPUTED',
      method: 'Hückel MO + Gasteiger Electronegativity Equalization'
    };
  }
}
