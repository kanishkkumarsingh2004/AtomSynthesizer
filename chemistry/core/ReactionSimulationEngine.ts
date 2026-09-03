import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { AutoBondEngine } from './AutoBondEngine';
import { GeometryOptimizationEngine } from './GeometryOptimizationEngine';
import { QuantumEngine } from './QuantumEngine';
import { distance, subtract, normalize, add, scale } from '../../lib/math';

export interface ThermalVibrationAnalysis {
  vibrationalModesCount: number;
  thermalAmplitudeAngstrom: number;
  thermalStabilityBadge: 'THERMALLY STABLE' | 'THERMALLY EXCITED' | 'THERMAL DISSOCIATION RISK';
  temperatureCelsius: number;
  temperatureKelvin: number;
  description: string;
}

export class ReactionSimulationEngine {
  /**
   * Analyzes Molecular Vibrational Modes and Thermal Stability based on 3D Structure and Temperature
   */
  public static analyzeVibrationalThermalStability(
    graph: MolecularGraph,
    temperatureK = 298.15
  ): ThermalVibrationAnalysis {
    const atoms = graph.getAllAtoms();
    const numAtoms = atoms.length;
    const tempCelsius = Math.round((temperatureK - 273.15) * 10) / 10;

    if (numAtoms === 0) {
      return {
        vibrationalModesCount: 0,
        thermalAmplitudeAngstrom: 0,
        thermalStabilityBadge: 'THERMALLY STABLE',
        temperatureCelsius: tempCelsius,
        temperatureKelvin: temperatureK,
        description: 'Empty molecular system.'
      };
    }

    const pointGroup = QuantumEngine.determinePointGroup(graph);
    const isLinear = pointGroup.startsWith('D∞h') || pointGroup.startsWith('C∞v') || numAtoms <= 2;

    let modesCount = 0;
    if (numAtoms === 1) modesCount = 0;
    else if (numAtoms === 2) modesCount = 1;
    else modesCount = isLinear ? 3 * numAtoms - 5 : 3 * numAtoms - 6;

    const amplitude = Math.round(Math.sqrt(temperatureK / 298.15) * 0.012 * 1000) / 1000;

    let badge: 'THERMALLY STABLE' | 'THERMALLY EXCITED' | 'THERMAL DISSOCIATION RISK' = 'THERMALLY STABLE';
    let description = '';

    if (tempCelsius < -100) {
      badge = 'THERMALLY STABLE';
      description = `Cryogenic State (${tempCelsius} °C) — Frozen rigid lattice. Minimal zero-point quantum vibrational motion across ${modesCount} mode(s).`;
    } else if (tempCelsius <= 150) {
      badge = 'THERMALLY STABLE';
      description = `Ambient Equilibrium State (${tempCelsius} °C) — Stable harmonic ground-state vibrations across all ${modesCount} normal vibrational mode(s). RMS amplitude: ${amplitude} Å.`;
    } else if (tempCelsius <= 500) {
      badge = 'THERMALLY EXCITED';
      description = `High Thermal Excitation (${tempCelsius} °C) — Population of excited vibrational energy levels (v ≥ 1). Heightened bond stretching and angle bending. RMS amplitude: ${amplitude} Å.`;
    } else {
      badge = 'THERMAL DISSOCIATION RISK';
      description = `Extreme Thermal Pyrolysis (${tempCelsius} °C) — High kinetic energy (Ek > Ea). Anharmonic bond stretching near thermal decomposition barrier. Extreme vibrational amplitude: ${amplitude} Å.`;
    }

    return {
      vibrationalModesCount: modesCount,
      thermalAmplitudeAngstrom: amplitude,
      thermalStabilityBadge: badge,
      temperatureCelsius: tempCelsius,
      temperatureKelvin: temperatureK,
      description
    };
  }

  /**
   * Continuous live physics step: Enforces strict VSEPR stable bond distances & angles
   * every frame, with structure-dependent vibrational oscillations scaling with temperature.
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

    // 2. VSEPR geometry enforcement (3 iterations per frame for high performance live rendering)
    const optRes = GeometryOptimizationEngine.optimizeGeometry(currentMolecule, 3, 0.12);
    const graph = MolecularGraph.fromMolecule(optRes.optimizedMolecule);

    // 3. Structure-dependent vibrational oscillations (Stretching + Bending modes)
    const baseThermalAmplitude = Math.sqrt(temperatureK / 298.15) * 0.012;
    const t = Date.now() / 200.0;

    for (let i = 0; i < graph.getAllAtoms().length; i++) {
      const atom = graph.getAllAtoms()[i];
      const bonds = graph.getBondsForAtom(atom.id);

      if (bonds.length > 0) {
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

        const len = Math.sqrt(avgBondDirX * avgBondDirX + avgBondDirY * avgBondDirY + avgBondDirZ * avgBondDirZ);
        if (len > 0.001) {
          const nx = avgBondDirX / len;
          const ny = avgBondDirY / len;
          const nz = avgBondDirZ / len;

          const arbX = Math.abs(nx) < 0.9 ? 1 : 0;
          const arbY = Math.abs(nx) < 0.9 ? 0 : 1;
          const perpX = ny * 0 - nz * arbY;
          const perpY = nz * arbX - nx * 0;
          const perpZ = nx * arbY - ny * arbX;
          const perpLen = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ);

          if (perpLen > 0.001) {
            // Combine stretching harmonic oscillation (along bond) and bending oscillation (perpendicular)
            const phaseShift = i * 1.5;
            const stretchOsc = Math.sin(t * 3.0 + phaseShift) * baseThermalAmplitude * 0.5;
            const bendOsc = Math.cos(t * 2.0 + phaseShift) * baseThermalAmplitude * 0.8;

            const px = perpX / perpLen;
            const py = perpY / perpLen;
            const pz = perpZ / perpLen;

            atom.position = {
              x: Math.round((atom.position.x + nx * stretchOsc + px * bendOsc) * 10000) / 10000,
              y: Math.round((atom.position.y + ny * stretchOsc + py * bendOsc) * 10000) / 10000,
              z: Math.round((atom.position.z + nz * stretchOsc + pz * bendOsc) * 10000) / 10000
            };
          }
        }
      } else {
        // Free unbonded atoms execute 3D thermal Brownian motion
        const freeVibe = baseThermalAmplitude * 1.5;
        const phaseShift = i * 2.1;
        atom.position = {
          x: Math.round((atom.position.x + Math.sin(t * 2.5 + phaseShift) * freeVibe) * 10000) / 10000,
          y: Math.round((atom.position.y + Math.cos(t * 2.1 + phaseShift) * freeVibe) * 10000) / 10000,
          z: Math.round((atom.position.z + Math.sin(t * 1.8 + phaseShift) * freeVibe) * 10000) / 10000
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
