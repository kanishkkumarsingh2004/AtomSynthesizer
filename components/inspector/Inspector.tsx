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

  // Resizable width state (Default 370px, minimum 320px, maximum 650px)
  const [width, setWidth] = React.useState<number>(370);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate width relative to window right edge
      const newWidth = Math.max(320, Math.min(650, window.innerWidth - e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
    <aside
      style={{ width: `${width}px` }}
      className="relative flex shrink-0 flex-col gap-3 border-l border-slate-800 bg-slate-950/95 p-3 text-slate-100 shadow-xl overflow-y-auto z-20 transition-all select-none"
    >
      {/* Left Border Drag Handle for Resizing Width */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag to resize Inspector width"
        className={`absolute top-0 left-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-cyan-400 active:bg-cyan-500 transition-colors z-30 ${
          isResizing ? 'bg-cyan-400' : 'bg-transparent'
        }`}
      />

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
