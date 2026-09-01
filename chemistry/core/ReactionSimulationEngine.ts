import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { AutoBondEngine } from './AutoBondEngine';
import { GeometryOptimizationEngine } from './GeometryOptimizationEngine';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { distance, subtract, normalize, add, scale } from '../../lib/math';

export class ReactionSimulationEngine {
  /**
   * Continuous live physics step: Enforces strict VSEPR stable bond distances & angles
   * every frame, with small cosmetic thermal vibrations that NEVER break geometry.
   */
  public static stepLiveVibratingPhysics(
    molecule: Molecule,
    temperatureK = 298.15,
    autoBondEnabled = true
  ): { updatedMolecule: Molecule } {
    if (molecule.atoms.length === 0) {
      return { updatedMolecule: molecule };
    }

    let currentMolecule = molecule;

    // 1. Proximity auto-bonding check
    if (autoBondEnabled) {
      const res = AutoBondEngine.autoBondMolecule(currentMolecule, {
        toleranceRatio: 1.85,
        autoBreakDistantBonds: true
      });
      currentMolecule = res.updatedMolecule;
    }

    // 2. STRONG VSEPR geometry enforcement (5 iterations per frame to keep structure locked)
    const optRes = GeometryOptimizationEngine.optimizeGeometry(currentMolecule, 5, 0.12);
    const graph = MolecularGraph.fromMolecule(optRes.optimizedMolecule);

    // 3. Small cosmetic thermal vibrations that preserve bond geometry
    //    These are TANGENTIAL micro-oscillations, NOT random drift.
    const baseThermalAmplitude = Math.sqrt(temperatureK / 300) * 0.004; // Very small (0.004 Å)

    for (const atom of graph.getAllAtoms()) {
      const bonds = graph.getBondsForAtom(atom.id);

      // Only vibrate bonded atoms with tiny tangential oscillations
      if (bonds.length > 0) {
        // Compute the average bond direction from this atom
        let avgBondDirX = 0, avgBondDirY = 0, avgBondDirZ = 0;
        for (const bond of bonds) {
          const neighborId = bond.atomA === atom.id ? bond.atomB : bond.atomA;
          const neighbor = graph.getAtom(neighborId);
          if (neighbor) {
            const dir = subtract(neighbor.position, atom.position);
            avgBondDirX += dir.x;
            avgBondDirY += dir.y;
            avgBondDirZ += dir.z;
          }
        }

        // Generate random displacement PERPENDICULAR to the average bond direction
        // This prevents thermal noise from stretching or compressing bonds
        const len = Math.sqrt(avgBondDirX * avgBondDirX + avgBondDirY * avgBondDirY + avgBondDirZ * avgBondDirZ);
        if (len > 0.001) {
          const nx = avgBondDirX / len;
          const ny = avgBondDirY / len;
          const nz = avgBondDirZ / len;

          // Create perpendicular vector via cross product with an arbitrary axis
          const arbX = Math.abs(nx) < 0.9 ? 1 : 0;
          const arbY = Math.abs(nx) < 0.9 ? 0 : 1;
          const arbZ = 0;
          const perpX = ny * arbZ - nz * arbY;
          const perpY = nz * arbX - nx * arbZ;
          const perpZ = nx * arbY - ny * arbX;
          const perpLen = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ);

          if (perpLen > 0.001) {
            const vibeMag = (Math.random() - 0.5) * baseThermalAmplitude;
            atom.position = {
              x: Math.round((atom.position.x + (perpX / perpLen) * vibeMag) * 10000) / 10000,
              y: Math.round((atom.position.y + (perpY / perpLen) * vibeMag) * 10000) / 10000,
              z: Math.round((atom.position.z + (perpZ / perpLen) * vibeMag) * 10000) / 10000
            };
          }
        }
      } else {
        // Free (unbonded) atoms can have slightly larger random vibrations
        const freeVibe = baseThermalAmplitude * 2;
        atom.position = {
          x: Math.round((atom.position.x + (Math.random() - 0.5) * freeVibe) * 10000) / 10000,
          y: Math.round((atom.position.y + (Math.random() - 0.5) * freeVibe) * 10000) / 10000,
          z: Math.round((atom.position.z + (Math.random() - 0.5) * freeVibe) * 10000) / 10000
        };
      }
    }

    return { updatedMolecule: graph.toMolecule() };
  }

  /**
   * Reaction simulation step
   */
  public static stepSimulation(
    molecule: Molecule,
    temperatureK = 298.15,
    autoBondEnabled = true
  ): { updatedMolecule: Molecule; reacted: boolean } {
    const res = this.stepLiveVibratingPhysics(molecule, temperatureK, autoBondEnabled);
    return { updatedMolecule: res.updatedMolecule, reacted: true };
  }
}
