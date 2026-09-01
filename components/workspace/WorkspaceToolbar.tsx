'use client';

import React, { useRef } from 'react';
import {
  MousePointer,
  Move,
  RotateCw,
  PlusCircle,
  Link,
  Trash2,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Layers,
  SlidersHorizontal,
  Flame,
  Zap,
  Sparkles,
  Activity
} from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useUIStore } from '../../stores/uiStore';
import { JsonExporter } from '../../chemistry/exporters/JsonExporter';
import { JsonParser } from '../../chemistry/parsers/JsonParser';
import { PersistenceService } from '../../application/services/PersistenceService';
import { WorkspaceTool } from '../../domain/molecular/MolecularTypes';

export const WorkspaceToolbar: React.FC = () => {
  const activeTool = useWorkspaceStore((state) => state.activeTool);
  const setActiveTool = useWorkspaceStore((state) => state.setActiveTool);
  const renderingMode = useWorkspaceStore((state) => state.renderingMode);
  const setRenderingMode = useWorkspaceStore((state) => state.setRenderingMode);
  const autoBondingEnabled = useWorkspaceStore((state) => state.autoBondingEnabled);
  const setAutoBondingEnabled = useWorkspaceStore((state) => state.setAutoBondingEnabled);
  const reactionSimulationActive = useWorkspaceStore((state) => state.reactionSimulationActive);
  const toggleReactionSimulation = useWorkspaceStore((state) => state.toggleReactionSimulation);
  const togglePeriodicTable = useUIStore((state) => state.togglePeriodicTable);
  const toggleInspector = useUIStore((state) => state.toggleInspector);
  const showToast = useUIStore((state) => state.showToast);

  const canUndo = useHistoryStore((state) => state.canUndo);
  const canRedo = useHistoryStore((state) => state.canRedo);
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);

  const molecule = useMoleculeStore((state) => state.molecule);
  const setMolecule = useMoleculeStore((state) => state.setMolecule);
  const triggerAutoBonding = useMoleculeStore((state) => state.triggerAutoBonding);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools: { id: WorkspaceTool; label: string; shortcut: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer },
    { id: 'move', label: 'Move', shortcut: 'M', icon: Move },
    { id: 'rotate', label: 'Rotate', shortcut: 'R', icon: RotateCw },
    { id: 'add_atom', label: 'Add Atom', shortcut: 'A', icon: PlusCircle },
    { id: 'create_bond', label: 'Create Bond', shortcut: 'B', icon: Link },
    { id: 'delete', label: 'Delete', shortcut: 'D', icon: Trash2 }
  ];

  const handleExportJson = () => {
    const jsonStr = JsonExporter.exportMolecule(molecule);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${molecule.name || 'molecule'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Molecule exported to JSON!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JsonParser.parseMolecule(text);
        setMolecule(imported);
        showToast(`Successfully imported molecule (${imported.atoms.length} atoms)!`);
      } catch (err: any) {
        showToast(`Import error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveLocal = async () => {
    try {
      await PersistenceService.saveMolecule(molecule);
      showToast('Project saved to local storage!');
    } catch (err: any) {
      showToast(`Save error: ${err.message}`);
    }
  };

  const handleTriggerAutoBonding = () => {
    triggerAutoBonding();
    showToast('Auto-bonding applied to current atoms!');
  };

  return (
    <header className="flex h-11 shrink-0 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-2.5 text-slate-100 shadow-md backdrop-blur-md z-30 gap-2 overflow-x-auto no-scrollbar">
      {/* Brand & Sidebars Toggles */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white text-xs shadow">
            ⚛
          </div>
          <span className="text-xs font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
            AtomSynthesizer
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <button
          onClick={togglePeriodicTable}
          className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition"
          title="Toggle Periodic Table Panel"
        >
          <Layers className="h-3 w-3 text-blue-400" />
          <span className="hidden md:inline">Periodic Table</span>
        </button>
      </div>

      {/* Center Tool Buttons */}
      <div className="flex items-center gap-1 rounded-md border border-slate-800/80 bg-slate-900/90 p-0.5 shrink-0">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden xl:inline">{t.label}</span>
              <span className="text-[9px] font-mono opacity-60">[{t.shortcut}]</span>
            </button>
          );
        })}

        <div className="mx-0.5 h-3.5 w-px bg-slate-800" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-0.5 h-3.5 w-px bg-slate-800" />

        {/* Auto-Bonding */}
        <button
          onClick={() => setAutoBondingEnabled(!autoBondingEnabled)}
          title="Toggle automatic bonding on proximity"
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium border transition ${
            autoBondingEnabled
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <Zap className="h-3 w-3" />
          <span className="hidden lg:inline">Auto-Bond</span>
        </button>

        <button
          onClick={handleTriggerAutoBonding}
          title="Auto-Bond All (Sparkles)"
          className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[11px] text-amber-400 hover:bg-slate-800"
        >
          <Sparkles className="h-3 w-3" />
        </button>

        {/* Live Reaction Simulation */}
        <button
          onClick={toggleReactionSimulation}
          title="Toggle Thermal Motion & Reaction Simulation"
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium border transition ${
            reactionSimulationActive
              ? 'bg-amber-950/90 border-amber-600 text-amber-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="h-3 w-3 text-amber-500" />
          <span className="hidden lg:inline">Live React</span>
        </button>

        {/* Quantum Atom Shell & Orbit Visualizer Toggle */}
        <button
          onClick={() => useWorkspaceStore.getState().toggleQuantumAtomView()}
          title="Toggle 3D Quantum Nucleus & Concentric K,L,M,N,O,P,Q Orbit Shells (spdf)"
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold border transition ${
            useWorkspaceStore((state) => state.quantumAtomViewEnabled)
              ? 'bg-purple-950/90 border-purple-600 text-purple-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3 w-3 text-purple-400" />
          <span className="hidden lg:inline">Quantum Orbits</span>
        </button>

        {/* Explosion Dissociation Physics */}
        <button
          onClick={() => {
            const res = useMoleculeStore.getState().triggerExplosion();
            showToast(res.summary);
          }}
          title="Trigger chemical explosion & dissociation for unstable species"
          className="flex items-center gap-1 rounded bg-rose-950/90 border border-rose-700/80 px-2 py-0.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-900"
        >
          <Flame className="h-3 w-3 text-rose-400" />
          <span className="hidden lg:inline">Explode</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={renderingMode}
          onChange={(e: any) => setRenderingMode(e.target.value)}
          className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[11px] font-mono text-slate-300 focus:outline-none"
        >
          <option value="BALL_AND_STICK">Ball & Stick</option>
          <option value="SPACE_FILLING">Space Filling</option>
          <option value="STICK">Stick</option>
          <option value="WIREFRAME">Wireframe</option>
        </select>

        <button
          onClick={handleSaveLocal}
          title="Save Project (Local)"
          className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Save className="h-3 w-3" />
          <span className="hidden lg:inline">Save</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Molecule JSON"
          className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Upload className="h-3 w-3" />
          <span className="hidden lg:inline">Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className="hidden"
        />

        <button
          onClick={handleExportJson}
          title="Export Molecule JSON"
          className="flex items-center gap-1 rounded bg-blue-600 hover:bg-blue-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow"
        >
          <Download className="h-3 w-3" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={toggleInspector}
          className="flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          title="Toggle Inspector Panel"
        >
          <SlidersHorizontal className="h-3 w-3 text-purple-400" />
        </button>
      </div>
    </header>
  );
};
