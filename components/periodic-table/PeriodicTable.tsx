'use client';

import React, { useMemo } from 'react';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { ElementTile } from './ElementTile';
import { ElementSearch } from './ElementSearch';
import { ElementDetails } from './ElementDetails';
import { useUIStore } from '../../stores/uiStore';

export const PeriodicTable: React.FC = () => {
  const searchQuery = useUIStore((state) => state.elementSearchQuery);
  const isOpen = useUIStore((state) => state.periodicTableOpen);

  const filteredElements = useMemo(() => {
    return ElementRepository.search(searchQuery);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <aside className="flex w-[310px] shrink-0 flex-col gap-2.5 border-r border-slate-800 bg-slate-950/95 p-2.5 text-slate-100 shadow-xl overflow-hidden z-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold tracking-wider text-slate-300 uppercase">
          Periodic Table
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">118 Elements</span>
      </div>

      <ElementSearch />

      <ElementDetails />

      <div className="flex-1 overflow-y-auto pr-0.5">
        <div className="grid grid-cols-4 gap-1">
          {filteredElements.map((element) => (
            <ElementTile key={element.atomicNumber} element={element} />
          ))}
        </div>
      </div>
    </aside>
  );
};
