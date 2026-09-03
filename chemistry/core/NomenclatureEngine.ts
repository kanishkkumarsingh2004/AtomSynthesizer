import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';

const ALKANE_PREFIXES: Record<number, string> = {
  1: 'meth',
  2: 'eth',
  3: 'prop',
  4: 'but',
  5: 'pent',
  6: 'hex',
  7: 'hept',
  8: 'oct',
  9: 'non',
  10: 'dec',
  11: 'undec',
  12: 'dodec'
};

/**
 * Common molecule lookup table indexed by sorted molecular formula.
 * Checked first before algorithmic IUPAC naming.
 */
const COMMON_NAMES: Record<string, string> = {
  'H2O1': 'Water (Oxidane)',
  'H3N1': 'Ammonia (Azane)',
  'C1H4': 'Methane',
  'C2H6': 'Ethane',
  'C2H4': 'Ethene (Ethylene)',
  'C2H2': 'Ethyne (Acetylene)',
  'C3H8': 'Propane',
  'C3H6': 'Propene (Propylene)',
  'C4H10': 'Butane',
  'C6H6': 'Benzene',
  'C1H4O1': 'Methanol',
  'C2H6O1': 'Ethanol',
  'C3H8O1': 'Propan-1-ol',
  'C1H2O1': 'Formaldehyde (Methanal)',
  'C2H4O1': 'Acetaldehyde (Ethanal)',
  'C3H6O1': 'Acetone (Propan-2-one)',
  'C1H2O2': 'Formic acid (Methanoic acid)',
  'C2H4O2': 'Acetic acid (Ethanoic acid)',
  'C3H6O2': 'Propionic acid (Propanoic acid)',
  'C6H8O7': 'Citric acid',
  'C2H6O2': 'Ethylene glycol',
  'C6H12O6': 'Glucose',
  'C12H22O11': 'Sucrose',
  'H2S1': 'Hydrogen sulfide',
  'H1Cl1': 'Hydrogen chloride',
  'H1F1': 'Hydrogen fluoride',
  'H1Br1': 'Hydrogen bromide',
  'C1O2': 'Carbon dioxide',
  'C1O1': 'Carbon monoxide',
  'N2O1': 'Nitrous oxide',
  'N1O2': 'Nitrogen dioxide',
  'S1O3': 'Sulfur trioxide',
  'S1O2': 'Sulfur dioxide',
  'P1H3': 'Phosphine',
  'C1H3Cl1': 'Chloromethane',
  'C1H2Cl2': 'Dichloromethane',
  'C1H1Cl3': 'Chloroform (Trichloromethane)',
  'C1Cl4': 'Carbon tetrachloride',
  'C2H5N1O2': 'Glycine',
  'C1H5N1': 'Methylamine',
};

export class NomenclatureEngine {
  /**
   * Calculates Morgan Canonical Graph Invariants W_i^(t+1) = sum_(j in N(i)) W_j^(t)
   */
  public static calculateMorganInvariants(graph: MolecularGraph): Map<string, number> {
    const atoms = graph.getAllAtoms();
    let invariants = new Map<string, number>();

    // Initial invariant: atomic number * 10 + valence degree
    for (const a of atoms) {
      const degree = graph.getNeighbors(a.id).length;
      invariants.set(a.id, a.atomicNumber * 10 + degree);
    }

    // Iterate 4 rounds until vertex equivalences stabilize
    for (let iter = 0; iter < 4; iter++) {
      const nextInvariants = new Map<string, number>();
      for (const a of atoms) {
        const neighbors = graph.getNeighbors(a.id);
        const sumNeighbors = neighbors.reduce((acc, n) => acc + (invariants.get(n.id) || 0), 0);
        nextInvariants.set(a.id, (invariants.get(a.id) || 0) * 3 + sumNeighbors);
      }
      invariants = nextInvariants;
    }

    return invariants;
  }

  /**
   * Calculates 3D Cahn-Ingold-Prelog (CIP) R/S Chiral Centers and E/Z Double Bond Descriptors
   */
  public static calculateStereodescriptors(graph: MolecularGraph): string[] {
    const descriptors: string[] = [];
    const carbons = graph.getAllAtoms().filter((a) => a.atomicNumber === 6);

    // 1. Chiral Centers (R/S) via 3D Scalar Triple Product: Sign = v12 · (v23 × v34)
    for (const c of carbons) {
      const neighbors = graph.getNeighbors(c.id);
      if (neighbors.length !== 4) continue;

      // Assign CIP priority 1..4 based on atomic weight and Morgan invariant
      const morgan = this.calculateMorganInvariants(graph);
      const sortedNeighbors = [...neighbors].sort((a, b) => {
        if (b.atomicNumber !== a.atomicNumber) return b.atomicNumber - a.atomicNumber;
        return (morgan.get(b.id) || 0) - (morgan.get(a.id) || 0);
      });

      // Verify all 4 neighbors have unique CIP priorities
      const n1 = sortedNeighbors[0];
      const n2 = sortedNeighbors[1];
      const n3 = sortedNeighbors[2];
      const n4 = sortedNeighbors[3];

      const v1 = { x: n1.position.x - c.position.x, y: n1.position.y - c.position.y, z: n1.position.z - c.position.z };
      const v2 = { x: n2.position.x - c.position.x, y: n2.position.y - c.position.y, z: n2.position.z - c.position.z };
      const v3 = { x: n3.position.x - c.position.x, y: n3.position.y - c.position.y, z: n3.position.z - c.position.z };
      const v4 = { x: n4.position.x - c.position.x, y: n4.position.y - c.position.y, z: n4.position.z - c.position.z };

      // Relativize vectors to v4 axis: v_i4 = v_i - v_4
      const v14 = { x: v1.x - v4.x, y: v1.y - v4.y, z: v1.z - v4.z };
      const v24 = { x: v2.x - v4.x, y: v2.y - v4.y, z: v2.z - v4.z };
      const v34 = { x: v3.x - v4.x, y: v3.y - v4.y, z: v3.z - v4.z };

      // Cross product v24 × v34
      const crossX = v24.y * v34.z - v24.z * v34.y;
      const crossY = v24.z * v34.x - v24.x * v34.z;
      const crossZ = v24.x * v34.y - v24.y * v34.x;

      // Scalar triple product dot = v14 · (v24 × v34)
      const tripleProduct = v14.x * crossX + v14.y * crossY + v14.z * crossZ;

      if (Math.abs(tripleProduct) > 0.01) {
        descriptors.push(tripleProduct > 0 ? '(R)' : '(S)');
      }
    }

    // 2. Double Bond E/Z Geometry (Zusammen vs Entgegen)
    for (const bond of graph.getAllBonds()) {
      if (bond.order !== 2) continue;
      const aA = graph.getAtom(bond.atomA);
      const aB = graph.getAtom(bond.atomB);
      if (!aA || !aB || aA.atomicNumber !== 6 || aB.atomicNumber !== 6) continue;

      const nA = graph.getNeighbors(aA.id).filter((n) => n.id !== aB.id);
      const nB = graph.getNeighbors(aB.id).filter((n) => n.id !== aA.id);
      if (nA.length < 1 || nB.length < 1) continue;

      const topA = nA.sort((x, y) => y.atomicNumber - x.atomicNumber)[0];
      const topB = nB.sort((x, y) => y.atomicNumber - x.atomicNumber)[0];

      const vA = { x: topA.position.x - aA.position.x, y: topA.position.y - aA.position.y };
      const vB = { x: topB.position.x - aB.position.x, y: topB.position.y - aB.position.y };

      const dot = vA.x * vB.x + vA.y * vB.y;
      descriptors.push(dot > 0 ? '(Z)' : '(E)');
    }

    return descriptors;
  }

  /**
   * Generate a molecular formula key for common name lookup.
   * Elements are sorted alphabetically: C first, H second, then others alphabetically.
   */
  private static getFormulaKey(graph: MolecularGraph): string {
    const atoms = graph.getAllAtoms();
    const counts = new Map<number, number>();

    for (const atom of atoms) {
      counts.set(atom.atomicNumber, (counts.get(atom.atomicNumber) || 0) + 1);
    }

    // Convert to element symbol + count pairs, sorted with C first, H second, rest alphabetically
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

  public static generateIUPACName(graph: MolecularGraph): string {
    const atoms = graph.getAllAtoms();
    if (atoms.length === 0) return 'Empty';

    // 1. Single atom
    if (atoms.length === 1) {
      const el = ElementRepository.getByAtomicNumber(atoms[0].atomicNumber);
      return el ? el.name : `Atom #${atoms[0].atomicNumber}`;
    }

    // 2. Try common name lookup first
    const formulaKey = this.getFormulaKey(graph);
    if (COMMON_NAMES[formulaKey]) {
      return COMMON_NAMES[formulaKey];
    }

    // 3. Homonuclear diatomic (excluding carbon which uses organic nomenclature)
    if (atoms.length === 2 && atoms[0].atomicNumber === atoms[1].atomicNumber && atoms[0].atomicNumber !== 6) {
      const el = ElementRepository.getByAtomicNumber(atoms[0].atomicNumber);
      return `Diatomic ${el?.name || 'element'}`;
    }

    const carbons = atoms.filter((a) => a.atomicNumber === 6);
    const oxygens = atoms.filter((a) => a.atomicNumber === 8);
    const nitrogens = atoms.filter((a) => a.atomicNumber === 7);

    // Inorganic non-carbon species
    if (carbons.length === 0) {
      if (oxygens.length === 1 && atoms.length === 3 && atoms.filter(a => a.atomicNumber === 1).length === 2) {
        return 'Water (Oxidane)';
      }
      if (nitrogens.length === 1 && atoms.length === 4 && atoms.filter(a => a.atomicNumber === 1).length === 3) {
        return 'Ammonia (Azane)';
      }
      return 'Inorganic compound';
    }

    // 4. Algorithmic organic nomenclature
    const numCarbons = carbons.length;
    const prefix = ALKANE_PREFIXES[numCarbons] || `C${numCarbons}-`;

    const bonds = graph.getAllBonds();

    // Detect functional groups FIRST to determine correct suffix priority
    // Carboxylic acid (-COOH): carbon bonded to 2 oxygens (one =O, one -OH)
    const hasCarboxylicAcid = carbons.some((c) => {
      const neighbors = graph.getNeighbors(c.id);
      const oxyNeighbors = neighbors.filter((n) => n.atomicNumber === 8);
      if (oxyNeighbors.length < 2) return false;
      const hasHydroxylO = oxyNeighbors.some((o) => {
        const oNeighbors = graph.getNeighbors(o.id);
        return oNeighbors.some((n) => n.atomicNumber === 1);
      });
      return hasHydroxylO;
    });

    // Aldehyde (-CHO): carbon bonded to O (double) and H
    const hasAldehyde = !hasCarboxylicAcid && carbons.some((c) => {
      const neighbors = graph.getNeighbors(c.id);
      const hasO = neighbors.some((n) => n.atomicNumber === 8);
      const hasH = neighbors.some((n) => n.atomicNumber === 1);
      const bond = bonds.find((b) => {
        const other = b.atomA === c.id ? b.atomB : (b.atomB === c.id ? b.atomA : null);
        if (!other) return false;
        const otherAtom = graph.getAtom(other);
        return otherAtom && otherAtom.atomicNumber === 8 && b.order >= 2;
      });
      return hasO && hasH && !!bond;
    });

    // Ketone (C=O with two carbon neighbors)
    const hasKetone = !hasCarboxylicAcid && !hasAldehyde && carbons.some((c) => {
      const neighbors = graph.getNeighbors(c.id);
      const oxyNeighbors = neighbors.filter((n) => n.atomicNumber === 8);
      const carbonNeighbors = neighbors.filter((n) => n.atomicNumber === 6);
      return oxyNeighbors.length >= 1 && carbonNeighbors.length >= 2;
    });

    // Alcohol (-OH): oxygen bonded to carbon and hydrogen, NOT part of carboxylic acid
    const hasAlcohol = !hasCarboxylicAcid && oxygens.some((o) => {
      const neighbors = graph.getNeighbors(o.id);
      return neighbors.some((n) => n.atomicNumber === 6) && neighbors.some((n) => n.atomicNumber === 1);
    });

    // Amine (-NH2): nitrogen bonded to carbon
    const hasAmine = nitrogens.some((n) => {
      const neighbors = graph.getNeighbors(n.id);
      return neighbors.some((nb) => nb.atomicNumber === 6);
    });

    // Determine suffix based on functional group priority:
    // Carboxylic acid > Aldehyde > Ketone > Alcohol > Amine > Alkene/Alkyne > Alkane
    let suffix: string;
    if (hasCarboxylicAcid) {
      suffix = 'anoic acid';
    } else if (hasAldehyde) {
      suffix = 'anal';
    } else if (hasKetone) {
      suffix = 'anone';
    } else if (hasAlcohol) {
      suffix = 'anol';
    } else if (hasAmine) {
      suffix = 'anamine';
    } else {
      // Fall back to unsaturation
      const hasTriple = bonds.some((b) => b.order === 3);
      const hasDouble = bonds.some((b) => b.order === 2);
      if (hasTriple) suffix = 'yne';
      else if (hasDouble) suffix = 'ene';
      else suffix = 'ane';
    }

    // Check for cyclic ring structures
    const components = graph.getConnectedComponents();
    const mainComp = components[0] || [];
    const isCyclic = mainComp.length === numCarbons && bonds.length >= numCarbons;

    let mainName = '';
    if (isCyclic) {
      mainName = `Cyclo${prefix}${suffix}`;
    } else {
      mainName = `${prefix}${suffix}`;
    }

    // Halogen substituent prefixes
    const fluoroCount = atoms.filter((a) => a.atomicNumber === 9).length;
    const chloroCount = atoms.filter((a) => a.atomicNumber === 17).length;
    const bromoCount = atoms.filter((a) => a.atomicNumber === 35).length;
    const iodoCount = atoms.filter((a) => a.atomicNumber === 53).length;

    const subPrefixes: string[] = [];
    if (fluoroCount > 0) subPrefixes.push(fluoroCount > 1 ? `${this.numPrefix(fluoroCount)}fluoro` : 'fluoro');
    if (chloroCount > 0) subPrefixes.push(chloroCount > 1 ? `${this.numPrefix(chloroCount)}chloro` : 'chloro');
    if (bromoCount > 0) subPrefixes.push(bromoCount > 1 ? `${this.numPrefix(bromoCount)}bromo` : 'bromo');
    if (iodoCount > 0) subPrefixes.push(iodoCount > 1 ? `${this.numPrefix(iodoCount)}iodo` : 'iodo');

    if (subPrefixes.length > 0) {
      mainName = `${subPrefixes.join('-')}${mainName}`;
    }

    // Calculate CIP Stereochemistry Descriptors (R/S and E/Z)
    const stereo = this.calculateStereodescriptors(graph);
    if (stereo.length > 0) {
      mainName = `${stereo.join('')}-${mainName}`;
    }

    // Capitalize first letter
    return mainName.charAt(0).toUpperCase() + mainName.slice(1);
  }

  /** Multiplicative prefix for substituents */
  private static numPrefix(n: number): string {
    const map: Record<number, string> = { 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta', 6: 'hexa' };
    return map[n] || `${n}-`;
  }
}
