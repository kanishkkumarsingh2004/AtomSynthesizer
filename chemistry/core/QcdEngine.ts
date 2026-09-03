import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export interface QcdThermodynamicsResult {
  upQuarksCount: number;
  downQuarksCount: number;
  totalQuarksCount: number;
  isQgpDeconfined: boolean;
  qgpPressureGevFm3: number;
  qgpEnergyDensityGevFm3: number;
  traceAnomalyDelta: number;
  criticalTemperatureKelvin: number;
  etaToRatioBound: number; // hbar / (4*pi*kB) = 1/(4*pi)
  summary: string;
}

export class QcdEngine {
  /**
   * Calculates Quantum Chromodynamics (QCD) & Quark-Gluon Plasma (QGP) Equations of State
   */
  public static analyzeQcdThermodynamics(
    graph: MolecularGraph,
    temperatureK = 298.15
  ): QcdThermodynamicsResult {
    const atoms = graph.getAllAtoms();

    let totalProtons = 0;
    let totalNeutrons = 0;

    for (const a of atoms) {
      const z = a.atomicNumber;
      const el = ElementRepository.getByAtomicNumber(z);
      const mass = Math.round(el?.atomicMass ?? z * 2);
      const p = z;
      const n = Math.max(0, mass - z);
      totalProtons += p;
      totalNeutrons += n;
    }

    // Proton = uud (2 u, 1 d), Neutron = udd (1 u, 2 d)
    const upQuarks = totalProtons * 2 + totalNeutrons * 1;
    const downQuarks = totalProtons * 1 + totalNeutrons * 2;
    const totalQuarks = upQuarks + downQuarks;

    // Critical transition temperature Tc approx 144 MeV = 1.671e12 K
    const Tc_Kelvin = 1.671e12;
    const isDeconfined = temperatureK >= Tc_Kelvin;

    // Conversion: 1 MeV = 1.16045e10 K. Temperature in MeV:
    const T_MeV = temperatureK / 1.16045e10;
    const T_GeV = T_MeV / 1000.0;

    // Bag Constant B^(1/4) = 0.200 GeV -> B = (0.200)^4 = 0.0016 GeV^4
    const B = 0.0016; // GeV/fm^3 (using natural units 1 GeV^4 approx 0.13 GeV/fm^3)
    const piSq = Math.PI * Math.PI;

    // SB limit: P_ideal = (37 * pi^2 / 90) * T^4
    const P_ideal = (37.0 * piSq / 90.0) * Math.pow(T_GeV, 4);
    const P_qgp = Math.max(0, P_ideal - B);
    const eps_qgp = (37.0 * piSq / 30.0) * Math.pow(T_GeV, 4) + B;

    // Trace anomaly Delta = (eps - 3P)/T^4 = 4B / T^4
    const traceAnomaly = T_GeV > 0 ? (4.0 * B) / Math.pow(T_GeV, 4) : 0;

    // KSS Lower Bound for eta / s = hbar / (4 * pi * kB) = 1 / (4 * pi) approx 0.0796
    const etaOverSBound = 1.0 / (4.0 * Math.PI);

    let summary = isDeconfined
      ? `Deconfined Quark-Gluon Plasma (QGP Phase, T = ${temperatureK.toExponential(2)} K ≥ Tc)`
      : `Confined Hadronic Matter (T = ${Math.round(temperatureK - 273.15)} °C < Tc)`;

    return {
      upQuarksCount: upQuarks,
      downQuarksCount: downQuarks,
      totalQuarksCount: totalQuarks,
      isQgpDeconfined: isDeconfined,
      qgpPressureGevFm3: Math.round(P_qgp * 1e6) / 1e6,
      qgpEnergyDensityGevFm3: Math.round(eps_qgp * 1e6) / 1e6,
      traceAnomalyDelta: Math.round(traceAnomaly * 100) / 100,
      criticalTemperatureKelvin: Tc_Kelvin,
      etaToRatioBound: Math.round(etaOverSBound * 10000) / 10000,
      summary
    };
  }
}
