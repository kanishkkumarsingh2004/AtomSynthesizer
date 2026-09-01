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
      // Check one O has H (hydroxyl) and one doesn't (carbonyl)
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

    // Capitalize first letter
    return mainName.charAt(0).toUpperCase() + mainName.slice(1);
  }

  /** Multiplicative prefix for substituents */
  private static numPrefix(n: number): string {
    const map: Record<number, string> = { 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta', 6: 'hexa' };
    return map[n] || `${n}-`;
  }
}
