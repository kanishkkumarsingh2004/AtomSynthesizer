import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { ThermodynamicsEngine } from './ThermodynamicsEngine';

export type ReactionMechanismType =
  | 'COMBUSTION'
  | 'HYDROGENATION'
  | 'ACID_BASE'
  | 'THERMAL_DISSOCIATION'
  | 'NUCLEOPHILIC_SUBSTITUTION'
  | 'NONE';

export interface ReactionAnalysis {
  mechanism: ReactionMechanismType;
  activationEnergyKjPerMol: number; // Ea in kJ/mol
  rateConstantK: number;            // Arrhenius rate constant k in s^-1
  temperatureK: number;             // Temperature in K
  heatOfReactionKj: number;        // ΔH_rxn in kJ/mol
  isFeasible: boolean;              // Rate k > threshold at current T
  description: string;
}

export class ReactionLogicEngine {
  /**
   * Calculates Arrhenius Reaction Rate Constant k = A * exp(-Ea / (R * T))
   */
  public static calculateArrheniusRate(
    activationEnergyKj: number,
    temperatureK = 298.15,
    preExponentialA = 1e11
  ): number {
    const R_kJ = 0.008314; // kJ/(mol·K)
    const exponent = -activationEnergyKj / (R_kJ * temperatureK);
    const k = preExponentialA * Math.exp(exponent);
    return Math.round(k * 10000) / 10000;
  }

  /**
   * Analyzes chemical reaction feasibility and kinetics for the current molecular graph
   */
  public static analyzeReactionKinetics(
    graph: MolecularGraph,
    temperatureK = 298.15
  ): ReactionAnalysis {
    const atoms = graph.getAllAtoms();
    const bonds = graph.getAllBonds();

    let hasCarbon = false;
    let hasHydrogen = false;
    let hasOxygen = false;

    for (const a of atoms) {
      if (a.atomicNumber === 6) hasCarbon = true;
      if (a.atomicNumber === 1) hasHydrogen = true;
      if (a.atomicNumber === 8) hasOxygen = true;
    }

    const hasDoubleOrTripleBonds = bonds.some((b) => b.order >= 2);

    let mechanism: ReactionMechanismType = 'NONE';
    let Ea = 120.0; // Default activation energy in kJ/mol
    let heatOfReaction = 0;
    let description = 'Thermally stable molecular system';

    // 1. Organic Combustion Mechanism (C + H + O2)
    if (hasCarbon && hasHydrogen && hasOxygen) {
      mechanism = 'COMBUSTION';
      Ea = 85.0; // kJ/mol
      heatOfReaction = -890.0; // Highly exothermic
      description = 'Highly exothermic combustion reaction pathway (C, H, O system)';
    }
    // 2. Addition / Hydrogenation (Double/Triple bonds + H)
    else if (hasDoubleOrTripleBonds && hasHydrogen) {
      mechanism = 'HYDROGENATION';
      Ea = 65.0; // kJ/mol
      heatOfReaction = -137.0; // Exothermic addition
      description = 'Electrophilic addition / hydrogenation reaction pathway';
    }
    // 3. Thermal Dissociation / Cracking (High temperature T > 500 K)
    else if (temperatureK > 500.0) {
      mechanism = 'THERMAL_DISSOCIATION';
      Ea = 150.0; // kJ/mol
      heatOfReaction = 220.0; // Endothermic thermal cracking
      description = 'High-temperature thermal dissociation and bond cracking pathway';
    }

    const rateConstantK = this.calculateArrheniusRate(Ea, temperatureK);
    const isFeasible = rateConstantK > 1e-6;

    return {
      mechanism,
      activationEnergyKjPerMol: Ea,
      rateConstantK,
      temperatureK,
      heatOfReactionKj: heatOfReaction,
      isFeasible,
      description
    };
  }
}
