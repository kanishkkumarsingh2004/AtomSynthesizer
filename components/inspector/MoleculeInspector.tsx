'use client';

import React from 'react';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ChemistryEngine } from '../../chemistry/core/ChemistryEngine';
import { Activity, Flame, ShieldAlert, CheckCircle2, AlertTriangle, Thermometer } from 'lucide-react';

export const MoleculeInspector: React.FC = () => {
  const molecule = useMoleculeStore((state) => state.molecule);
  const temperatureK = useWorkspaceStore((state) => state.temperatureK);
  const setTemperatureK = useWorkspaceStore((state) => state.setTemperatureK);

  const analysis = ChemistryEngine.analyzeMolecule(molecule, temperatureK);
  const validation = ChemistryEngine.validateMolecule(molecule);

  return (
    <div className="flex flex-col gap-3 text-xs text-slate-300">
      {/* Molecule Header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow">
        <h3 className="text-sm font-bold text-white truncate">{molecule.name || 'Unnamed Molecule'}</h3>
        <p className="text-[10px] text-slate-400 font-mono">ID: {molecule.id}</p>
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

      {/* Thermodynamics & Reaction Kinetics */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold uppercase text-[11px]">
            <Thermometer className="h-3.5 w-3.5" />
            <span>Thermodynamics & Kinetics</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">{temperatureK} K</span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
          <span className="text-slate-400">Temperature (K):</span>
          <input
            type="range"
            min="100"
            max="1200"
            step="10"
            value={temperatureK}
            onChange={(e) => setTemperatureK(parseFloat(e.target.value))}
            className="w-24 accent-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1 border-t border-slate-800/80">
          <div>
            <span className="text-slate-500">Enthalpy (ΔH°):</span>{' '}
            <span className={analysis.thermodynamics.isExothermic ? 'text-emerald-400' : 'text-amber-400'}>
              {analysis.thermodynamics.enthalpyKjPerMol} kJ/mol
            </span>
          </div>
          <div>
            <span className="text-slate-500">Entropy (S°):</span>{' '}
            <span className="text-slate-200">{analysis.thermodynamics.entropyJPerMolK} J/mol·K</span>
          </div>
          <div>
            <span className="text-slate-500">Gibbs (ΔG°):</span>{' '}
            <span className={analysis.thermodynamics.isSpontaneous ? 'text-emerald-400' : 'text-rose-400'}>
              {analysis.thermodynamics.gibbsFreeEnergyKjPerMol} kJ/mol
            </span>
          </div>
          <div>
            <span className="text-slate-500">Keq:</span>{' '}
            <span className="text-slate-200">{analysis.thermodynamics.equilibriumConstantKeq}</span>
          </div>
          <div>
            <span className="text-slate-500">Ea (Barrier):</span>{' '}
            <span className="text-slate-200">{analysis.kinetics.activationEnergyKjPerMol} kJ/mol</span>
          </div>
          <div>
            <span className="text-slate-500">Rate Constant (k):</span>{' '}
            <span className="text-slate-200">{analysis.kinetics.rateConstantK} s⁻¹</span>
          </div>
        </div>

        <div className="rounded bg-slate-950/80 p-1.5 text-[10px] font-sans text-slate-300 border border-slate-800/80">
          <p className="font-semibold text-amber-300">{analysis.kinetics.description}</p>
          <p className="text-slate-400 text-[9px] mt-0.5">{analysis.thermodynamics.summary}</p>
        </div>
      </div>

      {/* Quantum Mechanics (HMO) */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2">
        <div className="flex items-center gap-1.5 text-purple-400 font-extrabold uppercase text-[11px] border-b border-slate-800 pb-1.5">
          <Activity className="h-3.5 w-3.5" />
          <span>Quantum Mechanics (HMO)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div>
            <span className="text-slate-500">Dipole (|μ|):</span>{' '}
            <span className="text-slate-200">{analysis.quantum.dipoleMagnitude} D</span>
          </div>
          <div>
            <span className="text-slate-500">HOMO Energy:</span>{' '}
            <span className="text-purple-300">
              {analysis.quantum.homoIndex !== null && analysis.quantum.orbitals[analysis.quantum.homoIndex]
                ? `${analysis.quantum.orbitals[analysis.quantum.homoIndex].energyEV} eV`
                : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">LUMO Energy:</span>{' '}
            <span className="text-cyan-300">
              {analysis.quantum.lumoIndex !== null && analysis.quantum.orbitals[analysis.quantum.lumoIndex]
                ? `${analysis.quantum.orbitals[analysis.quantum.lumoIndex].energyEV} eV`
                : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">HOMO-LUMO Gap:</span>{' '}
            <span className="text-emerald-300 font-bold">
              {analysis.quantum.homoLumoGapEV !== null ? `${analysis.quantum.homoLumoGapEV} eV` : 'N/A'}
            </span>
          </div>
        </div>
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
