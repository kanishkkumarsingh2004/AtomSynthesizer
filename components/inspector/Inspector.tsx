'use client';

import React from 'react';
import { useSelectionStore } from '../../stores/selectionStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useUIStore } from '../../stores/uiStore';
import { AtomInspector } from './AtomInspector';
import { BondInspector } from './BondInspector';
import { MoleculeInspector } from './MoleculeInspector';

export const Inspector: React.FC = () => {
  const isOpen = useUIStore((state) => state.inspectorOpen);
  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);
  const selectedBondIds = useSelectionStore((state) => state.selectedBondIds);
  const molecule = useMoleculeStore((state) => state.molecule);

  if (!isOpen) return null;

  const selectedAtom =
    selectedAtomIds.length === 1
      ? molecule.atoms.find((a) => a.id === selectedAtomIds[0])
      : null;

  const selectedBond =
    selectedBondIds.length === 1
      ? molecule.bonds.find((b) => b.id === selectedBondIds[0])
      : null;

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-3 border-l border-slate-800 bg-slate-950/95 p-3 text-slate-100 shadow-xl overflow-y-auto z-20">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-xs font-extrabold tracking-wider text-slate-300 uppercase">
          Inspector
        </h2>
        <span className="text-[10px] text-slate-400 font-mono">
          {selectedAtom
            ? 'Atom Selected'
            : selectedBond
            ? 'Bond Selected'
            : 'Molecule Properties'}
        </span>
      </div>

      {selectedAtom ? (
        <AtomInspector atom={selectedAtom} />
      ) : selectedBond ? (
        <BondInspector bond={selectedBond} />
      ) : (
        <MoleculeInspector />
      )}
    </aside>
  );
};
