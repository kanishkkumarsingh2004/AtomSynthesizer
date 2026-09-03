'use client';

import React from 'react';
import { Bond } from '../../domain/molecular/Bond';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { distance } from '../../lib/math';
import { BondOrder, BondType } from '../../domain/molecular/MolecularTypes';

interface BondInspectorProps {
  bond: Bond;
}

export const BondInspector: React.FC<BondInspectorProps> = ({ bond }) => {
  const molecule = useMoleculeStore((state) => state.molecule);
  const changeBondOrder = useMoleculeStore((state) => state.changeBondOrder);

  const atomA = molecule.atoms.find((a) => a.id === bond.atomA);
  const atomB = molecule.atoms.find((a) => a.id === bond.atomB);

  const elA = atomA ? ElementRepository.getByAtomicNumber(atomA.atomicNumber) : null;
  const elB = atomB ? ElementRepository.getByAtomicNumber(atomB.atomicNumber) : null;

  const bondLength =
    atomA && atomB ? Math.round(distance(atomA.position, atomB.position) * 1000) / 1000 : 0;

  const mA = elA ? elA.atomicMass : 12.011;
  const mB = elB ? elB.atomicMass : 12.011;
  const mu = Math.round(((mA * mB) / (mA + mB)) * 100) / 100; // Reduced mass in amu

  const forceConstantK = bond.order === 3 ? 1500 : bond.order === 2 ? 1000 : 500; // N/m
  const hookeNuCm1 = Math.round((1 / (2 * Math.PI * 2.9979e10)) * Math.sqrt(forceConstantK / (mu * 1.66054e-27)));

  const chiA = elA?.electronegativity ?? 2.2;
  const chiB = elB?.electronegativity ?? 2.2;
  const deltaChi = Math.round(Math.abs(chiA - chiB) * 100) / 100;
  const ionicPct = Math.round((1 - Math.exp(-Math.pow(deltaChi / 2.0, 2))) * 1000) / 10;

  const bondEnergyKj = bond.order === 3 ? 839 : bond.order === 2 ? 614 : 348; // kJ/mol

  const handleOrderSelect = (order: BondOrder, type: BondType) => {
    changeBondOrder(bond.id, order, type);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="font-semibold text-slate-100">Bond Inspector</h3>
        <p className="text-[10px] text-slate-400 font-mono">ID: {bond.id}</p>
      </div>

      {/* Connected Atoms & Measured Distance */}
      <div className="rounded-md bg-slate-900/90 p-2.5 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">{elA ? elA.symbol : 'A'}</span>
          <span className="text-slate-500 font-bold">
            {bond.order === 3 ? '≡' : bond.order === 2 ? '═' : '─'}
          </span>
          <span className="font-bold text-white text-sm">{elB ? elB.symbol : 'B'}</span>
        </div>
        <span className="font-mono text-cyan-300 font-extrabold">{bondLength} Å</span>
      </div>

      {/* Bond Order Selectors */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-slate-400 font-semibold">Bond Order</label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => handleOrderSelect(1, 'SINGLE')}
            className={`rounded px-2 py-1.5 font-mono text-xs font-bold transition ${
              bond.order === 1
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Single (1)
          </button>
          <button
            onClick={() => handleOrderSelect(2, 'DOUBLE')}
            className={`rounded px-2 py-1.5 font-mono text-xs font-bold transition ${
              bond.order === 2
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Double (2)
          </button>
          <button
            onClick={() => handleOrderSelect(3, 'TRIPLE')}
            className={`rounded px-2 py-1.5 font-mono text-xs font-bold transition ${
              bond.order === 3
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Triple (3)
          </button>
          <button
            onClick={() => handleOrderSelect(1.5, 'AROMATIC')}
            className={`rounded px-2 py-1.5 font-mono text-xs font-bold transition ${
              bond.order === 1.5
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Aromatic
          </button>
        </div>
      </div>

      {/* First-Principles Quantum & Physical Mechanics Panel */}
      <div className="rounded-md border border-slate-800 bg-slate-900/90 p-2.5 space-y-2 shadow">
        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1 flex justify-between">
          <span>Bond Physics & Quantum Mechanics</span>
          <span className="text-slate-400 font-mono">{hookeNuCm1} cm⁻¹</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div>
            <span className="text-slate-500">Hooke's Freq (ν):</span>{' '}
            <span className="text-cyan-300 font-bold">{hookeNuCm1} cm⁻¹</span>
          </div>
          <div>
            <span className="text-slate-500">Stiffness (k):</span>{' '}
            <span className="text-amber-300 font-bold">{forceConstantK} N/m</span>
          </div>
          <div>
            <span className="text-slate-500">Reduced Mass (μ):</span>{' '}
            <span className="text-slate-200">{mu} amu</span>
          </div>
          <div>
            <span className="text-slate-500">Morse Well (De):</span>{' '}
            <span className="text-purple-300 font-bold">{bondEnergyKj} kJ/mol</span>
          </div>
          <div>
            <span className="text-slate-500">ΔElectronegativity:</span>{' '}
            <span className="text-emerald-300 font-bold">{deltaChi}</span>
          </div>
          <div>
            <span className="text-slate-500">Ionic Character:</span>{' '}
            <span className={ionicPct > 50 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{ionicPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
