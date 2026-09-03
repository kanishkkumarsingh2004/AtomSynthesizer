'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Atom,
  Flame,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { MOLECULE_PRESETS, MoleculePreset } from '../../chemistry/library/MoleculePresets';

export const MoleculeMarketplaceModal: React.FC = () => {
  const isOpen = useUIStore((state) => state.marketplaceOpen);
  const setMarketplaceOpen = useUIStore((state) => state.setMarketplaceOpen);
  const showToast = useUIStore((state) => state.showToast);
  const setMolecule = useMoleculeStore((state) => state.setMolecule);
  const recenterMolecule = useMoleculeStore((state) => state.recenterMolecule);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = [
    'ALL',
    'Alkanes',
    'Aromatics',
    'Gases & Solvents',
    'Carbonyls & Alcohols',
    'Biomolecules'
  ];

  const filteredPresets = MOLECULE_PRESETS.filter((preset) => {
    const matchesCategory =
      selectedCategory === 'ALL' || preset.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      preset.name.toLowerCase().includes(q) ||
      preset.iupacName.toLowerCase().includes(q) ||
      preset.formula.toLowerCase().includes(q) ||
      preset.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleLoadPreset = (preset: MoleculePreset) => {
    try {
      const mol = preset.builder();
      setMolecule(mol);
      recenterMolecule();
      useWorkspaceStore.getState().setReactionSimulationActive(true);
      useWorkspaceStore.getState().setLivePhysicsEnabled(true);
      setMarketplaceOpen(false);
      showToast(`Loaded ${preset.name} (${preset.formula}) — Quantum calculations & 3D simulation active!`);
    } catch (err: any) {
      showToast(`Error loading preset: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 shadow-md">
              <ShoppingBag className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                  Molecule Marketplace
                </h2>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-slate-700">
                  Pre-built 3D Library
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instant VSEPR-relaxed 3D structures — Load methane, isobutane, neopentane, benzene & more
              </p>
            </div>
          </div>

          <button
            onClick={() => setMarketplaceOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex shrink-0 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/60 p-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, IUPAC formula (e.g. Methane, Isobutane, C4H10, Benzene)..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          {filteredPresets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <Atom className="h-12 w-12 text-slate-700 mb-3 animate-spin" />
              <p className="text-sm font-semibold text-slate-400">No molecules found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-600 mt-1">Try searching for Methane, Isobutane, Neopentane, Water, CO2, Benzene or clear filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Preset Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-indigo-300 transition">
                          {preset.name}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                          {preset.iupacName}
                        </p>
                      </div>

                      <span className="rounded-lg bg-indigo-950/80 border border-indigo-700/60 px-2.5 py-1 font-mono text-xs font-bold text-indigo-200 shadow-sm">
                        {preset.formula}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  {/* Physical Properties Badges */}
                  <div>
                    <div className="grid grid-cols-2 gap-1.5 mb-3 text-[10px] font-mono">
                      <div className="rounded bg-slate-900/90 border border-slate-800/80 p-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Atoms/Bonds</span>
                        <span className="font-semibold text-cyan-300">{preset.atomCount}A / {preset.bondCount}B</span>
                      </div>

                      <div className="rounded bg-slate-900/90 border border-slate-800/80 p-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Symmetry</span>
                        <span className="font-semibold text-indigo-300">{preset.pointGroup}</span>
                      </div>

                      <div className="rounded bg-slate-900/90 border border-slate-800/80 p-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Polarizability α</span>
                        <span className="font-semibold text-emerald-300">{preset.polarizability} Å³</span>
                      </div>

                      <div className="rounded bg-slate-900/90 border border-slate-800/80 p-1.5 flex items-center justify-between">
                        <span className="text-slate-500">Dipole |μ|</span>
                        <span className="font-semibold text-amber-300">{preset.dipoleMoment} D</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white shadow-md shadow-indigo-950/50 transition active:scale-[0.98]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Load 3D Structure</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>All structures pre-optimized with VSEPR force fields & exact 3D Cartesian coordinates.</span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            {MOLECULE_PRESETS.length} Molecules in Library
          </div>
        </div>
      </div>
    </div>
  );
};
