import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { ValidationIssue } from '../../domain/validation/ValidationResult';

export class ValenceEngine {
  public static validateValence(graph: MolecularGraph): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const atoms = graph.getAllAtoms();

    for (const atom of atoms) {
      const elDef = ElementRepository.getByAtomicNumber(atom.atomicNumber);
      if (!elDef) continue;

      const currentValence = graph.calculateValence(atom.id);
      const typicalValences = elDef.typicalValence;

      if (typicalValences.length === 0) continue;

      // Check if current valence is typical
      const matchesTypical = typicalValences.includes(currentValence);

      if (!matchesTypical && currentValence > 0) {
        const maxValence = Math.max(...typicalValences);
        if (currentValence > maxValence + 2) {
          issues.push({
            severity: 'WARNING',
            code: 'HYPERVALENCE_WARN',
            message: `${elDef.name} atom (${atom.id}) has unusually high valence of ${currentValence} (typical: ${typicalValences.join(', ')}).`,
            atomIds: [atom.id]
          });
        } else {
          issues.push({
            severity: 'INFO',
            code: 'UNUSUAL_VALENCE',
            message: `${elDef.name} atom (${atom.id}) has non-standard valence of ${currentValence} (typical: ${typicalValences.join(', ')}).`,
            atomIds: [atom.id]
          });
        }
      }
    }

    return issues;
  }
}
