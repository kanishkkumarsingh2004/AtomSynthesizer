'use client';

import React from 'react';
import { Atom } from '../../domain/molecular/Atom';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Vector3D } from '../../domain/molecular/MolecularTypes';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { QuantumShellEngine } from '../../chemistry/core/QuantumShellEngine';

interface AtomInspectorProps {
  atom: Atom;
}

export const AtomInspector: React.FC<AtomInspectorProps> = ({ atom }) => {
  const molecule = useMoleculeStore((state) => state.molecule);
  const moveAtom = useMoleculeStore((state) => state.moveAtom);
  const changeAtomCharge = useMoleculeStore((state) => state.changeAtomCharge);

  const elDef = ElementRepository.getByAtomicNumber(atom.atomicNumber);
  const graph = MolecularGraph.fromMolecule(molecule);
  const bonds = graph.getBondsForAtom(atom.id);
  const valence = graph.calculateValence(atom.id);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const oldPos = { ...atom.position };
    const newPos: Vector3D = { ...atom.position, [axis]: num };
    moveAtom(atom.id, oldPos, newPos);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded border border-slate-700 font-bold text-white shadow"
          style={{ backgroundColor: elDef ? elDef.defaultColor + '33' : '#333' }}
        >
          {elDef ? elDef.symbol : `E${atom.atomicNumber}`}
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">{elDef ? elDef.name : 'Atom'}</h3>
          <p className="text-[10px] text-slate-400 font-mono">ID: {atom.id}</p>
        </div>
      </div>

      {/* Charge control */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-slate-400">Formal Charge</label>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changeAtomCharge(atom.id, atom.formalCharge - 1)}
            className="rounded bg-slate-800 px-2 py-1 font-bold text-slate-200 hover:bg-slate-700"
          >
            -
          </button>
          <span className="w-8 text-center font-mono font-semibold text-amber-400">
            {atom.formalCharge > 0 ? `+${atom.formalCharge}` : atom.formalCharge}
          </span>
          <button
            onClick={() => changeAtomCharge(atom.id, atom.formalCharge + 1)}
            className="rounded bg-slate-800 px-2 py-1 font-bold text-slate-200 hover:bg-slate-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Position controls */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-slate-400">Position (Å)</label>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis} className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{axis}:</span>
              <input
                type="number"
                step="0.1"
                value={atom.position[axis]}
                onChange={(e) => handlePositionChange(axis, e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Atom chemical stats */}
      <div className="flex flex-col gap-1 border-t border-slate-800 pt-2 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Atomic Number:</span>
          <span className="font-mono text-slate-300">{atom.atomicNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Atomic Mass:</span>
          <span className="font-mono text-slate-300">{elDef ? elDef.atomicMass : 12.0} amu</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pauling Electronegativity (χ):</span>
          <span className="font-mono text-cyan-300 font-bold">{elDef ? elDef.electronegativity : 2.2}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Connected Bonds:</span>
          <span className="font-mono text-slate-300">{bonds.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Current Valence:</span>
          <span className="font-mono text-slate-300">{valence}</span>
        </div>
        {elDef && (
          <div className="flex justify-between">
            <span className="text-slate-500">Covalent Radius:</span>
            <span className="font-mono text-slate-300">{elDef.covalentRadius} Å</span>
          </div>
        )}
      </div>

      {/* Detailed Quantum Chemistry & Quark Nucleon Breakdown */}
      <div className="rounded border border-slate-800 bg-slate-900/90 p-2 text-[10px] font-mono space-y-1.5 shadow">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-purple-400 font-bold uppercase text-[10px]">
          <span>Quantum & Quark Structure</span>
          <button
            onClick={() => useWorkspaceStore.getState().setQuantumAtomViewEnabled(true)}
            className="rounded bg-purple-950 px-1.5 py-0.5 text-[9px] text-purple-300 border border-purple-700 hover:bg-purple-900 transition"
          >
            Inspect 3D
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[9.5px]">
          <div>
            <span className="text-slate-500">Valence VOIP:</span>{' '}
            <span className="text-amber-300 font-bold">
              {atom.atomicNumber === 1 ? '13.60 eV' : atom.atomicNumber === 6 ? '11.26 eV' : atom.atomicNumber === 7 ? '14.53 eV' : '15.85 eV'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Hybridization:</span>{' '}
            <span className="text-emerald-300 font-bold">
              {bonds.length === 4 ? 'sp³ (Tetrahedral)' : bonds.length === 3 ? 'sp² (Trigonal)' : bonds.length === 2 ? 'sp (Linear)' : 's (Terminal)'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-slate-500">Subshell Config:</span>
          <p className="text-purple-300 font-bold truncate">{QuantumShellEngine.getQuantumStructure(atom.atomicNumber).spdfString}</p>
        </div>

        {/* Sub-Nucleon Quarks (u & d) */}
        <div className="rounded bg-slate-950 p-1.5 border border-slate-800 text-[9px] space-y-1">
          <div className="text-slate-400 font-bold border-b border-slate-900 pb-0.5">
            Nucleus ({QuantumShellEngine.getQuantumStructure(atom.atomicNumber).protons} p⁺, {QuantumShellEngine.getQuantumStructure(atom.atomicNumber).neutrons} n⁰) & Quarks:
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div>
              <span className="text-rose-400 font-bold">Protons (p⁺):</span>{' '}
              <span className="text-slate-300 font-bold">uud</span>
              <span className="text-[8px] text-slate-500 font-sans block">(2 Up + 1 Down)</span>
            </div>
            <div>
              <span className="text-sky-400 font-bold">Neutrons (n⁰):</span>{' '}
              <span className="text-slate-300 font-bold">udd</span>
              <span className="text-[8px] text-slate-500 font-sans block">(1 Up + 2 Down)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/80 text-center">
          {QuantumShellEngine.getQuantumStructure(atom.atomicNumber).shells.map((s) => (
            <div key={s.shellName} className="rounded bg-slate-950 p-1 border border-slate-800">
              <span className="text-purple-400 font-bold">{s.shellName}</span>
              <p className="text-slate-200">{s.electronCount} e⁻</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
