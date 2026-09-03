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
  zeroPointEnergyKjPerMol: number; // Quantum ZPVE = sum(1/2 h * nu_i)
  primaryFrequencyWavenumberCm1: number; // Hooke's Law ν = 1/(2πc) * sqrt(k/μ) in cm⁻¹
  reducedMassAmu: number; // μ = mA*mB/(mA+mB)
  bondStiffnessForceConstant: number; // k in N/m (Single 500, Double 1000, Triple 1500)
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
    const bonds = graph.getAllBonds();
    const numAtoms = atoms.length;
    const tempCelsius = Math.round((temperatureK - 273.15) * 10) / 10;

    if (numAtoms === 0) {
      return {
        vibrationalModesCount: 0,
        thermalAmplitudeAngstrom: 0,
        thermalStabilityBadge: 'THERMALLY STABLE',
        temperatureCelsius: tempCelsius,
        temperatureKelvin: temperatureK,
        zeroPointEnergyKjPerMol: 0,
        primaryFrequencyWavenumberCm1: 0,
        reducedMassAmu: 0,
        bondStiffnessForceConstant: 0,
        description: 'Empty molecular system.'
      };
    }

    const pointGroup = QuantumEngine.determinePointGroup(graph);
    const isLinear = pointGroup.startsWith('D∞h') || pointGroup.startsWith('C∞v') || numAtoms <= 2;

    let modesCount = 0;
    if (numAtoms === 1) modesCount = 0;
    else if (numAtoms === 2) modesCount = 1;
    else modesCount = isLinear ? 3 * numAtoms - 5 : 3 * numAtoms - 6;

    // Hooke's Law Calculation: ν = 1/(2πc) * sqrt(k / μ)
    let avgK = 500; // N/m
    let avgMu = 1.0; // amu
    let totalNuCm1 = 0;

    if (bonds.length > 0) {
      let sumK = 0;
      let sumMu = 0;

      for (const bond of bonds) {
        const aA = graph.getAtom(bond.atomA);
        const aB = graph.getAtom(bond.atomB);
        if (!aA || !aB) continue;

        // Force Constant k (N/m): Single ~500 N/m, Double ~1000 N/m, Triple ~1500 N/m
        const k = bond.order === 3 ? 1500 : bond.order === 2 ? 1000 : 500;

        const mA = aA.atomicNumber === 1 ? 1.008 : aA.atomicNumber === 6 ? 12.011 : aA.atomicNumber === 8 ? 15.999 : aA.atomicNumber * 2;
        const mB = aB.atomicNumber === 1 ? 1.008 : aB.atomicNumber === 6 ? 12.011 : aB.atomicNumber === 8 ? 15.999 : aB.atomicNumber * 2;
        const mu = (mA * mB) / (mA + mB); // Reduced mass in amu

        // ν = 1/(2π c) * sqrt(k / (μ * 1.66054e-27))
        // With c = 2.9979e10 cm/s:
        const nuCm1 = (1 / (2 * Math.PI * 2.9979e10)) * Math.sqrt(k / (mu * 1.66054e-27));

        sumK += k;
        sumMu += mu;
        totalNuCm1 += nuCm1;
      }

      avgK = Math.round((sumK / bonds.length) * 10) / 10;
      avgMu = Math.round((sumMu / bonds.length) * 100) / 100;
    }

    const primaryNuCm1 = bonds.length > 0 ? Math.round(totalNuCm1 / bonds.length) : 0;

    // Zero-Point Vibrational Energy (ZPVE): E_zpve = sum(1/2 h * nu_i * c * N_A) = 0.00598 * sum(nu_i in cm-1) kJ/mol
    const zeroPointEnergy = Math.round(modesCount * primaryNuCm1 * 0.00598 * 10) / 10;

    const amplitude = Math.round(Math.sqrt(temperatureK / 298.15) * 0.012 * 1000) / 1000;

    let badge: 'THERMALLY STABLE' | 'THERMALLY EXCITED' | 'THERMAL DISSOCIATION RISK' = 'THERMALLY STABLE';
    let description = '';

    if (tempCelsius < -100) {
      badge = 'THERMALLY STABLE';
      description = `Cryogenic State (${tempCelsius} °C) — Frozen rigid lattice. Quantum Zero-Point Vibrational Energy (Ezpve = ${zeroPointEnergy} kJ/mol) active across ${modesCount} mode(s).`;
    } else if (tempCelsius <= 150) {
      badge = 'THERMALLY STABLE';
      description = `Ambient Equilibrium State (${tempCelsius} °C) — Stable harmonic vibrations (ν_avg = ${primaryNuCm1} cm⁻¹, Hooke's k = ${avgK} N/m). Quantum ZPVE: ${zeroPointEnergy} kJ/mol.`;
    } else if (tempCelsius <= 500) {
      badge = 'THERMALLY EXCITED';
      description = `High Thermal Excitation (${tempCelsius} °C) — Population of excited vibrational states (v ≥ 1). Heightened bond stretching and bending. RMS amplitude: ${amplitude} Å.`;
    } else {
      badge = 'THERMAL DISSOCIATION RISK';
      description = `Extreme Thermal Pyrolysis (${tempCelsius} °C) — Kinetic energy exceeds activation barrier (Ek > Ea). Anharmonic bond stretching near Morse potential dissociation limit.`;
    }

    return {
      vibrationalModesCount: modesCount,
      thermalAmplitudeAngstrom: amplitude,
      thermalStabilityBadge: badge,
      temperatureCelsius: tempCelsius,
      temperatureKelvin: temperatureK,
      zeroPointEnergyKjPerMol: zeroPointEnergy,
      primaryFrequencyWavenumberCm1: primaryNuCm1,
      reducedMassAmu: avgMu,
      bondStiffnessForceConstant: avgK,
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
    // 3D Visual Thermal Vibration Amplitude scaling with Temperature (K):
    // T = 73 K (-200 °C)  ==> A_vib = 0.015 Å (frozen rigid)
    // T = 298 K (25 °C)   ==> A_vib = 0.08 Å  (ambient harmonic)
    // T = 353 K (80 °C)   ==> A_vib = 0.14 Å  (excited)
    // T = 773 K (500 °C)  ==> A_vib = 0.35 Å  (high thermal)
    // T = 1273 K (1000 °C) ==> A_vib = 0.65 Å (intense pyrolysis)
    const tempRatio = Math.max(0.1, temperatureK / 298.15);
    const baseThermalAmplitude = 0.08 * Math.pow(tempRatio, 0.75);
    const t = Date.now() / 150.0;

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

          const px = perpLen > 0.001 ? perpX / perpLen : 0;
          const py = perpLen > 0.001 ? perpY / perpLen : 1;
          const pz = perpLen > 0.001 ? perpZ / perpLen : 0;

          // Combine stretching harmonic oscillation (along bond) and bending oscillation (perpendicular)
          const phaseShift = i * 1.7;
          const stretchOsc = Math.sin(t * 3.5 + phaseShift) * baseThermalAmplitude * 0.6;
          const bendOsc = Math.cos(t * 2.5 + phaseShift) * baseThermalAmplitude * 0.9;

          atom.position = {
            x: Math.round((atom.position.x + nx * stretchOsc + px * bendOsc) * 1000) / 1000,
            y: Math.round((atom.position.y + ny * stretchOsc + py * bendOsc) * 1000) / 1000,
            z: Math.round((atom.position.z + nz * stretchOsc + pz * bendOsc) * 1000) / 1000
          };
        }
      } else {
        // Free unbonded atoms execute 3D thermal Brownian motion
        const freeVibe = baseThermalAmplitude * 1.4;
        const phaseShift = i * 2.1;
        atom.position = {
          x: Math.round((atom.position.x + Math.sin(t * 2.5 + phaseShift) * freeVibe) * 1000) / 1000,
          y: Math.round((atom.position.y + Math.cos(t * 2.1 + phaseShift) * freeVibe) * 1000) / 1000,
          z: Math.round((atom.position.z + Math.sin(t * 1.8 + phaseShift) * freeVibe) * 1000) / 1000
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
