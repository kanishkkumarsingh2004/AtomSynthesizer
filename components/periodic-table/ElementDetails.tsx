'use client';

import React from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export const ElementDetails: React.FC = () => {
  const activeNumber = useWorkspaceStore((state) => state.activeElementNumber);
  const element = ElementRepository.getByAtomicNumber(activeNumber);

  if (!element) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-2.5 text-xs text-slate-300 shadow-md">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded border border-slate-700 shadow"
          style={{ backgroundColor: element.defaultColor + '25', borderColor: element.defaultColor }}
        >
          <span className="text-[9px] text-slate-400 font-mono leading-none">{element.atomicNumber}</span>
          <span className="text-base font-extrabold text-white leading-tight font-mono">{element.symbol}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-white truncate">{element.name}</h3>
          <p className="text-[10px] capitalize text-slate-400 truncate">{element.category.replace('-', ' ')}</p>
          <p className="text-[10px] text-slate-400 font-mono">Mass: {element.atomicMass} g/mol</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-slate-800/80 pt-2 text-[10px] font-mono">
        <div className="truncate">
          <span className="text-slate-500">Period/Group:</span>{' '}
          <span className="text-slate-200">{element.period}/{element.group ?? 'N/A'}</span>
        </div>
        <div className="truncate">
          <span className="text-slate-500">EN (Pauling):</span>{' '}
          <span className="text-slate-200">{element.electronegativity ?? 'N/A'}</span>
        </div>
        <div className="truncate">
          <span className="text-slate-500">Covalent R:</span>{' '}
          <span className="text-slate-200">{element.covalentRadius} Å</span>
        </div>
        <div className="truncate">
          <span className="text-slate-500">vdW Radius:</span>{' '}
          <span className="text-slate-200">{element.vanDerWaalsRadius} Å</span>
        </div>
        <div className="col-span-2 truncate">
          <span className="text-slate-500">Typical Valence:</span>{' '}
          <span className="text-slate-200">{element.typicalValence.join(', ')}</span>
        </div>
        <div className="col-span-2 truncate">
          <span className="text-slate-500">Config:</span>{' '}
          <span className="text-slate-200">{element.electronConfiguration}</span>
        </div>
      </div>
    </div>
  );
};
