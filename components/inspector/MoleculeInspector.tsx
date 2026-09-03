'use client';

import React from 'react';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ChemistryEngine } from '../../chemistry/core/ChemistryEngine';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, Thermometer, Compass, Zap, Waves } from 'lucide-react';

export const MoleculeInspector: React.FC = () => {
  const molecule = useMoleculeStore((state) => state.molecule);
  const temperatureK = useWorkspaceStore((state) => state.temperatureK);
  const setTemperatureK = useWorkspaceStore((state) => state.setTemperatureK);

  const analysis = ChemistryEngine.analyzeMolecule(molecule, temperatureK);
  const validation = ChemistryEngine.validateMolecule(molecule);

  // Temperature in Celsius (°C)
  const tempCelsius = Math.round((temperatureK - 273.15) * 10) / 10;

  const handleCelsiusChange = (newCelsius: number) => {
    const newK = Math.round((newCelsius + 273.15) * 100) / 100;
    setTemperatureK(newK);
    useWorkspaceStore.getState().setReactionSimulationActive(true);
    useWorkspaceStore.getState().setLivePhysicsEnabled(true);
  };

  const vib = analysis.vibrationalThermal;

  return (
    <div className="flex flex-col gap-3 text-xs text-slate-300">
      {/* Molecule Header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white truncate">{molecule.name || 'Unnamed Molecule'}</h3>
          <p className="text-[10px] text-slate-400 font-mono">ID: {molecule.id}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 border border-indigo-800/80 font-mono">
            {analysis.quantum.pointGroupSymmetry}
          </span>
        </div>
      </div>

      {/* Formula & Properties */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Chemical Formula</span>
          <span className="text-sm font-extrabold text-blue-400 font-mono">
            {analysis.formula || 'Empty'}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
          <span className="text-[10px] font-semibold text-slate-400">IUPAC Name</span>
          <span className="text-xs font-bold text-emerald-400 font-mono truncate max-w-[170px]">
            {analysis.iupacName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2 text-[10px] font-mono">
          <div>
            <span className="text-slate-500">Molecular Weight:</span>{' '}
            <span className="text-slate-200">{analysis.molecularWeight} g/mol</span>
          </div>
          <div>
            <span className="text-slate-500">Net Charge:</span>{' '}
            <span className="text-slate-200">{analysis.totalCharge}</span>
          </div>
          <div>
            <span className="text-slate-500">Atoms:</span>{' '}
            <span className="text-slate-200">{analysis.atomCount}</span>
          </div>
          <div>
            <span className="text-slate-500">Bonds:</span>{' '}
            <span className="text-slate-200">{analysis.bondCount}</span>
          </div>
        </div>
      </div>

      {/* Temperature Controls & Vibrational Dynamics */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold uppercase text-[11px]">
            <Thermometer className="h-3.5 w-3.5" />
            <span>Thermodynamics & Temperature</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300">
            {tempCelsius} °C <span className="text-slate-400 text-[9px]">({temperatureK.toFixed(1)} K)</span>
          </span>
        </div>

        {/* Temperature Meter in °C (Degree Celsius) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Temperature Meter (°C):</span>
            <span className="font-bold text-white">{tempCelsius} °C</span>
          </div>
          <input
            type="range"
            min="-200"
            max="1000"
            step="5"
            value={tempCelsius}
            onChange={(e) => handleCelsiusChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>-200 °C (73 K)</span>
            <span>25 °C (298 K)</span>
            <span>500 °C (773 K)</span>
            <span>1000 °C (1273 K)</span>
          </div>
        </div>

        {/* Thermal Vibrations & Normal Modes */}
        <div className="rounded bg-slate-950/80 p-2 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] border-b border-slate-900 pb-1">
            <span className="flex items-center gap-1 text-cyan-300 font-bold">
              <Waves className="h-3.5 w-3.5" /> Vibrational Normal Modes
            </span>
            <span className="font-mono text-cyan-400 font-extrabold">{vib.vibrationalModesCount} Mode(s)</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 pt-0.5">
            <div>
              <span className="text-slate-500">RMS Amplitude:</span>{' '}
              <span className="text-emerald-300 font-bold">{vib.thermalAmplitudeAngstrom} Å</span>
            </div>
            <div>
              <span className="text-slate-500">Zero-Point Energy (ZPVE):</span>{' '}
              <span className="text-purple-300 font-extrabold">{vib.zeroPointEnergyKjPerMol} kJ/mol</span>
            </div>
            <div>
              <span className="text-slate-500">Freq (Hooke's ν):</span>{' '}
              <span className="text-cyan-300 font-extrabold">{vib.primaryFrequencyWavenumberCm1} cm⁻¹</span>
            </div>
            <div>
              <span className="text-slate-500">Stiffness (k):</span>{' '}
              <span className="text-amber-300 font-extrabold">{vib.bondStiffnessForceConstant} N/m</span>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-300 pt-1 leading-relaxed border-t border-slate-900/80 font-sans">
            {vib.description}
          </p>
        </div>

        {/* Enthalpy, Entropy & Gibbs Values */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1 border-t border-slate-800/80">
          <div>
            <span className="text-slate-500">Enthalpy (ΔH°):</span>{' '}
            <span className={analysis.thermodynamics.isExothermic ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {analysis.thermodynamics.enthalpyKjPerMol} kJ/mol
            </span>
          </div>
          <div>
            <span className="text-slate-500">Entropy (S°):</span>{' '}
            <span className="text-slate-200 font-bold">{analysis.thermodynamics.entropyJPerMolK} J/mol·K</span>
          </div>
          <div>
            <span className="text-slate-500">Gibbs (ΔG°):</span>{' '}
            <span className={analysis.thermodynamics.isSpontaneous ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {analysis.thermodynamics.gibbsFreeEnergyKjPerMol} kJ/mol
            </span>
          </div>
          <div>
            <span className="text-slate-500">Heat Cap (Cp):</span>{' '}
            <span className="text-cyan-300 font-bold">{analysis.thermodynamics.heatCapacityCp} J/mol·K</span>
          </div>
          <div>
            <span className="text-slate-500">Internal Energy (U):</span>{' '}
            <span className="text-purple-300 font-bold">{analysis.thermodynamics.internalEnergyU} kJ/mol</span>
          </div>
          <div>
            <span className="text-slate-500">Partition Func (Q):</span>{' '}
            <span className="text-amber-300 font-bold">{analysis.thermodynamics.partitionFunctionQ}</span>
          </div>
          <div>
            <span className="text-slate-500">Rotational B:</span>{' '}
            <span className="text-indigo-300 font-bold">{analysis.thermodynamics.rotationalConstantB} cm⁻¹</span>
          </div>
          <div>
            <span className="text-slate-500">Keq:</span>{' '}
            <span className="text-slate-200">{analysis.thermodynamics.equilibriumConstantKeq}</span>
          </div>
        </div>

        <div className="rounded bg-slate-950/80 p-1.5 text-[10px] font-sans text-slate-300 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[9px] text-slate-400 border-b border-slate-900 pb-0.5 font-mono">
            <span>Data Origin:</span>
            <span className="text-amber-300 font-bold">{analysis.thermodynamics.dataSource}</span>
          </div>
          <p className="font-semibold text-amber-300">{analysis.kinetics.description}</p>
          <p className="text-slate-400 text-[9px]">{analysis.thermodynamics.summary}</p>
        </div>
      </div>

      {/* Quantum Mechanics & Molecular Physics */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-purple-400 font-extrabold uppercase text-[11px]">
            <Activity className="h-3.5 w-3.5" />
            <span>Quantum Physics & Dipole</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-purple-300">
            <Compass className="h-3 w-3" />
            <span>{analysis.quantum.pointGroupSymmetry}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div>
            <span className="text-slate-500">Dipole (|μ|):</span>{' '}
            <span className={analysis.quantum.dipoleMagnitude === 0 ? 'text-emerald-400 font-extrabold' : 'text-amber-300 font-extrabold'}>
              {analysis.quantum.dipoleMagnitude} D
            </span>
          </div>
          <div>
            <span className="text-slate-500">Polarizability (α):</span>{' '}
            <span className="text-cyan-300">{analysis.quantum.polarizabilityAng3} Å³</span>
          </div>
          <div>
            <span className="text-slate-500">HOMO Energy:</span>{' '}
            <span className="text-purple-300 font-extrabold">
              {analysis.quantum.homoEnergyEV !== undefined && analysis.quantum.homoEnergyEV !== null
                ? `${analysis.quantum.homoEnergyEV} eV`
                : (analysis.quantum.homoIndex !== null && analysis.quantum.orbitals[analysis.quantum.homoIndex]
                    ? `${analysis.quantum.orbitals[analysis.quantum.homoIndex].energyEV} eV`
                    : 'N/A')}
            </span>
          </div>
          <div>
            <span className="text-slate-500">LUMO Energy:</span>{' '}
            <span className="text-cyan-300 font-extrabold">
              {analysis.quantum.lumoEnergyEV !== undefined && analysis.quantum.lumoEnergyEV !== null
                ? `${analysis.quantum.lumoEnergyEV} eV`
                : (analysis.quantum.lumoIndex !== null && analysis.quantum.orbitals[analysis.quantum.lumoIndex]
                    ? `${analysis.quantum.orbitals[analysis.quantum.lumoIndex].energyEV} eV`
                    : 'N/A')}
            </span>
          </div>
          <div>
            <span className="text-slate-500">HOMO-LUMO Gap:</span>{' '}
            <span className="text-emerald-300 font-extrabold">
              {analysis.quantum.homoLumoGapEV !== null ? `${analysis.quantum.homoLumoGapEV} eV` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Symmetry:</span>{' '}
            <span className="text-indigo-300 font-bold">{analysis.quantum.pointGroupSymmetry}</span>
          </div>
        </div>

        {/* Dipole Vector Components */}
        <div className="rounded bg-slate-950/80 p-1.5 text-[9px] font-mono border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-0.5">
            <span className="flex items-center gap-1 text-purple-300 font-bold">
              <Zap className="h-3 w-3" /> Dipole Vector (px, py, pz)
            </span>
            <span>Debye (D)</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center text-slate-300">
            <div><span className="text-slate-500">X:</span> {analysis.quantum.dipoleVector.x}</div>
            <div><span className="text-slate-500">Y:</span> {analysis.quantum.dipoleVector.y}</div>
            <div><span className="text-slate-500">Z:</span> {analysis.quantum.dipoleVector.z}</div>
          </div>
        </div>

        {/* Partial Charge Distribution Extremes */}
        {analysis.quantum.maxPositiveCharge && analysis.quantum.maxNegativeCharge && (
          <div className="grid grid-cols-2 gap-1 text-[9px] font-mono border-t border-slate-800/80 pt-1.5">
            <div>
              <span className="text-slate-500">Max + Charge:</span>{' '}
              <span className="text-rose-400 font-bold">
                +{analysis.quantum.maxPositiveCharge.charge}e ({analysis.quantum.maxPositiveCharge.symbol})
              </span>
            </div>
            <div>
              <span className="text-slate-500">Max - Charge:</span>{' '}
              <span className="text-blue-400 font-bold">
                {analysis.quantum.maxNegativeCharge.charge}e ({analysis.quantum.maxNegativeCharge.symbol})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Structure Validation */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Structure Validation</span>
          <div className="flex items-center gap-1">
            {validation.valid ? (
              <span className="flex items-center gap-1 rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded bg-rose-950 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-800">
                <ShieldAlert className="h-3 w-3" /> Invalid
              </span>
            )}
          </div>
        </div>

        {validation.issues.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic">No structure warnings or issues.</p>
        ) : (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {validation.issues.map((iss, idx) => (
              <div
                key={idx}
                className={`rounded p-1.5 text-[10px] flex items-start gap-1.5 border ${
                  iss.severity === 'ERROR'
                    ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                    : 'bg-amber-950/60 border-amber-800 text-amber-300'
                }`}
              >
                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                <span>{iss.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
