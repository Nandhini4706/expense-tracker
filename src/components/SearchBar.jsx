import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="search" className="input pl-10 pr-9" placeholder="Search by title" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Search transactions by title" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600" aria-label="Clear search"><X size={16} /></button>
      )}
    </div>
  );
}
