import type { SortKey } from '../types';
import { parseSortKey } from '../sort';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  sortKey: SortKey;
  onSortChange: (v: SortKey) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (v: 'list' | 'grid') => void;
  placeholder: string;
  tint: 'canopy' | 'accent';
}

export default function ToolbarControls({
  search, onSearchChange, sortKey, onSortChange,
  viewMode, onViewModeChange, placeholder, tint,
}: Props) {
  const activeBg = tint === 'canopy' ? 'bg-canopy-soft' : 'bg-accent-soft';
  const activeText = tint === 'canopy' ? 'text-canopy' : 'text-accent';
  return (
    <>
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 max-w-full md:max-w-md border border-border rounded px-3 py-1.5 text-sm"
      />
      <div className="ml-auto hidden md:flex items-center gap-3">
        <select
          value={sortKey}
          onChange={(e) => onSortChange(parseSortKey(e.target.value))}
          className="text-xs border border-border rounded px-2 py-1 bg-surface"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name-asc">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="largest">Largest first</option>
          <option value="smallest">Smallest first</option>
          <option value="type">Type</option>
        </select>
        <div className="flex border border-border rounded overflow-hidden text-xs">
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-2 py-1 ${viewMode === 'list' ? `${activeBg} ${activeText}` : 'text-muted hover:bg-bg'}`}
          >List</button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-2 py-1 border-l border-border ${viewMode === 'grid' ? `${activeBg} ${activeText}` : 'text-muted hover:bg-bg'}`}
          >Grid</button>
        </div>
      </div>
    </>
  );
}
