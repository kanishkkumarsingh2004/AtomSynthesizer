import { MolecularGraph } from '../domain/molecular/MolecularGraph';
import { GeometryOptimizationEngine } from '../chemistry/core/GeometryOptimizationEngine';
import { ExplosionPhysicsEngine } from '../chemistry/core/ExplosionPhysicsEngine';
import { AutoBondEngine } from '../chemistry/core/AutoBondEngine';
import { angle } from '../lib/math';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runPhysicsAndVSEPRTests() {
  console.log('🧪 Starting 3D Tetrahedral Pop-Out & VSEPR Alignment Unit Tests...\n');

  // Test 1: Coplanar Square Planar CH4 Pop-Out to 3D Tetrahedral
  console.log('1. Testing Coplanar CH4 Pop-Out to 3D Tetrahedral...');
  const graphCh4Flat = new MolecularGraph('ch4_flat', 'Flat Methane');
  graphCh4Flat.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'ch4_flat' });
  graphCh4Flat.addAtom({ id: 'h1', atomicNumber: 1, position: { x: 1, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'ch4_flat' });
  graphCh4Flat.addAtom({ id: 'h2', atomicNumber: 1, position: { x: 0, y: 1, z: 0 }, formalCharge: 0, moleculeId: 'ch4_flat' });
  graphCh4Flat.addAtom({ id: 'h3', atomicNumber: 1, position: { x: -1, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'ch4_flat' });
  graphCh4Flat.addAtom({ id: 'h4', atomicNumber: 1, position: { x: 0, y: -1, z: 0 }, formalCharge: 0, moleculeId: 'ch4_flat' });

  graphCh4Flat.addBond({ id: 'b1', atomA: 'c1', atomB: 'h1', order: 1, type: 'SINGLE' });
  graphCh4Flat.addBond({ id: 'b2', atomA: 'c1', atomB: 'h2', order: 1, type: 'SINGLE' });
  graphCh4Flat.addBond({ id: 'b3', atomA: 'c1', atomB: 'h3', order: 1, type: 'SINGLE' });
  graphCh4Flat.addBond({ id: 'b4', atomA: 'c1', atomB: 'h4', order: 1, type: 'SINGLE' });

  const optRes = GeometryOptimizationEngine.optimizeGeometry(graphCh4Flat.toMolecule(), 250);
  const optAtoms = optRes.optimizedMolecule.atoms;

  // Verify that atoms popped OUT of the 2D plane (Z coordinates are non-zero)
  const zCoords = optAtoms.filter((a) => a.id !== 'c1').map((a) => a.position.z);
  const hasOutofPlaneZ = zCoords.some((z) => Math.abs(z) > 0.01);
  assert(hasOutofPlaneZ, `Flat 2D CH4 popped out into 3D space with non-zero Z coordinates: ${zCoords.join(', ')}`);

  // Verify angle between H1-C-H2 is close to ideal tetrahedral 109.47 deg
  const h1 = optAtoms.find((a) => a.id === 'h1')!;
  const c1 = optAtoms.find((a) => a.id === 'c1')!;
  const h2 = optAtoms.find((a) => a.id === 'h2')!;
  const bondAngle = angle(h1.position, c1.position, h2.position);
  assert(Math.abs(bondAngle - 109.47) < 15.0, `H-C-H bond angle relaxed close to 109.47 deg, got ${bondAngle.toFixed(2)} deg`);

  console.log('  ✅ Coplanar CH4 3D Tetrahedral Pop-Out passed.');

  // Test 2: CO2 Linear 180 degree geometry optimization
  console.log('\n2. Testing CO2 Linear (180 deg) Geometry Optimization...');
  const graphCO2 = new MolecularGraph('co2', 'Carbon Dioxide');
  graphCO2.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'co2' });
  graphCO2.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 1.16, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'co2' });
  graphCO2.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 0, y: 1.16, z: 0 }, formalCharge: 0, moleculeId: 'co2' }); // placed at 90 deg

  graphCO2.addBond({ id: 'b1', atomA: 'c1', atomB: 'o1', order: 2, type: 'DOUBLE' });
  graphCO2.addBond({ id: 'b2', atomA: 'c1', atomB: 'o2', order: 2, type: 'DOUBLE' });

  const optResCO2 = GeometryOptimizationEngine.optimizeGeometry(graphCO2.toMolecule(), 200);
  const co2Atoms = optResCO2.optimizedMolecule.atoms;
  const co2_o1 = co2Atoms.find((a) => a.id === 'o1')!;
  const co2_c1 = co2Atoms.find((a) => a.id === 'c1')!;
  const co2_o2 = co2Atoms.find((a) => a.id === 'o2')!;
  const co2Angle = angle(co2_o1.position, co2_c1.position, co2_o2.position);
  console.log(`  Measured O-C-O bond angle: ${co2Angle.toFixed(2)} degrees`);
  assert(Math.abs(co2Angle - 180.0) < 1.0, `CO2 O-C-O bond angle relaxed to 180 deg, got ${co2Angle.toFixed(2)} deg`);
  console.log('  ✅ CO2 Linear 180 deg VSEPR Geometry Optimization passed.');

  console.log('\n🎉 ALL 3D TETRAHEDRAL POP-OUT TESTS PASSED SUCCESSFULLY!');
}

runPhysicsAndVSEPRTests();
