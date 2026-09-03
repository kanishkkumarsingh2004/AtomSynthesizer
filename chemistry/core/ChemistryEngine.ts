import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { FormulaEngine } from './FormulaEngine';
import { ValenceEngine } from './ValenceEngine';
import { NomenclatureEngine } from './NomenclatureEngine';
import { QuantumEngine, QuantumAnalysisResult } from './QuantumEngine';
import { ThermodynamicsEngine, ThermodynamicsResult } from './ThermodynamicsEngine';
import { ReactionLogicEngine, ReactionAnalysis } from './ReactionLogicEngine';
import { ReactionSimulationEngine, ThermalVibrationAnalysis } from './ReactionSimulationEngine';
import { QcdEngine, QcdThermodynamicsResult } from './QcdEngine';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { ValidationResult, ValidationIssue } from '../../domain/validation/ValidationResult';

export interface MolecularAnalysis {
  formula: string;
  iupacName: string;
  molecularWeight: number; // in g/mol
  atomCount: number;
  bondCount: number;
  heavyAtomCount: number;
  totalCharge: number;
  connectedComponentsCount: number;
  quantum: QuantumAnalysisResult;
  thermodynamics: ThermodynamicsResult;
  kinetics: ReactionAnalysis;
  vibrationalThermal: ThermalVibrationAnalysis;
  qcd: QcdThermodynamicsResult;
}

export class ChemistryEngine {
  public static validateMolecule(molecule: Molecule): ValidationResult {
    const graph = MolecularGraph.fromMolecule(molecule);
    const issues: ValidationIssue[] = [];

    // Level 1: Graph integrity checks
    for (const bond of molecule.bonds) {
      if (!graph.getAtom(bond.atomA) || !graph.getAtom(bond.atomB)) {
        issues.push({
          severity: 'ERROR',
          code: 'BROKEN_BOND_REFERENCE',
          message: `Bond ${bond.id} references atom that does not exist.`,
          bondIds: [bond.id]
        });
      }
    }

    // Level 2: Valence checks
    const valenceIssues = ValenceEngine.validateValence(graph);
    issues.push(...valenceIssues);

    const hasErrors = issues.some((issue) => issue.severity === 'ERROR');

    return {
      valid: !hasErrors,
      issues
    };
  }

  public static generateFormula(molecule: Molecule): string {
    const graph = MolecularGraph.fromMolecule(molecule);
    return FormulaEngine.generateFormula(graph);
  }

  public static generateIUPACName(molecule: Molecule): string {
    const graph = MolecularGraph.fromMolecule(molecule);
    return NomenclatureEngine.generateIUPACName(graph);
  }

  public static analyzeMolecule(molecule: Molecule, temperatureK = 298.15): MolecularAnalysis {
    const graph = MolecularGraph.fromMolecule(molecule);
    let mw = 0;
    let heavyAtoms = 0;

    for (const atom of molecule.atoms) {
      const elDef = ElementRepository.getByAtomicNumber(atom.atomicNumber);
      if (elDef) {
        mw += elDef.atomicMass;
        if (atom.atomicNumber > 1) {
          heavyAtoms++;
        }
      }
    }

    const quantum = QuantumEngine.analyzeQuantumMechanics(graph, temperatureK);
    const thermodynamics = ThermodynamicsEngine.analyzeThermodynamics(graph, temperatureK);
    const kinetics = ReactionLogicEngine.analyzeReactionKinetics(graph, temperatureK);
    const vibrationalThermal = ReactionSimulationEngine.analyzeVibrationalThermalStability(graph, temperatureK);
    const qcd = QcdEngine.analyzeQcdThermodynamics(graph, temperatureK);

    return {
      formula: FormulaEngine.generateFormula(graph),
      iupacName: NomenclatureEngine.generateIUPACName(graph),
      molecularWeight: Math.round(mw * 1000) / 1000,
      atomCount: molecule.atoms.length,
      bondCount: molecule.bonds.length,
      heavyAtomCount: heavyAtoms,
      totalCharge: graph.calculateTotalCharge(),
      connectedComponentsCount: graph.getConnectedComponents().length,
      quantum,
      thermodynamics,
      kinetics,
      vibrationalThermal,
      qcd
    };
  }
}
