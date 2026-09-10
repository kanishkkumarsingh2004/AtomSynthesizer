import { useWorkspaceStore } from '../stores/workspaceStore';
import { MOLECULE_PRESETS } from '../chemistry/library/MoleculePresets';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runCloudTests() {
  console.log('🧪 Starting Quantum Electron / Ion Cloud Rendering Tests...\n');

  // Test 1: RenderingMode store state
  console.log('1. Testing RenderingMode Store State...');
  useWorkspaceStore.getState().setRenderingMode('ELECTRON_CLOUD');
  assert(useWorkspaceStore.getState().renderingMode === 'ELECTRON_CLOUD', 'renderingMode set to ELECTRON_CLOUD');
  console.log('  ✅ RenderingMode store state test passed.');

  // Test 2: Benzene Ring Structure Preset
  console.log('2. Testing Benzene Aromatic Ring Preset Structure...');
  const benzenePreset = MOLECULE_PRESETS.find((p) => p.name === 'Benzene');
  assert(benzenePreset !== undefined, 'Benzene preset exists');
  const benzene = benzenePreset!.builder();
  assert(benzene.atoms.length === 12, 'Benzene has 12 atoms (6C + 6H)');
  assert(benzene.bonds.length === 12, 'Benzene has 12 bonds');
  // Test 3: Schrodinger Orbital Engine Mathematics
  console.log('3. Testing Schrodinger Orbital Engine Mathematics...');
  const { SchrodingerOrbitalEngine } = require('../chemistry/core/SchrodingerOrbitalEngine');

  const r1s = SchrodingerOrbitalEngine.calculateRadialWavefunction(1, 0, 0.5, 1.0);
  assert(r1s > 0, '1s radial wavefunction evaluates positive');

  const y00 = SchrodingerOrbitalEngine.calculateSphericalHarmonic(0, 0, Math.PI / 4, 0);
  assert(Math.abs(y00 - 0.282) < 0.01, 's-orbital spherical harmonic equals 1/sqrt(4pi)');

  const hSol = SchrodingerOrbitalEngine.solveAtomicSchrodinger(1);
  assert(Math.abs(hSol.groundStateEnergyEV - (-13.6)) < 0.1, 'Hydrogen ground state energy E_1 = -13.6 eV');

  const molSol = SchrodingerOrbitalEngine.solveMolecularSchrodinger(benzene);
  const probeProb = molSol.calculateMolecularProbabilityDensity({ x: 0, y: 0, z: 0 });
  assert(probeProb > 0, 'Molecular probability density is positive');

  const sampledCloud = SchrodingerOrbitalEngine.sampleMolecularCloud(benzene, 5000);
  assert(sampledCloud.positions.length === 5000 * 3, 'Sampled cloud contains exactly 5000 3D positions');
  assert(sampledCloud.colors.length === 5000 * 3, 'Sampled cloud contains exactly 5000 RGB colors');
  console.log('  ✅ Schrodinger Orbital Engine tests passed.');

  console.log('\n🎉 ALL QUANTUM ELECTRON / ION CLOUD TESTS PASSED SUCCESSFULLY!');
}

runCloudTests();
