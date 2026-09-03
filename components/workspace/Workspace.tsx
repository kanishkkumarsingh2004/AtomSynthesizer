'use client';

import React, { useEffect } from 'react';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { WorkspaceStatus } from './WorkspaceStatus';
import { PeriodicTable } from '../periodic-table/PeriodicTable';
import { Inspector } from '../inspector/Inspector';
import { MolecularCanvas } from '../molecular/MolecularCanvas';
import { QuantumAtomModal } from '../quantum/QuantumAtomModal';
import { MoleculeMarketplaceModal } from '../marketplace/MoleculeMarketplaceModal';
import { SHORTCUTS } from '../../lib/shortcuts';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useUIStore } from '../../stores/uiStore';

export const Workspace: React.FC = () => {
  const themeMode = useUIStore((state) => state.themeMode);
  const setActiveTool = useWorkspaceStore((state) => state.setActiveTool);
  const livePhysicsEnabled = useWorkspaceStore((state) => state.livePhysicsEnabled);
  const toggleLivePhysics = useWorkspaceStore((state) => state.toggleLivePhysics);
  const showToast = useUIStore((state) => state.showToast);

  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);
  const selectedBondIds = useSelectionStore((state) => state.selectedBondIds);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const deleteSelection = useMoleculeStore((state) => state.deleteSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }

      // Spacebar Pause / Resume shortcut handler
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const ws = useWorkspaceStore.getState();
        const currentlyActive = ws.livePhysicsEnabled || ws.reactionSimulationActive;
        const nextState = !currentlyActive;

        ws.setLivePhysicsEnabled(nextState);
        ws.setReactionSimulationActive(nextState);
        showToast(`3D Thermal Motion & Physics ${nextState ? 'RESUMED (Space)' : 'PAUSED (Space)'}`);
        return;
      }

      for (const sc of SHORTCUTS) {
        if (sc.key === ' ') continue; // Handled above

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
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, showToast, undo, redo, selectedAtomIds, selectedBondIds, clearSelection, deleteSelection]);

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden font-sans select-none transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
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
      <MoleculeMarketplaceModal />
    </div>
  );
};
