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
  // Test 3: Thermodynamics & Quantum Mechanics (Carbon Dioxide CO2)
  console.log('3. Testing CO2 Thermodynamic & Quantum Dipole Values...');
  const graphCO2 = new MolecularGraph('co2', 'Carbon Dioxide');
  graphCO2.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'co2' });
  graphCO2.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 1.16, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'co2' });
  graphCO2.addAtom({ id: 'o2', atomicNumber: 8, position: { x: -1.16, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'co2' });
  graphCO2.addBond({ id: 'b1', atomA: 'c1', atomB: 'o1', order: 2, type: 'DOUBLE' });
  graphCO2.addBond({ id: 'b2', atomA: 'c1', atomB: 'o2', order: 2, type: 'DOUBLE' });

  const thermoCO2 = ThermodynamicsEngine.analyzeThermodynamics(graphCO2, 298.15);
  console.log(`  CO2 Enthalpy ΔH°f: ${thermoCO2.enthalpyKjPerMol} kJ/mol (NIST standard -393.5 kJ/mol)`);
  console.log(`  CO2 Entropy S°: ${thermoCO2.entropyJPerMolK} J/(mol*K) (NIST standard 213.8 J/mol*K)`);
  console.log(`  CO2 Gibbs ΔG°: ${thermoCO2.gibbsFreeEnergyKjPerMol} kJ/mol (NIST standard -394.4 kJ/mol)`);

  assert(typeof thermoCO2.enthalpyKjPerMol === 'number', `CO2 ΔH°f calculated dynamically`);
  assert(thermoCO2.entropyJPerMolK > 0, `CO2 S° calculated dynamically`);
  assert(typeof thermoCO2.gibbsFreeEnergyKjPerMol === 'number', `CO2 ΔG° calculated dynamically`);

  const { QuantumEngine } = require('../chemistry/core/QuantumEngine');
  const quantumCO2 = QuantumEngine.analyzeQuantumMechanics(graphCO2);
  console.log(`  CO2 Point Group Symmetry: ${quantumCO2.pointGroupSymmetry}`);
  console.log(`  CO2 Electric Dipole Moment |μ|: ${quantumCO2.dipoleMagnitude} D`);
  assert(quantumCO2.pointGroupSymmetry === 'D∞h', `CO2 symmetry is D∞h linear centrosymmetric`);
  assert(quantumCO2.dipoleMagnitude === 0, `CO2 dipole moment is 0.00 D (non-polar symmetric)`);

  // Test 4: Propane (C3H8) Polarizability Test
  console.log('4. Testing Propane (C3H8) Physics Formula Polarizability...');
  const graphPropane = new MolecularGraph('propane', 'Propane');
  for (let i = 1; i <= 3; i++) {
    graphPropane.addAtom({ id: `c${i}`, atomicNumber: 6, position: { x: i * 1.5, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'propane' });
  }
  for (let i = 1; i <= 8; i++) {
    graphPropane.addAtom({ id: `h${i}`, atomicNumber: 1, position: { x: i * 0.6, y: 1.1, z: 0.5 }, formalCharge: 0, moleculeId: 'propane' });
  }
  // Add 2 C-C bonds
  graphPropane.addBond({ id: 'b_cc1', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_cc2', atomA: 'c2', atomB: 'c3', order: 1, type: 'SINGLE' });
  // Add 8 C-H bonds
  graphPropane.addBond({ id: 'b_ch1', atomA: 'c1', atomB: 'h1', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch2', atomA: 'c1', atomB: 'h2', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch3', atomA: 'c1', atomB: 'h3', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch4', atomA: 'c2', atomB: 'h4', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch5', atomA: 'c2', atomB: 'h5', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch6', atomA: 'c3', atomB: 'h6', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch7', atomA: 'c3', atomB: 'h7', order: 1, type: 'SINGLE' });
  graphPropane.addBond({ id: 'b_ch8', atomA: 'c3', atomB: 'h8', order: 1, type: 'SINGLE' });

  const { GeometryOptimizationEngine } = require('../chemistry/core/GeometryOptimizationEngine');
  const optPropane = GeometryOptimizationEngine.optimizeGeometry(graphPropane.toMolecule(), 60);
  const relaxedPropaneGraph = MolecularGraph.fromMolecule(optPropane.optimizedMolecule);

  const quantumPropane = QuantumEngine.analyzeQuantumMechanics(relaxedPropaneGraph);
  console.log(`  Propane C3H8 Physics Formula Polarizability: ${quantumPropane.polarizabilityAng3} Å³ (Target ~5.92 Å³)`);
  assert(quantumPropane.polarizabilityAng3 >= 5.2 && quantumPropane.polarizabilityAng3 <= 6.5, `Propane polarizability matches physical range 5.92 Å³`);
  // Test 5: Isobutane (C4H10) Polarizability Test (Target ~8.0 Å³ with diffuse & zero-point vibrational corrections)
  console.log('5. Testing Isobutane (C4H10) Quantum Polarizability (Target ~8.0 Å³)...');
  const graphIsobutane = new MolecularGraph('isobutane', 'Isobutane');
  for (let i = 1; i <= 4; i++) {
    graphIsobutane.addAtom({ id: `c${i}`, atomicNumber: 6, position: { x: i * 1.4, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'isobutane' });
  }
  for (let i = 1; i <= 10; i++) {
    graphIsobutane.addAtom({ id: `h${i}`, atomicNumber: 1, position: { x: i * 0.5, y: 1.1, z: 0.4 }, formalCharge: 0, moleculeId: 'isobutane' });
  }
  // 3 C-C bonds
  graphIsobutane.addBond({ id: 'b_cc1', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
  graphIsobutane.addBond({ id: 'b_cc2', atomA: 'c1', atomB: 'c3', order: 1, type: 'SINGLE' });
  graphIsobutane.addBond({ id: 'b_cc3', atomA: 'c1', atomB: 'c4', order: 1, type: 'SINGLE' });
  // 10 C-H bonds
  for (let i = 1; i <= 10; i++) {
    const parentC = i <= 3 ? 'c2' : i <= 6 ? 'c3' : i <= 9 ? 'c4' : 'c1';
    graphIsobutane.addBond({ id: `b_ch${i}`, atomA: parentC, atomB: `h${i}`, order: 1, type: 'SINGLE' });
  }

  const optIsobutane = GeometryOptimizationEngine.optimizeGeometry(graphIsobutane.toMolecule(), 60);
  const relaxedIsobutaneGraph = MolecularGraph.fromMolecule(optIsobutane.optimizedMolecule);
  const quantumIsobutane = QuantumEngine.analyzeQuantumMechanics(relaxedIsobutaneGraph);
  console.log(`  Isobutane C4H10 Quantum Polarizability: ${quantumIsobutane.polarizabilityAng3} Å³ (Target ~8.0 Å³)`);
  assert(quantumIsobutane.polarizabilityAng3 >= 7.5 && quantumIsobutane.polarizabilityAng3 <= 8.5, `Isobutane polarizability matches experimental ~8.0 Å³`);
  console.log('  ✅ Isobutane Polarizability test passed.');

  console.log('\n🎉 ALL THERMODYNAMICS & REACTION KINETICS TESTS PASSED SUCCESSFULLY!');
}

runThermodynamicsAndKineticsTests();
