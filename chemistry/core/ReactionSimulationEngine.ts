import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { AutoBondEngine } from './AutoBondEngine';
import { GeometryOptimizationEngine } from './GeometryOptimizationEngine';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { distance } from '../../lib/math';

export class ReactionSimulationEngine {
  /**
   * Continuous live physics step: Combines VSEPR geometry alignment, thermal vibrations,
   * and live proximity auto-bonding every frame in real-time!
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

    // 1. Proximity auto-bonding check with generous threshold (up to 2.4 Å)
    if (autoBondEnabled) {
      const res = AutoBondEngine.autoBondMolecule(currentMolecule, {
        toleranceRatio: 1.85,
        autoBreakDistantBonds: true
      });
      currentMolecule = res.updatedMolecule;
    }

    // 2. Single iteration of VSEPR geometry relaxation (pulls atoms toward r0 and aligns VSEPR bond angles)
    const optRes = GeometryOptimizationEngine.optimizeGeometry(currentMolecule, 1, 0.05);
    const graph = MolecularGraph.fromMolecule(optRes.optimizedMolecule);

    const baseThermalAmplitude = Math.sqrt(temperatureK / 300) * 0.01; // Ångströms

    // 3. Add realistic thermal harmonic vibrations (higher energy/strained bonds vibrate with larger amplitude!)
    for (const atom of graph.getAllAtoms()) {
      const bonds = graph.getBondsForAtom(atom.id);
      let strainEnergyFactor = 1.0;

      // Calculate bond strain factor for thermal vibration amplitude
      for (const bond of bonds) {
        const neighborId = bond.atomA === atom.id ? bond.atomB : bond.atomA;
        const neighbor = graph.getAtom(neighborId);
        if (neighbor) {
          const elA = ElementRepository.getByAtomicNumber(atom.atomicNumber);
          const elB = ElementRepository.getByAtomicNumber(neighbor.atomicNumber);
          const r0 = (elA?.covalentRadius ?? 0.8) + (elB?.covalentRadius ?? 0.8);
          const dist = distance(atom.position, neighbor.position);
          const bondStrain = Math.abs(dist - r0);

          if (bondStrain > 0.1) {
            strainEnergyFactor += bondStrain * 3.5; // strained/unstable bonds vibrate wider!
          }
        }
      }

      // Hydrogen or unbonded free atoms have higher mobility
      if (atom.atomicNumber === 1 || bonds.length === 0) {
        strainEnergyFactor *= 1.3;
      }

      const vibeX = (Math.random() - 0.5) * baseThermalAmplitude * strainEnergyFactor;
      const vibeY = (Math.random() - 0.5) * baseThermalAmplitude * strainEnergyFactor;
      const vibeZ = (Math.random() - 0.5) * baseThermalAmplitude * strainEnergyFactor;

      atom.position = {
        x: Math.round((atom.position.x + vibeX) * 1000) / 1000,
        y: Math.round((atom.position.y + vibeY) * 1000) / 1000,
        z: Math.round((atom.position.z + vibeZ) * 1000) / 1000
      };
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
