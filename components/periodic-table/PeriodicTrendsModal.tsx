'use client';

import React, { useState, useMemo } from 'react';
import { X, TrendingUp, ShieldAlert, Zap, ArrowRight, ArrowUp, Info, Search, Layers } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { PeriodicTrendsEngine, PeriodicTrendData } from '../../chemistry/core/PeriodicTrendsEngine';

export type TrendsTab = 'PERIODIC_TRENDS' | 'ACTIVITY_SERIES';

export const PeriodicTrendsModal: React.FC = () => {
  const isOpen = useUIStore((state) => state.periodicTrendsOpen);
  const togglePeriodicTrends = useUIStore((state) => state.togglePeriodicTrends);
  const setPeriodicTableOpen = useUIStore((state) => state.setPeriodicTableOpen);

  const [activeTab, setActiveTab] = useState<TrendsTab>('PERIODIC_TRENDS');
  const [selectedAtomicNumber, setSelectedAtomicNumber] = useState<number>(11); // Default Sodium (Na)
  const [searchFilter, setSearchFilter] = useState<string>('');

  const trendData: PeriodicTrendData | null = useMemo(() => {
    return PeriodicTrendsEngine.getElementTrendData(selectedAtomicNumber);
  }, [selectedAtomicNumber]);

  const activitySeries = useMemo(() => {
    return PeriodicTrendsEngine.getActivitySeries();
  }, []);

  const filteredElements = useMemo(() => {
    if (!searchFilter.trim()) return ElementRepository.getAll().slice(0, 36);
    return ElementRepository.search(searchFilter);
  }, [searchFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Periodic Table Trends & Metal Activity Series</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Electronegativity, Ionization Energy, Atomic Radius & Electrochemical Reactivity
              </p>
            </div>
          </div>

          <button
            onClick={togglePeriodicTrends}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-5 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('PERIODIC_TRENDS')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold border transition ${
                activeTab === 'PERIODIC_TRENDS'
                  ? 'bg-blue-600 border-blue-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Periodic Trends Diagram</span>
            </button>

            <button
              onClick={() => setActiveTab('ACTIVITY_SERIES')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold border transition ${
                activeTab === 'ACTIVITY_SERIES'
                  ? 'bg-amber-600 border-amber-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Metal Activity Series (Electrochemical Order)</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Interactive Quantum Chemical Visualizer
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'PERIODIC_TRENDS' ? (
            <div className="space-y-6">
              {/* Trends Vector Diagram Box */}
              <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 p-5 shadow-inner overflow-hidden">
                <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  <Info className="h-3 w-3" />
                  <span>3D Vector Gradient Representation</span>
                </div>

                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">
                  Periodic Trends Vector Map
                </h3>

                {/* Vector Layout Container */}
                <div className="relative grid grid-cols-12 gap-3 p-4 bg-slate-900/60 rounded-lg border border-slate-800/80">
                  
                  {/* Top Trend Vector: Left to Right Increase */}
                  <div className="col-span-12 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900/80 p-2.5 rounded border border-blue-800/50 text-xs font-mono">
                    <span className="text-slate-400 font-semibold">PERIODIC GROUPS (1 → 18)</span>
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <span>INCREASING: Ionization Energy, Electronegativity, Electron Affinity</span>
                      <ArrowRight className="h-4 w-4 text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Left Side Vector: Downward Increase for Radius & Metallic character */}
                  <div className="col-span-3 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-emerald-950/80 to-teal-900/80 p-3 rounded border border-emerald-800/50 text-xs font-mono">
                    <div>
                      <span className="text-emerald-400 font-bold">PERIODS (1 ↓ 7)</span>
                      <p className="text-[10px] text-slate-400 mt-1">Increasing Atomic Radius & Metallic Character</p>
                    </div>
                    <div className="flex justify-center my-3">
                      <ArrowUp className="h-6 w-6 text-emerald-400 rotate-180 animate-bounce" />
                    </div>
                    <div className="text-[10px] text-emerald-300 bg-emerald-950/80 p-1.5 rounded border border-emerald-800 text-center font-bold">
                      Larger Cations / Metallic Reactivity
                    </div>
                  </div>

                  {/* Periodic Table Grid Mockup */}
                  <div className="col-span-9 grid grid-cols-8 gap-1.5 p-3 bg-slate-950/90 rounded border border-slate-800 text-center">
                    {[
                      { z: 1, s: 'H', category: 'nonmetal' },
                      { z: 2, s: 'He', category: 'noble-gas' },
                      { z: 3, s: 'Li', category: 'alkali-metal' },
                      { z: 4, s: 'Be', category: 'alkaline-earth' },
                      { z: 6, s: 'C', category: 'nonmetal' },
                      { z: 7, s: 'N', category: 'nonmetal' },
                      { z: 8, s: 'O', category: 'nonmetal' },
                      { z: 9, s: 'F', category: 'halogen' },
                      { z: 11, s: 'Na', category: 'alkali-metal' },
                      { z: 12, s: 'Mg', category: 'alkaline-earth' },
                      { z: 13, s: 'Al', category: 'post-transition' },
                      { z: 14, s: 'Si', category: 'metalloid' },
                      { z: 15, s: 'P', category: 'nonmetal' },
                      { z: 16, s: 'S', category: 'nonmetal' },
                      { z: 17, s: 'Cl', category: 'halogen' },
                      { z: 18, s: 'Ar', category: 'noble-gas' },
                      { z: 19, s: 'K', category: 'alkali-metal' },
                      { z: 20, s: 'Ca', category: 'alkaline-earth' },
                      { z: 26, s: 'Fe', category: 'transition-metal' },
                      { z: 29, s: 'Cu', category: 'transition-metal' },
                      { z: 30, s: 'Zn', category: 'transition-metal' },
                      { z: 35, s: 'Br', category: 'halogen' },
                      { z: 47, s: 'Ag', category: 'transition-metal' },
                      { z: 79, s: 'Au', category: 'transition-metal' }
                    ].map((item) => (
                      <button
                        key={item.z}
                        onClick={() => setSelectedAtomicNumber(item.z)}
                        className={`flex flex-col items-center justify-center p-2 rounded transition border text-xs font-bold font-mono ${
                          selectedAtomicNumber === item.z
                            ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50 scale-105 z-10'
                            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-[9px] opacity-60 font-sans">{item.z}</span>
                        <span className="text-sm">{item.s}</span>
                      </button>
                    ))}
                  </div>

                  {/* Bottom Trend Summary */}
                  <div className="col-span-12 grid grid-cols-2 gap-3 mt-1">
                    <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/60 text-xs">
                      <div className="font-bold text-blue-300 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        <span>Ionization Energy & Electronegativity</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Increases UP and RIGHT towards Fluorine (F). Fluorine has highest electronegativity (3.98 Pauling).
                      </p>
                    </div>

                    <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60 text-xs">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 rotate-180" />
                        <span>Atomic Radius & Metallic Character</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Increases DOWN and LEFT towards Francium (Fr) & Cesium (Cs). Alkali metals have the largest atomic radii.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Element Detailed Trend Inspector */}
              {trendData && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl font-extrabold text-xl text-white shadow-lg border"
                        style={{
                          backgroundColor: (trendData.element.defaultColor || '#3b82f6') + '30',
                          borderColor: trendData.element.defaultColor || '#3b82f6'
                        }}
                      >
                        {trendData.element.symbol}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <span>{trendData.element.name}</span>
                          <span className="text-xs text-slate-400 font-mono">Z = {trendData.element.atomicNumber}</span>
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Period {trendData.element.period} • Group {trendData.element.group} • {trendData.metallicClassification}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs text-slate-400 uppercase">Activity Series Rank</span>
                      <p className={`text-sm font-bold ${trendData.activitySeriesRank > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {trendData.activitySeriesRank > 0 ? `#${trendData.activitySeriesRank} of 21` : 'Non-metal'}
                      </p>
                    </div>
                  </div>

                  {/* Quantitative Trend Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Atomic Radius</span>
                      <p className="text-base font-bold text-emerald-400 font-mono mt-1">
                        {trendData.atomicRadiusPm} <span className="text-xs font-normal">pm</span>
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Ionization Energy</span>
                      <p className="text-base font-bold text-cyan-400 font-mono mt-1">
                        {trendData.ionizationEnergyKjPerMol} <span className="text-xs font-normal">kJ/mol</span>
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Electronegativity</span>
                      <p className="text-base font-bold text-purple-400 font-mono mt-1">
                        {trendData.electronegativityPauling ? trendData.electronegativityPauling.toFixed(2) : 'N/A'} <span className="text-xs font-normal">Pauling</span>
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Electron Affinity</span>
                      <p className="text-base font-bold text-amber-400 font-mono mt-1">
                        {trendData.electronAffinityKjPerMol} <span className="text-xs font-normal">kJ/mol</span>
                      </p>
                    </div>
                  </div>

                  {/* Oxidation & Abundance Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Oxidation Tendency</span>
                      <p className="text-slate-200 mt-1 font-semibold">{trendData.oxidationTendency}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Natural Abundance</span>
                      <p className="text-slate-200 mt-1 font-semibold">{trendData.abundanceCategory}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Metal Activity Series Tab matching Reference Image 5 */
            <div className="space-y-5">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Electrochemical Activity Series (Standard Reduction Potentials)</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Li → Au (Highest → Lowest Oxidation)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Metals higher in the activity series displace metals below them from aqueous solutions and react more vigorously with water and acids to evolve Hydrogen gas ($H_2$).
                </p>
              </div>

              {/* Activity Series Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Rank</th>
                        <th className="px-4 py-2.5">Element</th>
                        <th className="px-4 py-2.5">Symbol</th>
                        <th className="px-4 py-2.5">Half-Reaction (Oxidation)</th>
                        <th className="px-4 py-2.5">Reactivity Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activitySeries.map((item) => {
                        let badgeColor = 'bg-slate-900 text-slate-300 border-slate-800';
                        let categoryText = 'Noble Metal (Resists Oxidation)';
                        if (item.rank <= 5) {
                          badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                          categoryText = 'Reacts violently with cold water to give H₂';
                        } else if (item.rank <= 15) {
                          badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                          categoryText = 'Reacts with mineral acids (HCl, H₂SO₄) to give H₂';
                        } else if (item.symbol === 'H') {
                          badgeColor = 'bg-blue-950 text-blue-300 border-blue-800';
                          categoryText = 'Standard Reference Electrode (0.00 V)';
                        }

                        return (
                          <tr
                            key={item.symbol}
                            onClick={() => {
                              const el = ElementRepository.getBySymbol(item.symbol);
                              if (el) setSelectedAtomicNumber(el.atomicNumber);
                            }}
                            className="hover:bg-slate-900/80 cursor-pointer transition"
                          >
                            <td className="px-4 py-2 font-bold text-amber-400">#{item.rank}</td>
                            <td className="px-4 py-2 font-bold text-slate-100">{item.label}</td>
                            <td className="px-4 py-2 font-bold text-cyan-300">{item.symbol}</td>
                            <td className="px-4 py-2 text-slate-300">{item.reaction}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeColor}`}>
                                {categoryText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/90 px-5 py-3 shrink-0">
          <button
            onClick={() => setPeriodicTableOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Open Sidebar Table</span>
          </button>

          <button
            onClick={togglePeriodicTrends}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-bold text-white shadow transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
