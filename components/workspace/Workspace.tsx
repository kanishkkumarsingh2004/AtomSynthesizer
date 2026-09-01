'use client';

import React, { useEffect } from 'react';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { WorkspaceStatus } from './WorkspaceStatus';
import { PeriodicTable } from '../periodic-table/PeriodicTable';
import { Inspector } from '../inspector/Inspector';
import { MolecularCanvas } from '../molecular/MolecularCanvas';
import { QuantumAtomModal } from '../quantum/QuantumAtomModal';
import { SHORTCUTS } from '../../lib/shortcuts';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useUIStore } from '../../stores/uiStore';

export const Workspace: React.FC = () => {
  const setActiveTool = useWorkspaceStore((state) => state.setActiveTool);
  const toggleLivePhysics = useWorkspaceStore((state) => state.toggleLivePhysics);
  const livePhysicsEnabled = useWorkspaceStore((state) => state.livePhysicsEnabled);
  const showToast = useUIStore((state) => state.showToast);

  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);
  const selectedBondIds = useSelectionStore((state) => state.selectedBondIds);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const deleteSelection = useMoleculeStore((state) => state.deleteSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const sc of SHORTCUTS) {
        const matchesKey = e.key.toLowerCase() === sc.key.toLowerCase();
        const matchesCtrl = !!sc.ctrlOrCmd === (e.ctrlKey || e.metaKey);
        const matchesShift = !!sc.shift === e.shiftKey;

        if (matchesKey && matchesCtrl && matchesShift) {
          e.preventDefault();
          if (sc.tool) {
            setActiveTool(sc.tool);
          } else if (sc.action === 'undo') {
            undo();
          } else if (sc.action === 'redo') {
            redo();
          } else if (sc.action === 'deleteSelection') {
            if (selectedAtomIds.length > 0 || selectedBondIds.length > 0) {
              deleteSelection(selectedAtomIds, selectedBondIds);
              clearSelection();
            }
          } else if (sc.action === 'toggleLivePhysics') {
            const nextState = !useWorkspaceStore.getState().livePhysicsEnabled;
            toggleLivePhysics();
            showToast(`Live Physics & Thermal Vibrations ${nextState ? 'RESUMED (Active)' : 'PAUSED'}`);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, toggleLivePhysics, livePhysicsEnabled, showToast, undo, redo, selectedAtomIds, selectedBondIds, clearSelection, deleteSelection]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      <WorkspaceToolbar />

      <main className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
        <PeriodicTable />

        <div className="flex-1 h-full min-w-0 relative">
          <MolecularCanvas />
        </div>

        <Inspector />
      </main>

      <WorkspaceStatus />
      <QuantumAtomModal />
    </div>
  );
};
