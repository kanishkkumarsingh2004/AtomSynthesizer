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

export class NomenclatureEngine {
  public static generateIUPACName(graph: MolecularGraph): string {
    const atoms = graph.getAllAtoms();
    if (atoms.length === 0) return 'Empty';

    // 1. Inorganic or simple monoatomic / diatomic naming
    if (atoms.length === 1) {
      const el = ElementRepository.getByAtomicNumber(atoms[0].atomicNumber);
      return el ? el.name : `Atom #${atoms[0].atomicNumber}`;
    }

    const carbons = atoms.filter((a) => a.atomicNumber === 6);
    const oxygens = atoms.filter((a) => a.atomicNumber === 8);
    const nitrogens = atoms.filter((a) => a.atomicNumber === 7);
    const halogens = atoms.filter((a) => [9, 17, 35, 53].includes(a.atomicNumber));

    // Inorganic non-carbon species
    if (carbons.length === 0) {
      if (atoms.length === 2 && atoms[0].atomicNumber === atoms[1].atomicNumber) {
        const el = ElementRepository.getByAtomicNumber(atoms[0].atomicNumber);
        return `Diatomic ${el?.name || 'element'}`;
      }
      if (oxygens.length === 1 && atoms.length === 3 && atoms.filter(a => a.atomicNumber === 1).length === 2) {
        return 'Water (Oxidane)';
      }
      if (nitrogens.length === 1 && atoms.length === 4 && atoms.filter(a => a.atomicNumber === 1).length === 3) {
        return 'Ammonia (Azane)';
      }
      return 'Inorganic Complex';
    }

    // 2. Organic Nomenclature (Carbon-based)
    const numCarbons = carbons.length;
    const prefix = ALKANE_PREFIXES[numCarbons] || `polycarbon-${numCarbons}`;

    // Check for double and triple bonds
    const bonds = graph.getAllBonds();
    const hasDouble = bonds.some((b) => b.order === 2);
    const hasTriple = bonds.some((b) => b.order === 3);

    // Check for cyclic ring structures
    const components = graph.getConnectedComponents();
    const mainComp = components[0] || [];
    const isCyclic = mainComp.length === numCarbons && bonds.length >= numCarbons;

    // Check for functional groups
    let suffix = 'ane';
    if (hasTriple) suffix = 'yne';
    else if (hasDouble) suffix = 'ene';

    // Check alcohol (-OH)
    const hasAlcohol = oxygens.some((o) => {
      const neighbors = graph.getNeighbors(o.id);
      return neighbors.some((n) => n.atomicNumber === 6) && neighbors.some((n) => n.atomicNumber === 1);
    });

    // Check carboxylic acid (-COOH)
    const hasCarboxylicAcid = carbons.some((c) => {
      const neighbors = graph.getNeighbors(c.id);
      const oxyNeighbors = neighbors.filter((n) => n.atomicNumber === 8);
      return oxyNeighbors.length >= 2;
    });

    let mainName = '';
    if (isCyclic) {
      mainName = `cyclo${prefix}${suffix}`;
    } else {
      mainName = `${prefix}${suffix}`;
    }

    if (hasCarboxylicAcid) {
      mainName += ' oic acid';
    } else if (hasAlcohol) {
      mainName += '-ol';
    }

    // Halogen substituents
    const fluoroCount = atoms.filter((a) => a.atomicNumber === 9).length;
    const chloroCount = atoms.filter((a) => a.atomicNumber === 17).length;
    const bromoCount = atoms.filter((a) => a.atomicNumber === 35).length;
    const iodoCount = atoms.filter((a) => a.atomicNumber === 53).length;

    const subPrefixes: string[] = [];
    if (fluoroCount > 0) subPrefixes.push(fluoroCount > 1 ? `polyfluoro` : 'fluoro');
    if (chloroCount > 0) subPrefixes.push(chloroCount > 1 ? `polychloro` : 'chloro');
    if (bromoCount > 0) subPrefixes.push(bromoCount > 1 ? `polybromo` : 'bromo');
    if (iodoCount > 0) subPrefixes.push(iodoCount > 1 ? `polyiodo` : 'iodo');

    if (subPrefixes.length > 0) {
      mainName = `${subPrefixes.join('-')}${mainName}`;
    }

    // Capitalize first letter
    return mainName.charAt(0).toUpperCase() + mainName.slice(1);
  }
}
