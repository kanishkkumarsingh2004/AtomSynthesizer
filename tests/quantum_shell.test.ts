import { QuantumShellEngine } from '../chemistry/core/QuantumShellEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runQuantumShellTests() {
  console.log('🧪 Starting Quantum Shell & spdf Configuration Unit Tests...\n');

  // Test 1: Carbon (Z=6) spdf subshell breakdown
  console.log('1. Testing Carbon (Z=6) spdf subshell breakdown...');
  const carbonData = QuantumShellEngine.getQuantumStructure(6);
  assert(carbonData.atomicNumber === 6, 'Carbon Z=6');
  assert(carbonData.protons === 6, 'Carbon 6 protons');
  assert(carbonData.shells.length === 2, 'Carbon has K and L shells');
  assert(carbonData.shells[0].electronCount === 2, 'K shell has 2 electrons');
  assert(carbonData.shells[1].electronCount === 4, 'L shell has 4 electrons');
  console.log('  ✅ Carbon spdf quantum structure passed.');

  // Test 2: Oganesson (Z=118) full shell breakdown
  console.log('2. Testing Oganesson (Z=118) 7-shell breakdown...');
  const ogData = QuantumShellEngine.getQuantumStructure(118);
  assert(ogData.atomicNumber === 118, 'Oganesson Z=118');
  assert(ogData.shells.length === 7, 'Oganesson has 7 active shells (K, L, M, N, O, P, Q)');
  assert(ogData.valenceElectrons === 8, 'Oganesson octet 8 valence electrons');
  console.log('  ✅ Oganesson spdf quantum structure passed.');

  console.log('\n🎉 ALL QUANTUM SHELL & SPDF TESTS PASSED SUCCESSFULLY!');
}

runQuantumShellTests();
