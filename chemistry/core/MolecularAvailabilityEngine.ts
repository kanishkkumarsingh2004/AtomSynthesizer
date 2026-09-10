import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ThermodynamicsEngine } from './ThermodynamicsEngine';
import { QuantumEngine } from './QuantumEngine';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export interface MolecularAvailabilityResult {
  moleculeName: string;
  formula: string;
  stabilityScore: number; // 0 to 100
  stabilityRating: 'STABLE' | 'METASTABLE' | 'REACTIVE' | 'EXPLOSIVE / DISSOCIATING';
  availabilityCategory: 'HIGHLY AVAILABLE (Earth/Atmosphere)' | 'SYNTHETIC / LABORATORY ONLY' | 'UNSTABLE / TRANSIENT';
  formationEnthalpyKJPerMol: number;
  gibbsFreeEnergyKJPerMol: number;
  bindingEnergyKJPerMol: number;
  redoxReactivity: string;
  preferredPathways: string[];
}

export class MolecularAvailabilityEngine {
  /**
   * Predict 3D spatial molecular availability, formation energetics, and stability classification
   */
  public static predictAvailability(molecule: Molecule, temperatureK = 298.15): MolecularAvailabilityResult {
    const formula = molecule.atoms.length > 0
      ? molecule.atoms.map((a) => ElementRepository.getByAtomicNumber(a.atomicNumber)?.symbol || 'X').sort().join('')
      : 'Empty';

    if (molecule.atoms.length === 0) {
      return {
        moleculeName: molecule.name || 'Empty',
        formula: 'Empty',
        stabilityScore: 0,
        stabilityRating: 'EXPLOSIVE / DISSOCIATING',
        availabilityCategory: 'UNSTABLE / TRANSIENT',
        formationEnthalpyKJPerMol: 0,
        gibbsFreeEnergyKJPerMol: 0,
        bindingEnergyKJPerMol: 0,
        redoxReactivity: 'N/A',
        preferredPathways: []
      };
    }

    // 1. Calculate thermodynamics
    const graph = MolecularGraph.fromMolecule(molecule);
    const thermo = ThermodynamicsEngine.analyzeThermodynamics(graph, temperatureK);
    const deltaH = thermo.enthalpyKjPerMol;
    const deltaG = thermo.gibbsFreeEnergyKjPerMol;

    // 2. Quantum Engine for dipole & HOMO-LUMO gap
    const quantum = QuantumEngine.analyzeQuantumMechanics(graph, temperatureK);

    // 3. Compute binding energy
    let totalBondEnergy = 0;
    for (const bond of molecule.bonds) {
      totalBondEnergy += bond.order * 415; // Average bond energy ~415 kJ/mol per bond order unit
    }
    const bindingEnergy = Math.round(totalBondEnergy);

    // 4. Evaluate stability score (0..100)
    let stabilityScore = 85;
    if (deltaH > 50) stabilityScore -= 20;
    if (deltaH > 200) stabilityScore -= 30;
    if (quantum.homoLumoGapEV && quantum.homoLumoGapEV < 2.0) stabilityScore -= 25;
    if (molecule.atoms.length === 1) stabilityScore = 70; // Monatomic free radical

    stabilityScore = Math.max(5, Math.min(100, stabilityScore));

    let stabilityRating: 'STABLE' | 'METASTABLE' | 'REACTIVE' | 'EXPLOSIVE / DISSOCIATING' = 'STABLE';
    if (stabilityScore < 30) {
      stabilityRating = 'EXPLOSIVE / DISSOCIATING';
    } else if (stabilityScore < 55) {
      stabilityRating = 'REACTIVE';
    } else if (stabilityScore < 75) {
      stabilityRating = 'METASTABLE';
    }

    // 5. Predict Availability Category
    let availabilityCategory: 'HIGHLY AVAILABLE (Earth/Atmosphere)' | 'SYNTHETIC / LABORATORY ONLY' | 'UNSTABLE / TRANSIENT' = 'HIGHLY AVAILABLE (Earth/Atmosphere)';
    if (stabilityRating === 'EXPLOSIVE / DISSOCIATING' || stabilityRating === 'REACTIVE') {
      availabilityCategory = 'UNSTABLE / TRANSIENT';
    } else if (molecule.atoms.length > 20 || deltaH > 100) {
      availabilityCategory = 'SYNTHETIC / LABORATORY ONLY';
    }

    // 6. Predict Redox Reactivity & Pathways
    const hasMetals = molecule.atoms.some((a) => {
      const el = ElementRepository.getByAtomicNumber(a.atomicNumber);
      return el && ['alkali-metal', 'alkaline-earth', 'transition-metal'].includes(el.category);
    });

    const redoxReactivity = hasMetals
      ? 'Susceptible to single-replacement & metallic oxidation in aqueous media'
      : 'Covalent covalent-shell interaction with electrophilic/nucleophilic pathways';

    const preferredPathways: string[] = [];
    if (hasMetals) preferredPathways.push('Metal Oxidation / Displacement');
    if (molecule.bonds.some((b) => b.order > 1)) preferredPathways.push('Electrophilic Addition across π-bonds');
    if (deltaH > 0) preferredPathways.push('Exothermic Thermal Dissociation');
    if (preferredPathways.length === 0) preferredPathways.push('Substitutive Free Radical Cleavage');

    return {
      moleculeName: molecule.name || 'Molecule',
      formula,
      stabilityScore,
      stabilityRating,
      availabilityCategory,
      formationEnthalpyKJPerMol: Math.round(deltaH),
      gibbsFreeEnergyKJPerMol: Math.round(deltaG),
      bindingEnergyKJPerMol: bindingEnergy,
      redoxReactivity,
      preferredPathways
    };
  }
}
