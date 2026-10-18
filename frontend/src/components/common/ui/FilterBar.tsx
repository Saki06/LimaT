import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  filters?: React.ReactNode;
}

export function FilterBar({ search, onSearchChange, searchLabel, filters }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e6ece8] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <span className="sr-only">{searchLabel}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchLabel} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#0d8b71] focus:ring-2 focus:ring-[#0d8b71]/20" />
      </label>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><SlidersHorizontal className="h-4 w-4" />{filters}</div>
    </div>
  );
}
