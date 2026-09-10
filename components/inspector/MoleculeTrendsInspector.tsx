'use client';

import React, { useState, useMemo } from 'react';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useReactionStore } from '../../stores/reactionStore';
import { MolecularAvailabilityEngine, MolecularAvailabilityResult } from '../../chemistry/core/MolecularAvailabilityEngine';
import { Sparkles, Activity, ShieldCheck, ShieldAlert, Flame, Trash2, History, Compass } from 'lucide-react';

export const MoleculeTrendsInspector: React.FC = () => {
  const molecule = useMoleculeStore((state) => state.molecule);
  const temperatureK = useWorkspaceStore((state) => state.temperatureK);
  const reactions = useReactionStore((state) => state.reactions);
  const clearReactions = useReactionStore((state) => state.clearReactions);

  const [activeTab, setActiveTab] = useState<'AVAILABILITY' | 'REACTION_HISTORY'>('AVAILABILITY');

  const availability: MolecularAvailabilityResult = useMemo(() => {
    return MolecularAvailabilityEngine.predictAvailability(molecule, temperatureK);
  }, [molecule, temperatureK]);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 shadow space-y-2.5 text-xs text-slate-300">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('AVAILABILITY')}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold border transition ${
              activeTab === 'AVAILABILITY'
                ? 'bg-cyan-950 border-cyan-600 text-cyan-300 shadow'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>3D Availability</span>
          </button>

          <button
            onClick={() => setActiveTab('REACTION_HISTORY')}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold border transition ${
              activeTab === 'REACTION_HISTORY'
                ? 'bg-amber-950 border-amber-600 text-amber-300 shadow'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-3 w-3 text-amber-400" />
            <span>Reaction Log ({reactions.length})</span>
          </button>
        </div>

        <span className="text-[9px] font-mono text-slate-500">Predicted AI</span>
      </div>

      {activeTab === 'AVAILABILITY' ? (
        <div className="space-y-2.5">
          {/* Stability Score Bar */}
          <div className="rounded bg-slate-950/80 p-2 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-300 uppercase">3D Molecular Stability</span>
              <span className={`font-mono font-extrabold ${
                availability.stabilityScore >= 75
                  ? 'text-emerald-400'
                  : availability.stabilityScore >= 55
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {availability.stabilityScore} / 100 ({availability.stabilityRating})
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  availability.stabilityScore >= 75
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : availability.stabilityScore >= 55
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-red-400'
                }`}
                style={{ width: `${availability.stabilityScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
              <span>Category:</span>
              <span className="font-bold text-cyan-300">{availability.availabilityCategory}</span>
            </div>
          </div>

          {/* Energetics Breakdown */}
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[9px] uppercase">ΔH°f (Formation)</span>
              <p className={`font-bold mt-0.5 ${availability.formationEnthalpyKJPerMol <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {availability.formationEnthalpyKJPerMol} <span className="text-[9px] font-normal text-slate-400">kJ/mol</span>
              </p>
            </div>

            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[9px] uppercase">ΔG°f (Gibbs Energy)</span>
              <p className={`font-bold mt-0.5 ${availability.gibbsFreeEnergyKJPerMol <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {availability.gibbsFreeEnergyKJPerMol} <span className="text-[9px] font-normal text-slate-400">kJ/mol</span>
              </p>
            </div>

            <div className="bg-slate-950 p-2 rounded border border-slate-800 col-span-2 flex items-center justify-between">
              <span className="text-slate-500 text-[9px] uppercase">Total Binding Energy (E_bind):</span>
              <span className="font-bold text-amber-300">{availability.bindingEnergyKJPerMol} kJ/mol</span>
            </div>
          </div>

          {/* Reaction Pathways & Redox Behavior */}
          <div className="rounded bg-slate-950/80 p-2 border border-slate-800 space-y-1 text-[10px]">
            <span className="font-bold text-purple-300 uppercase text-[9px]">Redox & Reactivity Profile</span>
            <p className="text-slate-300 leading-relaxed font-sans">{availability.redoxReactivity}</p>
            
            <div className="pt-1 border-t border-slate-900">
              <span className="text-slate-400 font-mono text-[9px] uppercase">Preferred Reaction Pathways:</span>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-300 font-mono text-[9.5px]">
                {availability.preferredPathways.map((pw, i) => (
                  <li key={i} className="text-cyan-300 font-semibold">{pw}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Reaction Log Tab */
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Recent Reaction Records</span>
            {reactions.length > 0 && (
              <button
                onClick={clearReactions}
                className="flex items-center gap-1 text-[9px] font-mono text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {reactions.length === 0 ? (
            <div className="p-3 text-center rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono text-[10px]">
              No reactions logged yet. Enable Live React or thermal motion to trigger reactions.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {reactions.map((rxn) => (
                <div key={rxn.id} className="p-2 rounded bg-slate-950 border border-slate-800/90 text-[10px] font-mono space-y-0.5">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-0.5">
                    <span className="font-bold text-amber-400">{rxn.reactionCategory}</span>
                    <span className="text-[9px] text-slate-500">{new Date(rxn.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200 text-[9.5px]">
                    <span className="text-cyan-300 font-bold">{rxn.reactantsSummary}</span> → <span className="text-emerald-300 font-bold">{rxn.productsSummary}</span>
                  </p>
                  <div className="flex justify-between text-[8.5px] text-slate-400 pt-0.5">
                    <span>ΔH: {rxn.deltaHKJPerMol} kJ/mol</span>
                    <span>T: {rxn.temperatureK} K</span>
                    <span>Ea: {rxn.activationEnergyKJPerMol} kJ/mol</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
