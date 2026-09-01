import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export class FormulaEngine {
  public static generateFormula(graph: MolecularGraph): string {
    const atoms = graph.getAllAtoms();
    if (atoms.length === 0) return '';

    // Count element frequencies
    const elementCounts: Map<string, number> = new Map();
    for (const atom of atoms) {
      const elDef = ElementRepository.getByAtomicNumber(atom.atomicNumber);
      const symbol = elDef ? elDef.symbol : `E${atom.atomicNumber}`;
      elementCounts.set(symbol, (elementCounts.get(symbol) || 0) + 1);
    }

    const hasCarbon = elementCounts.has('C');
    const symbols = Array.from(elementCounts.keys());

    // Sort symbols according to Hill System rules
    symbols.sort((a, b) => {
      if (hasCarbon) {
        if (a === 'C') return -1;
        if (b === 'C') return 1;
        if (a === 'H') return -1;
        if (b === 'H') return 1;
      }
      return a.localeCompare(b);
    });

    let formula = '';
    for (const sym of symbols) {
      const count = elementCounts.get(sym)!;
      formula += sym;
      if (count > 1) {
        formula += count.toString();
      }
    }

    // Append charge if non-zero
    const totalCharge = graph.calculateTotalCharge();
    if (totalCharge !== 0) {
      if (totalCharge === 1) {
        formula += '+';
      } else if (totalCharge === -1) {
        formula += '-';
      } else if (totalCharge > 1) {
        formula += `^+${totalCharge}`;
      } else {
        formula += `^${totalCharge}`;
      }
    }

    return formula;
  }
}
