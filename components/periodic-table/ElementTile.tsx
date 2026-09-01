'use client';

import React from 'react';
import { ElementDefinition } from '../../domain/elements/Element';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { cn } from '../../lib/utils';

interface ElementTileProps {
  element: ElementDefinition;
  onSelectDetails?: (element: ElementDefinition) => void;
}

export const ElementTile: React.FC<ElementTileProps> = ({ element, onSelectDetails }) => {
  const activeElementNumber = useWorkspaceStore((state) => state.activeElementNumber);
  const setActiveElementNumber = useWorkspaceStore((state) => state.setActiveElementNumber);
  const setActiveTool = useWorkspaceStore((state) => state.setActiveTool);

  const isActive = activeElementNumber === element.atomicNumber;

  const handleClick = (e: React.MouseEvent) => {
    setActiveElementNumber(element.atomicNumber);
    setActiveTool('add_atom');
    if (onSelectDetails) {
      onSelectDetails(element);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{ borderColor: element.defaultColor }}
      title={`${element.name} (${element.symbol}) - Atomic #${element.atomicNumber}`}
      className={cn(
        'group relative flex flex-col justify-between rounded p-1 text-left transition-all hover:scale-105 hover:z-10 focus:outline-none border border-slate-800 bg-slate-900/90 hover:bg-slate-800 shadow h-11 w-full',
        isActive && 'ring-2 ring-blue-500 bg-slate-800 font-bold border-blue-400'
      )}
    >
      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono leading-none">
        <span>{element.atomicNumber}</span>
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: element.defaultColor }}
        />
      </div>
      <div className="text-center text-xs font-extrabold text-slate-100 font-mono leading-tight">
        {element.symbol}
      </div>
      <div className="truncate text-center text-[8px] text-slate-400 font-sans leading-none">
        {element.name}
      </div>
    </button>
  );
};
