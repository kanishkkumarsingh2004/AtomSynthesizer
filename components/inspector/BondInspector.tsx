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

  const handleOrderSelect = (order: BondOrder, type: BondType) => {
    changeBondOrder(bond.id, order, type);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="font-semibold text-slate-100">Bond Inspector</h3>
        <p className="text-[10px] text-slate-400 font-mono">ID: {bond.id}</p>
      </div>

      {/* Connected Atoms */}
      <div className="rounded-md bg-slate-900/90 p-2.5 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{elA ? elA.symbol : 'A'}</span>
          <span className="text-slate-500">─</span>
          <span className="font-bold text-white">{elB ? elB.symbol : 'B'}</span>
        </div>
        <span className="font-mono text-slate-400">{bondLength} Å</span>
      </div>

      {/* Bond Order Selectors */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-slate-400">Bond Order</label>
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
    </div>
  );
};
