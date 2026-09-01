import { ElementRepository } from '../domain/elements/ElementRepository';
import { MolecularGraph } from '../domain/molecular/MolecularGraph';
import { Atom } from '../domain/molecular/Atom';
import { Bond } from '../domain/molecular/Bond';
import { FormulaEngine } from '../chemistry/core/FormulaEngine';
import { NomenclatureEngine } from '../chemistry/core/NomenclatureEngine';
import { QuantumEngine } from '../chemistry/core/QuantumEngine';
import { ChemistryEngine } from '../chemistry/core/ChemistryEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runQuantumAndNomenclatureTests() {
  console.log('🧪 Starting Quantum Mechanics & Nomenclature Unit Tests...\n');

  // Test 1: IUPAC Nomenclature
  console.log('1. Testing NomenclatureEngine (IUPAC naming)...');
  const graphWater = new MolecularGraph('water', 'Water');
  graphWater.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'water' });
  graphWater.addAtom({ id: 'h1', atomicNumber: 1, position: { x: 1, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'water' });
  graphWater.addAtom({ id: 'h2', atomicNumber: 1, position: { x: 0, y: 1, z: 0 }, formalCharge: 0, moleculeId: 'water' });
  graphWater.addBond({ id: 'b1', atomA: 'o1', atomB: 'h1', order: 1, type: 'SINGLE' });
  graphWater.addBond({ id: 'b2', atomA: 'o1', atomB: 'h2', order: 1, type: 'SINGLE' });

  const waterName = NomenclatureEngine.generateIUPACName(graphWater);
  assert(waterName === 'Water (Oxidane)', `Water name should be 'Water (Oxidane)', got: ${waterName}`);

  // Test Ethane / Ethene
  const graphEthene = new MolecularGraph('ethene', 'Ethene');
  graphEthene.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'ethene' });
  graphEthene.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 1.34, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'ethene' });
  graphEthene.addBond({ id: 'b1', atomA: 'c1', atomB: 'c2', order: 2, type: 'DOUBLE' });

  const etheneName = NomenclatureEngine.generateIUPACName(graphEthene);
  assert(etheneName === 'Ethene', `Ethene name should be 'Ethene', got: ${etheneName}`);
  console.log('  ✅ NomenclatureEngine tests passed.');

  // Test 2: Quantum Engine (Hückel MO & Dipole)
  console.log('2. Testing QuantumEngine (Hückel MO & Dipole Moment)...');
  const qRes = QuantumEngine.analyzeQuantumMechanics(graphEthene);
  assert(qRes.hasConjugation === true, 'Ethene double bond triggers conjugated pi system');
  assert(qRes.orbitals.length === 2, 'Ethene has 2 pi orbitals (bonding & antibonding)');
  assert(qRes.homoIndex === 0, 'HOMO index is 0');
  assert(qRes.lumoIndex === 1, 'LUMO index is 1');
  assert(qRes.homoLumoGapEV !== null && qRes.homoLumoGapEV > 0, `HOMO-LUMO gap calculated: ${qRes.homoLumoGapEV} eV`);
  console.log('  ✅ QuantumEngine tests passed.');

  console.log('\n🎉 ALL QUANTUM & NOMENCLATURE TESTS PASSED SUCCESSFULLY!');
}

runQuantumAndNomenclatureTests();
