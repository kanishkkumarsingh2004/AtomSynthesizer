import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { Vector3D } from '../../domain/molecular/MolecularTypes';
import { GeometryOptimizationEngine } from './GeometryOptimizationEngine';
import { AutoBondEngine } from './AutoBondEngine';
import { scale, normalize, add, subtract, distance } from '../../lib/math';

export interface ExplosionEventResult {
  explodedMolecule: Molecule;
  isExplosive: boolean;
  energyReleasedKj: number;
  blastOrigin: Vector3D;
  fragmentVelocities: Map<string, Vector3D>;
  summary: string;
}

export class ExplosionPhysicsEngine {
  /**
   * Detects if the current molecule contains hyper-energetic or chemically unstable structures
   */
  public static checkInstability(molecule: Molecule): { isUnstable: boolean; reason: string; instabilityScore: number } {
    const graph = MolecularGraph.fromMolecule(molecule);
    const atoms = graph.getAllAtoms();

    let instabilityScore = 0;
    const reasons: string[] = [];

    for (const atom of atoms) {
      const el = ElementRepository.getByAtomicNumber(atom.atomicNumber);
      const valence = graph.calculateValence(atom.id);
      const maxValence = el ? Math.max(...el.typicalValence, 1) : 4;

      // Hydrogen over-bonding (e.g. H4 ring in screenshot!)
      if (atom.atomicNumber === 1 && valence > 1) {
        instabilityScore += (valence - 1) * 350;
        reasons.push(`Over-bonded Hydrogen (${atom.id}) with valence ${valence}`);
      }
      // Other severe hypervalency
      else if (valence > maxValence + 1) {
        instabilityScore += (valence - maxValence) * 150;
        reasons.push(`Unstable Hypervalent ${el?.name || 'atom'} (${atom.id})`);
      }
    }

    // Check for small ring strain (3 or 4 membered rings)
    const components = graph.getConnectedComponents();
    for (const comp of components) {
      if (comp.length === 3 || comp.length === 4) {
        instabilityScore += 80;
      }
    }

    return {
      isUnstable: instabilityScore > 100,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Thermally Stable',
      instabilityScore
    };
  }

  /**
   * Simulates chemical explosion & dissociation: breaks unstable bonds, calculates blast impulse vectors,
   * and separates fragments into ground-state stable molecules!
   */
  public static triggerExplosion(molecule: Molecule): ExplosionEventResult {
    const graph = MolecularGraph.fromMolecule(molecule);
    const atoms = graph.getAllAtoms();

    if (atoms.length === 0) {
      return {
        explodedMolecule: molecule,
        isExplosive: false,
        energyReleasedKj: 0,
        blastOrigin: { x: 0, y: 0, z: 0 },
        fragmentVelocities: new Map(),
        summary: 'Empty molecule'
      };
    }

    // Calculate blast origin centroid
    let cx = 0, cy = 0, cz = 0;
    for (const a of atoms) {
      cx += a.position.x;
      cy += a.position.y;
      cz += a.position.z;
    }
    const blastOrigin: Vector3D = {
      x: cx / atoms.length,
      y: cy / atoms.length,
      z: cz / atoms.length
    };

    const initialEnergy = GeometryOptimizationEngine.calculatePotentialEnergy(graph);

    // 1. Break over-bonded/unstable bonds
    const bondsToRemove: string[] = [];
    for (const bond of graph.getAllBonds()) {
      const a1 = graph.getAtom(bond.atomA);
      const a2 = graph.getAtom(bond.atomB);

      // Overbonded hydrogens or excessive strained bonds break in explosion
      if ((a1 && a1.atomicNumber === 1 && graph.calculateValence(a1.id) > 1) ||
          (a2 && a2.atomicNumber === 1 && graph.calculateValence(a2.id) > 1)) {
        bondsToRemove.push(bond.id);
      }
    }

    for (const bId of bondsToRemove) {
      graph.removeBond(bId);
    }

    // 2. Re-auto-bond remaining fragments into stable configurations (e.g. H2 pairs)
    const intermediateMol = graph.toMolecule();
    const autoRes = AutoBondEngine.autoBondMolecule(intermediateMol, {
      toleranceRatio: 1.1,
      maxBondsPerAtom: true
    });

    const finalGraph = MolecularGraph.fromMolecule(autoRes.updatedMolecule);
    const finalEnergy = GeometryOptimizationEngine.calculatePotentialEnergy(finalGraph);

    const energyReleased = Math.max(120, Math.round((initialEnergy - finalEnergy + 250) * 10) / 10);

    // 3. Impart outward kinetic velocity impulse to atoms based on blast origin
    const fragmentVelocities = new Map<string, Vector3D>();
    const blastForce = Math.min(3.5, 1.2 + energyReleased / 200.0);

    for (const atom of finalGraph.getAllAtoms()) {
      const vecToAtom = subtract(atom.position, blastOrigin);
      const dist = Math.max(0.1, distance(atom.position, blastOrigin));
      const radialDir = dist > 0.05 ? normalize(vecToAtom) : { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 2 };

      const vel: Vector3D = {
        x: Math.round((radialDir.x * blastForce + (Math.random() - 0.5) * 0.5) * 100) / 100,
        y: Math.round((radialDir.y * blastForce + (Math.random() - 0.5) * 0.5) * 100) / 100,
        z: Math.round((radialDir.z * blastForce + (Math.random() - 0.5) * 0.5) * 100) / 100
      };

      fragmentVelocities.set(atom.id, vel);

      // Reposition atoms apart along blast vector into stable separation distance
      atom.position = {
        x: Math.round((atom.position.x + vel.x * 1.2) * 100) / 100,
        y: Math.round((atom.position.y + vel.y * 1.2) * 100) / 100,
        z: Math.round((atom.position.z + vel.z * 1.2) * 100) / 100
      };
    }

    // Final geometry relaxation of fragments into ground state
    const relaxed = GeometryOptimizationEngine.optimizeGeometry(finalGraph.toMolecule(), 40, 0.08);

    return {
      explodedMolecule: relaxed.optimizedMolecule,
      isExplosive: true,
      energyReleasedKj: energyReleased,
      blastOrigin,
      fragmentVelocities,
      summary: `Chemical Explosion! Dissociated into stable state products, releasing ${energyReleased} kJ/mol!`
    };
  }
}
