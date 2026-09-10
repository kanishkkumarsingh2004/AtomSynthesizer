import { PeriodicTrendsEngine } from '../chemistry/core/PeriodicTrendsEngine';
import { MolecularAvailabilityEngine } from '../chemistry/core/MolecularAvailabilityEngine';
import { useReactionStore } from '../stores/reactionStore';
import { MOLECULE_PRESETS } from '../chemistry/library/MoleculePresets';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERT FAILED] ${message}`);
  }
}

function runTrendsTests() {
  console.log('🧪 Starting Periodic Trends, Activity Series & Availability Engine Tests...\n');

  // Test 1: Periodic Trends Engine for Sodium (Na, Z=11)
  console.log('1. Testing PeriodicTrendsEngine for Sodium (Z=11)...');
  const naTrend = PeriodicTrendsEngine.getElementTrendData(11);
  assert(naTrend !== null, 'Sodium trend data retrieved');
  assert(naTrend!.element.symbol === 'Na', 'Element symbol is Na');
  assert(naTrend!.atomicRadiusPm > 0, 'Atomic radius in pm is positive');
  assert(naTrend!.ionizationEnergyKjPerMol > 0, 'Ionization energy is positive');
  assert(naTrend!.metallicClassification === 'Metal', 'Sodium is classified as a Metal');
  assert(naTrend!.activitySeriesRank === 5, 'Sodium is Rank #5 in Metal Activity Series');
  console.log('  ✅ Sodium periodic trend test passed.');

  // Test 2: Metal Activity Series Table (21 Elements)
  console.log('2. Testing Metal Activity Series List...');
  const series = PeriodicTrendsEngine.getActivitySeries();
  assert(series.length === 21, 'Metal activity series contains 21 elements');
  assert(series[0].symbol === 'Li' && series[0].rank === 1, 'Lithium is Rank #1 (Most active)');
  assert(series[series.length - 1].symbol === 'Au' && series[series.length - 1].rank === 21, 'Gold is Rank #21 (Least active)');
  const hydrogen = series.find((s) => s.symbol === 'H');
  assert(hydrogen !== undefined && hydrogen.rank === 16, 'Hydrogen is Rank #16 benchmark');
  console.log('  ✅ Metal Activity Series test passed.');

  // Test 3: Molecular Availability Engine for Benzene
  console.log('3. Testing 3D Molecular Availability Prediction Engine for Benzene...');
  const benzenePreset = MOLECULE_PRESETS.find((p) => p.name === 'Benzene');
  assert(benzenePreset !== undefined, 'Benzene preset exists');
  const benzene = benzenePreset!.builder();
  const availability = MolecularAvailabilityEngine.predictAvailability(benzene);

  assert(availability.moleculeName === 'Benzene', 'Molecule name is Benzene');
  assert(availability.stabilityScore >= 0 && availability.stabilityScore <= 100, 'Stability score is within [0, 100]');
  assert(['STABLE', 'METASTABLE', 'REACTIVE', 'EXPLOSIVE / DISSOCIATING'].includes(availability.stabilityRating), 'Valid stability rating');
  assert(availability.bindingEnergyKJPerMol > 0, 'Total binding energy is positive');
  assert(availability.preferredPathways.length > 0, 'At least one preferred reaction pathway generated');
  console.log('  ✅ Molecular availability prediction test passed.');

  // Test 4: Reaction Log Tracker & Persistence Store
  console.log('4. Testing Reaction Store & Logging...');
  useReactionStore.getState().clearReactions();
  assert(useReactionStore.getState().reactions.length === 0, 'Reaction store cleared');

  const rec = useReactionStore.getState().addReaction({
    reactantsSummary: '2Na + 2H2O',
    productsSummary: '2NaOH + H2',
    reactionCategory: 'REDOX',
    deltaHKJPerMol: -368,
    temperatureK: 298.15,
    activationEnergyKJPerMol: 12,
    rateConstantK: 4.5e2
  });

  assert(rec.id.startsWith('rxn_'), 'Reaction record assigned unique ID');
  assert(useReactionStore.getState().reactions.length === 1, 'Store contains 1 reaction record');
  assert(useReactionStore.getState().reactions[0].reactantsSummary === '2Na + 2H2O', 'Reactants summary matched');

  console.log('  ✅ Reaction store test passed.');

  console.log('\n🎉 ALL PERIODIC TRENDS & MOLECULAR AVAILABILITY TESTS PASSED SUCCESSFULLY!');
}

runTrendsTests();
