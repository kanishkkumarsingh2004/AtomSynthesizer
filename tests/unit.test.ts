import { ElementRepository } from '../domain/elements/ElementRepository';
import { MolecularGraph } from '../domain/molecular/MolecularGraph';
import { Atom } from '../domain/molecular/Atom';
import { Bond } from '../domain/molecular/Bond';
import { FormulaEngine } from '../chemistry/core/FormulaEngine';
import { ValenceEngine } from '../chemistry/core/ValenceEngine';
import { ChemistryEngine } from '../chemistry/core/ChemistryEngine';
import { AutoBondEngine } from '../chemistry/core/AutoBondEngine';
import { ReactionSimulationEngine } from '../chemistry/core/ReactionSimulationEngine';
import { AddAtomCommand } from '../application/commands/AddAtomCommand';
import { MoveAtomCommand } from '../application/commands/MoveAtomCommand';
import { DeleteAtomCommand } from '../application/commands/DeleteAtomCommand';
import { JsonExporter } from '../chemistry/exporters/JsonExporter';
import { JsonParser } from '../chemistry/parsers/JsonParser';
import { distance, angle, midpoint } from '../lib/math';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runTests() {
  console.log('🧪 Starting AtomSynthesizer Extended Unit Tests...\n');

  // Test 1: ElementRepository - All 118 elements
  console.log('1. Testing ElementRepository for 118 Elements...');
  const h = ElementRepository.getBySymbol('H');
  assert(h !== undefined && h.atomicNumber === 1, 'Hydrogen lookup');
  const fe = ElementRepository.getBySymbol('Fe');
  assert(fe !== undefined && fe.name === 'Iron', 'Iron lookup');
  const og = ElementRepository.getByAtomicNumber(118);
  assert(og !== undefined && og.symbol === 'Og' && og.name === 'Oganesson', 'Oganesson (118) lookup');
  assert(ElementRepository.getAll().length === 118, 'Total 118 elements available');
  console.log('  ✅ ElementRepository (118 elements) tests passed.');

  // Test 2: MolecularGraph & FormulaEngine
  console.log('2. Testing MolecularGraph & FormulaEngine...');
  const graph = new MolecularGraph('water_mol', 'Water');
  const atomO: Atom = { id: 'o1', atomicNumber: 8, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'water_mol' };
  const atomH1: Atom = { id: 'h1', atomicNumber: 1, position: { x: 0.96, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'water_mol' };
  const atomH2: Atom = { id: 'h2', atomicNumber: 1, position: { x: -0.24, y: 0.93, z: 0 }, formalCharge: 0, moleculeId: 'water_mol' };

  graph.addAtom(atomO);
  graph.addAtom(atomH1);
  graph.addAtom(atomH2);

  const formulaBeforeAuto = FormulaEngine.generateFormula(graph);
  assert(formulaBeforeAuto === 'H2O', 'Formula equals H2O');

  // Test 3: AutoBondEngine
  console.log('3. Testing AutoBondEngine (Proximity Bonding)...');
  const autoRes = AutoBondEngine.autoBondMolecule(graph.toMolecule(), { toleranceRatio: 1.3 });
  assert(autoRes.newBondsCount === 2, `AutoBondEngine detected 2 bonds for H2O geometry, got ${autoRes.newBondsCount}`);
  assert(autoRes.updatedMolecule.bonds.length === 2, 'Updated molecule has 2 bonds');
  console.log('  ✅ AutoBondEngine tests passed.');

  // Test 4: ReactionSimulationEngine
  console.log('4. Testing ReactionSimulationEngine...');
  const simRes = ReactionSimulationEngine.stepSimulation(graph.toMolecule(), 298.15, true);
  assert(simRes.updatedMolecule.atoms.length === 3, 'Simulation step preserves atom count');
  console.log('  ✅ ReactionSimulationEngine tests passed.');

  // Test 5: Serialization Roundtrip
  console.log('5. Testing Serialization Roundtrip...');
  const origMol = autoRes.updatedMolecule;
  const jsonStr = JsonExporter.exportMolecule(origMol);
  const parsedMol = JsonParser.parseMolecule(jsonStr);
  assert(parsedMol.id === origMol.id, 'Molecule ID matches in roundtrip');
  assert(parsedMol.atoms.length === origMol.atoms.length, 'Atom count matches');
  assert(parsedMol.bonds.length === origMol.bonds.length, 'Bond count matches');
  console.log('  ✅ Serialization tests passed.');

  console.log('\n🎉 ALL EXTENDED UNIT TESTS PASSED SUCCESSFULLY!');
}

runTests();
