import { MolecularGraph } from '../domain/molecular/MolecularGraph';
import { ThermodynamicsEngine } from '../chemistry/core/ThermodynamicsEngine';
import { ReactionLogicEngine } from '../chemistry/core/ReactionLogicEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runThermodynamicsAndKineticsTests() {
  console.log('🧪 Starting Thermodynamics & Reaction Kinetics Unit Tests...\n');

  // Test 1: Thermodynamics Analysis (Water H2O)
  console.log('1. Testing ThermodynamicsEngine (Water H2O)...');
  const graphWater = new MolecularGraph('water', 'Water');
  graphWater.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'water' });
  graphWater.addAtom({ id: 'h1', atomicNumber: 1, position: { x: 1, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'water' });
  graphWater.addAtom({ id: 'h2', atomicNumber: 1, position: { x: 0, y: 1, z: 0 }, formalCharge: 0, moleculeId: 'water' });
  graphWater.addBond({ id: 'b1', atomA: 'o1', atomB: 'h1', order: 1, type: 'SINGLE' });
  graphWater.addBond({ id: 'b2', atomA: 'o1', atomB: 'h2', order: 1, type: 'SINGLE' });

  const thermoRes = ThermodynamicsEngine.analyzeThermodynamics(graphWater, 298.15);
  assert(thermoRes.entropyJPerMolK > 0, `Entropy calculated: ${thermoRes.entropyJPerMolK} J/(mol*K)`);
  assert(typeof thermoRes.gibbsFreeEnergyKjPerMol === 'number', `Gibbs free energy: ${thermoRes.gibbsFreeEnergyKjPerMol} kJ/mol`);
  assert(thermoRes.equilibriumConstantKeq > 0, `Equilibrium constant Keq: ${thermoRes.equilibriumConstantKeq}`);
  console.log('  ✅ ThermodynamicsEngine tests passed.');

  // Test 2: Reaction Kinetics & Arrhenius Rate Constant
  console.log('2. Testing ReactionLogicEngine (Arrhenius Kinetics)...');
  const rateK = ReactionLogicEngine.calculateArrheniusRate(50.0, 298.15);
  assert(rateK > 0, `Arrhenius rate constant k calculated: ${rateK} s^-1`);

  const kineticsRes = ReactionLogicEngine.analyzeReactionKinetics(graphWater, 298.15);
  assert(kineticsRes.activationEnergyKjPerMol > 0, `Activation energy Ea: ${kineticsRes.activationEnergyKjPerMol} kJ/mol`);
  console.log('  ✅ ReactionLogicEngine tests passed.');

  console.log('\n🎉 ALL THERMODYNAMICS & REACTION KINETICS TESTS PASSED SUCCESSFULLY!');
}

runThermodynamicsAndKineticsTests();
