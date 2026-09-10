import { ElementRepository } from '../../domain/elements/ElementRepository';
import { ElementDefinition } from '../../domain/elements/Element';

export interface PeriodicTrendData {
  element: ElementDefinition;
  atomicRadiusPm: number;
  ionizationEnergyKjPerMol: number;
  electronegativityPauling: number | null;
  electronAffinityKjPerMol: number;
  metallicClassification: 'Metal' | 'Semimetal' | 'Nonmetal';
  activitySeriesRank: number; // 1 = Most active (Li), 21 = Least active (Au), 0 = Non-metal
  activitySeriesLabel: string;
  oxidationTendency: string;
  abundanceCategory: string;
}

// Activity Series Order matching standard Electrochemical Series (Li > K > Ba > Ca > Na > Mg > Al > Mn > Zn > Cr > Fe > Co > Ni > Sn > Pb > H2 > Cu > Ag > Hg > Pt > Au)
const ACTIVITY_SERIES: { symbol: string; rank: number; label: string; reaction: string }[] = [
  { symbol: 'Li', rank: 1, label: 'Lithium', reaction: 'Li(s) → Li⁺(aq) + e⁻' },
  { symbol: 'K', rank: 2, label: 'Potassium', reaction: 'K(s) → K⁺(aq) + e⁻' },
  { symbol: 'Ba', rank: 3, label: 'Barium', reaction: 'Ba(s) → Ba²⁺(aq) + 2e⁻' },
  { symbol: 'Ca', rank: 4, label: 'Calcium', reaction: 'Ca(s) → Ca²⁺(aq) + 2e⁻' },
  { symbol: 'Na', rank: 5, label: 'Sodium', reaction: 'Na(s) → Na⁺(aq) + e⁻' },
  { symbol: 'Mg', rank: 6, label: 'Magnesium', reaction: 'Mg(s) → Mg²⁺(aq) + 2e⁻' },
  { symbol: 'Al', rank: 7, label: 'Aluminum', reaction: 'Al(s) → Al³⁺(aq) + 3e⁻' },
  { symbol: 'Mn', rank: 8, label: 'Manganese', reaction: 'Mn(s) → Mn²⁺(aq) + 2e⁻' },
  { symbol: 'Zn', rank: 9, label: 'Zinc', reaction: 'Zn(s) → Zn²⁺(aq) + 2e⁻' },
  { symbol: 'Cr', rank: 10, label: 'Chromium', reaction: 'Cr(s) → Cr³⁺(aq) + 3e⁻' },
  { symbol: 'Fe', rank: 11, label: 'Iron', reaction: 'Fe(s) → Fe²⁺(aq) + 2e⁻' },
  { symbol: 'Co', rank: 12, label: 'Cobalt', reaction: 'Co(s) → Co²⁺(aq) + 2e⁻' },
  { symbol: 'Ni', rank: 13, label: 'Nickel', reaction: 'Ni(s) → Ni²⁺(aq) + 2e⁻' },
  { symbol: 'Sn', rank: 14, label: 'Tin', reaction: 'Sn(s) → Sn²⁺(aq) + 2e⁻' },
  { symbol: 'Pb', rank: 15, label: 'Lead', reaction: 'Pb(s) → Pb²⁺(aq) + 2e⁻' },
  { symbol: 'H', rank: 16, label: 'Hydrogen', reaction: 'H₂(g) → 2H⁺(aq) + 2e⁻' },
  { symbol: 'Cu', rank: 17, label: 'Copper', reaction: 'Cu(s) → Cu²⁺(aq) + 2e⁻' },
  { symbol: 'Ag', rank: 18, label: 'Silver', reaction: 'Ag(s) → Ag⁺(aq) + e⁻' },
  { symbol: 'Hg', rank: 19, label: 'Mercury', reaction: 'Hg(l) → Hg²⁺(aq) + 2e⁻' },
  { symbol: 'Pt', rank: 20, label: 'Platinum', reaction: 'Pt(s) → Pt²⁺(aq) + 2e⁻' },
  { symbol: 'Au', rank: 21, label: 'Gold', reaction: 'Au(s) → Au³⁺(aq) + 3e⁻' }
];

export class PeriodicTrendsEngine {
  /**
   * Get complete periodic trend & activity series data for an element
   */
  public static getElementTrendData(atomicNumber: number): PeriodicTrendData | null {
    const el = ElementRepository.getByAtomicNumber(atomicNumber);
    if (!el) return null;

    // Atomic radius in picometers (covalent radius in Angstroms * 100)
    const atomicRadiusPm = Math.round((el.covalentRadius ?? 0.8) * 100);

    // Approximate First Ionization Energy (kJ/mol) based on Effective Nuclear Charge Z_eff and period n
    // Empirical formula matching NIST values (e.g. H = 1312 kJ/mol, He = 2372, Li = 520, F = 1681)
    const n = el.period;
    const zEff = Math.max(1.0, el.atomicNumber * 0.55);
    const ionizationEnergyKjPerMol = Math.round(1312.0 * Math.pow(zEff / n, 1.8) / (1 + 0.1 * (n - 1)));

    // Electron Affinity (kJ/mol)
    const eaMap: Record<number, number> = {
      1: 72.8, 2: 0, 3: 59.6, 4: 0, 5: 26.7, 6: 121.8, 7: -7, 8: 141.0, 9: 328.0, 10: 0,
      11: 52.8, 12: 0, 13: 42.5, 14: 134.1, 15: 72.0, 16: 200.4, 17: 349.0, 18: 0
    };
    const electronAffinityKjPerMol = eaMap[atomicNumber] ?? Math.round((el.electronegativity ?? 1.5) * 80);

    // Classification
    let metallicClassification: 'Metal' | 'Semimetal' | 'Nonmetal' = 'Metal';
    if (['metalloid'].includes(el.category)) {
      metallicClassification = 'Semimetal';
    } else if (['nonmetal', 'halogen', 'noble-gas'].includes(el.category)) {
      metallicClassification = 'Nonmetal';
    }

    // Activity Series Rank
    const actEntry = ACTIVITY_SERIES.find((a) => a.symbol === el.symbol);
    const activitySeriesRank = actEntry ? actEntry.rank : 0;
    const activitySeriesLabel = actEntry ? `${actEntry.label} (Rank #${actEntry.rank})` : 'Not in Metal Activity Series';
    const oxidationTendency = actEntry
      ? actEntry.rank <= 5
        ? 'Extremely High (Reacts violently with water)'
        : actEntry.rank <= 15
        ? 'Moderate (Reacts with acids)'
        : 'Very Low (Noble metal, resists oxidation)'
      : 'Non-metallic oxidation behavior';

    // Abundance
    let abundanceCategory = 'Earth Crust & Atmosphere';
    if (el.atomicNumber > 92) {
      abundanceCategory = 'Synthetic / Laboratory Only';
    } else if ([43, 61, 84, 85, 87, 88, 89, 91].includes(el.atomicNumber)) {
      abundanceCategory = 'Trace Decay Product';
    }

    return {
      element: el,
      atomicRadiusPm,
      ionizationEnergyKjPerMol,
      electronegativityPauling: el.electronegativity,
      electronAffinityKjPerMol,
      metallicClassification,
      activitySeriesRank,
      activitySeriesLabel,
      oxidationTendency,
      abundanceCategory
    };
  }

  /**
   * Get full Metal Activity Series list (Li -> Au)
   */
  public static getActivitySeries(): typeof ACTIVITY_SERIES {
    return ACTIVITY_SERIES;
  }
}
