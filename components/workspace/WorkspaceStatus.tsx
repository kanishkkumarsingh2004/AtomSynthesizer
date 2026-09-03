'use client';

import React, { useEffect } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useUIStore } from '../../stores/uiStore';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { ChemistryEngine } from '../../chemistry/core/ChemistryEngine';

import { SubscriptFormula } from '../common/SubscriptFormula';

export const WorkspaceStatus: React.FC = () => {
  const activeTool = useWorkspaceStore((state) => state.activeTool);
  const activeElementNumber = useWorkspaceStore((state) => state.activeElementNumber);
  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);
  const selectedBondIds = useSelectionStore((state) => state.selectedBondIds);
  const molecule = useMoleculeStore((state) => state.molecule);
  const toastMessage = useUIStore((state) => state.toastMessage);
  const clearToast = useUIStore((state) => state.clearToast);

  const activeElement = ElementRepository.getByAtomicNumber(activeElementNumber);
  const formula = ChemistryEngine.generateFormula(molecule);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  return (
    <footer className="flex h-7 w-full items-center justify-between border-t border-slate-800 bg-slate-950 px-3 text-[11px] font-mono text-slate-400">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-slate-500">Tool:</span>{' '}
          <span className="font-semibold text-slate-200 capitalize">{activeTool.replace('_', ' ')}</span>
        </div>

        {activeElement && (
          <div>
            <span className="text-slate-500">Active Element:</span>{' '}
            <span className="font-semibold text-blue-400">
              {activeElement.name} ({activeElement.symbol})
            </span>
          </div>
        )}

        {toastMessage && (
          <div className="rounded bg-blue-900/60 px-2 py-0.5 text-blue-200 border border-blue-700/60 animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {formula && (
          <div>
            <span className="text-slate-500">Formula:</span>{' '}
            <SubscriptFormula formula={formula} className="font-bold text-slate-200" />
          </div>
        )}

        <div>
          <span className="text-slate-500">Selection:</span>{' '}
          <span className="text-slate-300">
            {selectedAtomIds.length} atoms, {selectedBondIds.length} bonds
          </span>
        </div>

        <div>
          <span className="text-slate-500">Structure:</span>{' '}
          <span className="text-slate-300">
            {molecule.atoms.length} atoms | {molecule.bonds.length} bonds
          </span>
        </div>
      </div>
    </footer>
  );
};
