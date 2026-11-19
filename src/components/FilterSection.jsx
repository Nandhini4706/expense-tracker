import { RotateCcw } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import { ALL_CATEGORIES, CATEGORIES } from '../utils/constants.js';

export const defaultFilters = { search: '', type: 'all', category: 'all', from: '', to: '', sort: 'newest' };

export default function FilterSection({ filters, setFilters }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const categories = filters.type === 'all' ? ALL_CATEGORIES : CATEGORIES[filters.type];
  const dirty = JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  const badRange = filters.from && filters.to && filters.from > filters.to;

  return (
    <div className="card space-y-4 p-4 sm:p-5">
      <SearchBar value={filters.search} onChange={(search) => set({ search })} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label" htmlFor="f-type">Type</label>
          {/* Changing type also resets the category so a stale category can't hide everything */}
          <select id="f-type" className="input" value={filters.type} onChange={(e) => set({ type: e.target.value, category: 'all' })}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-cat">Category</label>
          <select id="f-cat" className="input" value={filters.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-from">From</label>
          <input id="f-from" type="date" className="input" value={filters.from} max={filters.to || undefined} onChange={(e) => set({ from: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="f-to">To</label>
          <input id="f-to" type="date" className="input" value={filters.to} min={filters.from || undefined} onChange={(e) => set({ to: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className="input" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-rose-600">{badRange ? 'The start date must be on or before the end date.' : ''}</p>
        <button onClick={() => setFilters(defaultFilters)} disabled={!dirty} className="btn-secondary !py-2"><RotateCcw size={16} /> Reset filters</button>
      </div>
    </div>
  );
}
