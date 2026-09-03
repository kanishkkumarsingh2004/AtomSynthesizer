import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export interface ThermodynamicsResult {
  enthalpyKjPerMol: number;       // Standard Enthalpy of Formation ΔH°f in kJ/mol
  entropyJPerMolK: number;        // Standard Molar Entropy S° in J/(mol·K)
  gibbsFreeEnergyKjPerMol: number;// Standard Gibbs Free Energy ΔG° in kJ/mol
  temperatureK: number;           // Temperature T in K
  isSpontaneous: boolean;         // ΔG° < 0
  isExothermic: boolean;          // ΔH° < 0
  equilibriumConstantKeq: number; // Keq = exp(-ΔG / RT)
  dataSource: 'NIST Reference Data (Experimental)' | 'Atomization & Statistical Mechanics Model';
  summary: string;
}

/**
 * Standard Experimental Reference Values at 298.15 K, 1 bar (NIST Chemistry WebBook / CRC Handbook)
 * Key format: sorted hill formula (e.g. C1O2, H2O1, C1H4, H3N1)
 */
interface NISTData {
  enthalpy: number; // kJ/mol
  entropy: number;  // J/(mol·K)
  gibbs: number;    // kJ/mol
}

const NIST_THERMO_DATABASE: Record<string, NISTData> = {
  'C1O2': { enthalpy: -393.5, entropy: 213.8, gibbs: -394.4 }, // Carbon dioxide
  'H2O1': { enthalpy: -241.8, entropy: 188.8, gibbs: -228.6 }, // Water (gas)
  'C1H4': { enthalpy: -74.8, entropy: 186.3, gibbs: -50.5 },   // Methane
  'H3N1': { enthalpy: -45.9, entropy: 192.8, gibbs: -16.4 },   // Ammonia
  'O2':   { enthalpy: 0.0,    entropy: 205.2, gibbs: 0.0 },     // Oxygen gas
  'N2':   { enthalpy: 0.0,    entropy: 191.6, gibbs: 0.0 },     // Nitrogen gas
  'H2':   { enthalpy: 0.0,    entropy: 130.7, gibbs: 0.0 },     // Hydrogen gas
  'C1O1': { enthalpy: -110.5, entropy: 197.7, gibbs: -137.2 }, // Carbon monoxide
  'C2H6': { enthalpy: -84.0,  entropy: 229.6, gibbs: -32.0 },  // Ethane
  'C2H4': { enthalpy: 52.4,   entropy: 219.3, gibbs: 68.4 },   // Ethene
  'C2H2': { enthalpy: 226.7,  entropy: 200.9, gibbs: 209.2 },  // Acetylene
  'C6H6': { enthalpy: 82.9,   entropy: 269.2, gibbs: 129.7 },  // Benzene
  'C1H4O1': { enthalpy: -201.0, entropy: 239.9, gibbs: -162.5 },// Methanol
  'C2H6O1': { enthalpy: -234.8, entropy: 281.6, gibbs: -167.9 },// Ethanol
  'C1H2O1': { enthalpy: -108.6, entropy: 218.8, gibbs: -102.5 },// Formaldehyde
  'C1H2O2': { enthalpy: -378.6, entropy: 248.7, gibbs: -351.0 },// Formic acid
  'C2H4O2': { enthalpy: -432.2, entropy: 282.5, gibbs: -374.0 },// Acetic acid
  'C3H6O1': { enthalpy: -217.5, entropy: 294.9, gibbs: -153.0 },// Acetone
  'C3H8':   { enthalpy: -103.8, entropy: 270.3, gibbs: -23.4 }, // Propane
  'O3':     { enthalpy: 142.7,  entropy: 238.9, gibbs: 163.2 }, // Ozone
  'N1O2':   { enthalpy: 33.2,   entropy: 240.1, gibbs: 51.3 },  // Nitrogen dioxide
  'S1O2':   { enthalpy: -296.8, entropy: 248.2, gibbs: -300.1 },// Sulfur dioxide
  'H1Cl1':  { enthalpy: -92.3,  entropy: 186.9, gibbs: -95.3 }, // Hydrogen chloride
  'H1F1':   { enthalpy: -273.3, entropy: 173.8, gibbs: -275.4 },// Hydrogen fluoride
  'H2O2':   { enthalpy: -136.3, entropy: 232.7, gibbs: -105.6 } // Hydrogen peroxide
};

export class ThermodynamicsEngine {
  // Standard bond dissociation energies in kJ/mol
  private static BOND_ENERGIES: Record<string, number> = {
    'H-H': 436, 'C-H': 413, 'C-C': 348, 'C=C': 614, 'C#C': 839,
    'C-O': 358, 'C=O': 745, 'O-H': 463, 'O=O': 498, 'N-H': 391,
    'N-N': 163, 'N=N': 418, 'N#N': 945, 'C-N': 305, 'C=N': 615,
    'C#N': 891, 'C-F': 485, 'C-Cl': 339, 'C-Br': 285, 'C-I': 213,
    'H-F': 567, 'H-Cl': 431, 'H-Br': 366, 'H-I': 298, 'O-O': 146
  };

  // Standard heats of atomization ΔH_atom in kJ/mol (at 298.15 K)
  private static ATOMIZATION_ENTHALPIES: Record<number, number> = {
    1: 218.0,  // H
    6: 716.7,  // C
    7: 472.7,  // N
    8: 249.2,  // O
    9: 79.4,   // F
    15: 314.6, // P
    16: 277.2, // S
    17: 121.3, // Cl
    35: 111.9, // Br
    53: 106.8  // I
  };

  /**
   * Helper to construct sorted formula key for lookup
   */
  private static getFormulaKey(graph: MolecularGraph): string {
    const atoms = graph.getAllAtoms();
    const counts = new Map<number, number>();

    for (const atom of atoms) {
      counts.set(atom.atomicNumber, (counts.get(atom.atomicNumber) || 0) + 1);
    }

    const entries: { symbol: string; count: number; priority: number }[] = [];
    for (const [atomicNum, count] of counts) {
      const el = ElementRepository.getByAtomicNumber(atomicNum);
      const symbol = el?.symbol || `Z${atomicNum}`;
      let priority = 2;
      if (symbol === 'C') priority = 0;
      else if (symbol === 'H') priority = 1;
      entries.push({ symbol, count, priority });
    }

    entries.sort((a, b) => a.priority - b.priority || a.symbol.localeCompare(b.symbol));
    return entries.map((e) => `${e.symbol}${e.count}`).join('');
  }

  /**
   * Estimates Standard Enthalpy of Formation ΔH°f in kJ/mol using Atomization & Bond Dissociation
   */
  public static calculateEnthalpy(graph: MolecularGraph): number {
    const atoms = graph.getAllAtoms();
    if (atoms.length === 0) return 0;

    const formulaKey = this.getFormulaKey(graph);
    const nistRef = NIST_THERMO_DATABASE[formulaKey];
    if (nistRef) {
      return nistRef.enthalpy;
    }

    let atomizationSum = 0;
    for (const a of atoms) {
      const el = ElementRepository.getByAtomicNumber(a.atomicNumber);
      const atomEnergy = this.ATOMIZATION_ENTHALPIES[a.atomicNumber] ?? (100.0 + (el?.atomicMass ?? 20) * 1.5);
      atomizationSum += atomEnergy;
    }

    let totalBondEnergy = 0;
    for (const bond of graph.getAllBonds()) {
      const a1 = graph.getAtom(bond.atomA);
      const a2 = graph.getAtom(bond.atomB);
      if (!a1 || !a2) continue;

      const s1 = ElementRepository.getByAtomicNumber(a1.atomicNumber)?.symbol ?? 'X';
      const s2 = ElementRepository.getByAtomicNumber(a2.atomicNumber)?.symbol ?? 'X';

      const key1 = bond.order === 3 ? `${s1}#${s2}` : bond.order === 2 ? `${s1}=${s2}` : `${s1}-${s2}`;
      const key2 = bond.order === 3 ? `${s2}#${s1}` : bond.order === 2 ? `${s2}=${s1}` : `${s2}-${s1}`;

      let energy = this.BOND_ENERGIES[key1] ?? this.BOND_ENERGIES[key2];
      if (!energy) {
        // Universal Pauling electronegativity & covalent radius bond dissociation energy for all 118 elements
        const el1 = ElementRepository.getByAtomicNumber(a1.atomicNumber);
        const el2 = ElementRepository.getByAtomicNumber(a2.atomicNumber);
        const r1 = el1?.covalentRadius ?? 1.0;
        const r2 = el2?.covalentRadius ?? 1.0;
        const chi1 = el1?.electronegativity ?? 2.2;
        const chi2 = el2?.electronegativity ?? 2.2;
        const deltaChi = Math.abs(chi1 - chi2);

        const avgR = (r1 + r2) / 2.0;
        energy = Math.pow(bond.order, 0.6) * (300.0 / avgR) + 96.5 * Math.pow(deltaChi, 2);
      }

      totalBondEnergy += energy;
    }

    const estimatedDeltaH = Math.round((atomizationSum - totalBondEnergy) * 10) / 10;
    return estimatedDeltaH;
  }

  /**
   * Estimates Standard Molar Entropy S° in J/(mol·K) via Statistical Mechanics (Sackur-Tetrode)
   */
  public static calculateEntropy(graph: MolecularGraph, temperatureK = 298.15): number {
    const atoms = graph.getAllAtoms();
    if (atoms.length === 0) return 0;

    const formulaKey = this.getFormulaKey(graph);
    const nistRef = NIST_THERMO_DATABASE[formulaKey];
    if (nistRef && Math.abs(temperatureK - 298.15) < 0.1) {
      return nistRef.entropy;
    }

    let totalMass = 0;
    for (const a of atoms) {
      const el = ElementRepository.getByAtomicNumber(a.atomicNumber);
      totalMass += el ? el.atomicMass : 12;
    }

    // Sackur-Tetrode Translational Entropy: S_trans = R * (1.5 * ln(M) + 2.5 * ln(T) - 1.165)
    const R = 8.314; // J/(mol·K)
    const sTrans = R * (1.5 * Math.log(Math.max(1, totalMass)) + 2.5 * Math.log(temperatureK) - 1.165);

    // Rotational & Vibrational entropy
    const numBonds = graph.getAllBonds().length;
    const sRot = atoms.length > 1 ? 42.0 + Math.log(totalMass) * 8.5 : 0;
    const sVib = numBonds * 8.5;

    let totalS = Math.round((sTrans + sRot + sVib) * 10) / 10;
    if (nistRef) {
      // Temperature correction relative to NIST 298.15 K baseline
      totalS = Math.round((nistRef.entropy + R * 2.5 * Math.log(temperatureK / 298.15)) * 10) / 10;
    }

    return Math.max(10, totalS);
  }

  /**
   * Calculates Gibbs Free Energy ΔG° = ΔH° - T * ΔS° and equilibrium constant Keq
   */
  public static analyzeThermodynamics(
    graph: MolecularGraph,
    temperatureK = 298.15
  ): ThermodynamicsResult {
    const formulaKey = this.getFormulaKey(graph);
    const nistRef = NIST_THERMO_DATABASE[formulaKey];
    const isNIST = !!nistRef && Math.abs(temperatureK - 298.15) < 0.1;

    const deltaH = this.calculateEnthalpy(graph);
    const S = this.calculateEntropy(graph, temperatureK);

    let deltaG: number;
    if (isNIST) {
      deltaG = nistRef.gibbs;
    } else {
      // ΔG° = ΔH° - T * ΔS° (converting ΔS from J/(mol·K) to kJ/(mol·K))
      deltaG = Math.round((deltaH - (temperatureK * S) / 1000.0) * 10) / 10;
    }

    const R_kJ = 0.008314; // kJ/(mol·K)
    const exponent = -deltaG / (R_kJ * temperatureK);
    const Keq = Math.min(1e12, Math.max(1e-12, Math.exp(exponent)));

    const isSpontaneous = deltaG < 0;
    const isExothermic = deltaH < 0;

    let summary = isSpontaneous
      ? `Spontaneous Process (ΔG° = ${deltaG} kJ/mol)`
      : `Non-Spontaneous State (ΔG° = ${deltaG} kJ/mol)`;

    if (isExothermic) {
      summary += ` — Exothermic (ΔH° = ${deltaH} kJ/mol)`;
    } else {
      summary += ` — Endothermic (ΔH° = +${deltaH} kJ/mol)`;
    }

    return {
      enthalpyKjPerMol: deltaH,
      entropyJPerMolK: S,
      gibbsFreeEnergyKjPerMol: deltaG,
      temperatureK,
      isSpontaneous,
      isExothermic,
      equilibriumConstantKeq: Math.round(Keq * 1000) / 1000,
      dataSource: isNIST ? 'NIST Reference Data (Experimental)' : 'Atomization & Statistical Mechanics Model',
      summary
    };
  }
}
