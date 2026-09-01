'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { X, Layers, Atom as AtomIcon, Sparkles, Filter } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { QuantumShellEngine } from '../../chemistry/core/QuantumShellEngine';
import { AtomicQuantumVisualizer } from '../molecular/AtomicQuantumVisualizer';
import { SPDFOrbitalRenderer } from './SPDFOrbitalRenderer';

export type QuantumViewMode = 'SHELL_KLMNOPQ' | 'SUBSHELL_SPDF';

export const QuantumAtomModal: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.quantumAtomViewEnabled);
  const toggleQuantumAtomView = useWorkspaceStore((state) => state.toggleQuantumAtomView);
  const activeElementNumber = useWorkspaceStore((state) => state.activeElementNumber);
  const molecule = useMoleculeStore((state) => state.molecule);
  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);

  const [viewMode, setViewMode] = useState<QuantumViewMode>('SHELL_KLMNOPQ');
  const [subshellFilter, setSubshellFilter] = useState<'ALL' | 's' | 'p' | 'd' | 'f'>('ALL');

  if (!isOpen) return null;

  // Determine target atomic number
  const selectedAtom =
    selectedAtomIds.length === 1
      ? molecule.atoms.find((a) => a.id === selectedAtomIds[0])
      : null;

  const targetAtomicNumber = selectedAtom ? selectedAtom.atomicNumber : activeElementNumber;
  const elementDef = ElementRepository.getByAtomicNumber(targetAtomicNumber);
  const quantumData = QuantumShellEngine.getQuantumStructure(targetAtomicNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded border font-bold text-sm shadow"
              style={{
                backgroundColor: (elementDef?.defaultColor || '#3b82f6') + '25',
                borderColor: elementDef?.defaultColor || '#3b82f6'
              }}
            >
              {elementDef?.symbol || 'Z'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{elementDef?.name || 'Quantum Atom'}</span>
                <span className="text-xs text-slate-400 font-mono">Z = {targetAtomicNumber}</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Mass: {elementDef?.atomicMass} g/mol</p>
            </div>
          </div>

          <button
            onClick={toggleQuantumAtomView}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View Mode Tabs & Subshell Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('SHELL_KLMNOPQ')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold border transition ${
                viewMode === 'SHELL_KLMNOPQ'
                  ? 'bg-blue-600 border-blue-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Bohr Shell View (K,L,M,N,O,P,Q)</span>
            </button>

            <button
              onClick={() => setViewMode('SUBSHELL_SPDF')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold border transition ${
                viewMode === 'SUBSHELL_SPDF'
                  ? 'bg-purple-600 border-purple-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <AtomIcon className="h-3.5 w-3.5" />
              <span>3D Orbital View (s, p, d, f)</span>
            </button>
          </div>

          {viewMode === 'SUBSHELL_SPDF' ? (
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <Filter className="h-3 w-3 text-purple-400 mr-0.5" />
              {(['ALL', 's', 'p', 'd', 'f'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSubshellFilter(filter)}
                  className={`rounded px-1.5 py-0.5 uppercase border transition ${
                    subshellFilter === filter
                      ? 'bg-purple-950 border-purple-600 text-purple-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
              {quantumData.spdfString}
            </span>
          )}
        </div>

        {/* Dedicated 3D Canvas Viewport in Popup Modal */}
        <div className="relative h-72 w-full bg-slate-950">
          <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[10, 10, 10]} intensity={1.3} castShadow />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />

            {viewMode === 'SHELL_KLMNOPQ' ? (
              <AtomicQuantumVisualizer
                atomicNumber={targetAtomicNumber}
                position={{ x: 0, y: 0, z: 0 }}
                scale={1.2}
              />
            ) : (
              <SPDFOrbitalRenderer
                quantumData={quantumData}
                selectedSubshellFilter={subshellFilter}
              />
            )}

            <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          </Canvas>

          {/* Interactive Hint Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[10px] font-mono bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            {viewMode === 'SUBSHELL_SPDF' ? (
              <>
                <span className="flex items-center gap-1 text-pink-400">● + Phase Lobe</span>
                <span className="flex items-center gap-1 text-cyan-400">● - Phase Lobe</span>
              </>
            ) : (
              <span className="text-slate-400">Rotate & zoom 3D atom independently</span>
            )}
          </div>
        </div>

        {/* Quantum Properties Details Footer */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-800 bg-slate-950/90 p-3 text-xs">
          <div className="rounded bg-slate-900/90 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Nucleus Structure</span>
            <p className="text-xs font-semibold text-slate-200 font-mono mt-1">
              <span className="text-red-400">{quantumData.protons} Protons</span> +{' '}
              <span className="text-blue-400">{quantumData.neutrons} Neutrons</span>
            </p>
          </div>

          <div className="rounded bg-slate-900/90 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Shells</span>
            <p className="text-xs font-semibold text-purple-300 font-mono mt-1 truncate">
              {quantumData.shells.map((s) => `${s.shellName}:${s.electronCount}`).join('  ')}
            </p>
          </div>

          <div className="rounded bg-slate-900/90 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Valence Electrons</span>
            <p className="text-xs font-bold text-emerald-400 font-mono mt-1">
              {quantumData.valenceElectrons} e⁻ in outer shell
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
