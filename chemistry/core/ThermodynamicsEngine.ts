import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export interface ThermodynamicsResult {
  enthalpyKjPerMol: number;       // ΔH°f in kJ/mol
  entropyJPerMolK: number;        // S° in J/(mol·K)
  gibbsFreeEnergyKjPerMol: number;// ΔG° in kJ/mol
  temperatureK: number;           // Temperature T in K
  isSpontaneous: boolean;         // ΔG° < 0
  isExothermic: boolean;          // ΔH° < 0
  equilibriumConstantKeq: number; // Keq = exp(-ΔG / RT)
  summary: string;
}

export class ThermodynamicsEngine {
  // Standard average bond dissociation energies in kJ/mol
  private static BOND_ENERGIES: Record<string, number> = {
    'H-H': 436,
    'C-H': 413,
    'C-C': 348,
    'C=C': 614,
    'C#C': 839,
    'C-O': 358,
    'C=O': 745,
    'O-H': 463,
    'O=O': 498,
    'N-H': 391,
    'N-N': 163,
    'N=N': 418,
    'N#N': 945,
    'C-N': 305,
    'C=N': 615,
    'C#N': 891,
    'C-F': 485,
    'C-Cl': 339,
    'C-Br': 285,
    'C-I': 213,
    'H-F': 567,
    'H-Cl': 431,
    'H-Br': 366,
    'H-I': 298
  };

  /**
   * Estimates Standard Enthalpy of Formation ΔH°f in kJ/mol
   */
  public static calculateEnthalpy(graph: MolecularGraph): number {
    const bonds = graph.getAllBonds();
    let totalBondEnergy = 0;

    for (const bond of bonds) {
      const a1 = graph.getAtom(bond.atomA);
      const a2 = graph.getAtom(bond.atomB);
      if (!a1 || !a2) continue;

      const s1 = ElementRepository.getByAtomicNumber(a1.atomicNumber)?.symbol ?? 'X';
      const s2 = ElementRepository.getByAtomicNumber(a2.atomicNumber)?.symbol ?? 'X';

      const key1 = bond.order === 3 ? `${s1}#${s2}` : bond.order === 2 ? `${s1}=${s2}` : `${s1}-${s2}`;
      const key2 = bond.order === 3 ? `${s2}#${s1}` : bond.order === 2 ? `${s2}=${s1}` : `${s2}-${s1}`;

      const energy = this.BOND_ENERGIES[key1] ?? this.BOND_ENERGIES[key2] ?? (bond.order * 300);
      totalBondEnergy += energy;
    }

    // Standard enthalpy approximation based on total bond energy
    const numAtoms = graph.getAllAtoms().length;
    const estimatedDeltaH = Math.round((numAtoms * 120 - totalBondEnergy) * 10) / 10;
    return estimatedDeltaH;
  }

  /**
   * Estimates Standard Molar Entropy S° in J/(mol·K) using statistical mechanics
   */
  public static calculateEntropy(graph: MolecularGraph, temperatureK = 298.15): number {
    const atoms = graph.getAllAtoms();
    if (atoms.length === 0) return 0;

    let totalMass = 0;
    for (const a of atoms) {
      const el = ElementRepository.getByAtomicNumber(a.atomicNumber);
      totalMass += el ? el.atomicMass : 12;
    }

    // Translational entropy S_trans = R * (1.5 * ln(M) + 2.5 * ln(T) - 1.16)
    const R = 8.314; // J/(mol·K)
    const sTrans = R * (1.5 * Math.log(Math.max(1, totalMass)) + 2.5 * Math.log(temperatureK) - 1.16);

    // Rotational & Vibrational entropy contributions
    const numBonds = graph.getAllBonds().length;
    const sRot = atoms.length > 1 ? 45.0 + Math.log(totalMass) * 8.0 : 0;
    const sVib = numBonds * 6.5;

    const totalS = Math.round((sTrans + sRot + sVib) * 10) / 10;
    return Math.max(10, totalS);
  }

  /**
   * Calculates Gibbs Free Energy ΔG° = ΔH° - T * ΔS° and equilibrium constant Keq
   */
  public static analyzeThermodynamics(
    graph: MolecularGraph,
    temperatureK = 298.15
  ): ThermodynamicsResult {
    const deltaH = this.calculateEnthalpy(graph);
    const S = this.calculateEntropy(graph, temperatureK);

    // ΔG° = ΔH° - T * ΔS° (converting ΔS from J/(mol·K) to kJ/(mol·K))
    const deltaG = Math.round((deltaH - (temperatureK * S) / 1000.0) * 10) / 10;

    const R_kJ = 0.008314; // kJ/(mol·K)
    const exponent = -deltaG / (R_kJ * temperatureK);
    const Keq = Math.min(1e12, Math.max(1e-12, Math.exp(exponent)));

    const isSpontaneous = deltaG < 0;
    const isExothermic = deltaH < 0;

    let summary = isSpontaneous
      ? `Spontaneous Exergonic Process (ΔG° = ${deltaG} kJ/mol)`
      : `Non-Spontaneous Endergonic State (ΔG° = ${deltaG} kJ/mol)`;

    if (isExothermic) {
      summary += ` — Exothermic (Heat Released: ${Math.abs(deltaH)} kJ/mol)`;
    } else {
      summary += ` — Endothermic (Heat Absorbed: ${deltaH} kJ/mol)`;
    }

    return {
      enthalpyKjPerMol: deltaH,
      entropyJPerMolK: S,
      gibbsFreeEnergyKjPerMol: deltaG,
      temperatureK,
      isSpontaneous,
      isExothermic,
      equilibriumConstantKeq: Math.round(Keq * 1000) / 1000,
      summary
    };
  }
}
