'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const ElementSearch: React.FC = () => {
  const query = useUIStore((state) => state.elementSearchQuery);
  const setQuery = useUIStore((state) => state.setElementSearchQuery);

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search elements (e.g. Oxygen, O, 8)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-slate-800 bg-slate-900/90 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};
