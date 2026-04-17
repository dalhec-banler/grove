import { useState } from 'react';
import type { SortKey, ViewMode } from './types';

interface ToolbarState {
  search: string;
  sort: SortKey;
  viewMode: ViewMode;
  setSearch: (s: string) => void;
  setSort: (k: SortKey) => void;
  setViewMode: (m: ViewMode) => void;
}

export function useToolbarState(
  initialSort: SortKey,
  initialViewMode: ViewMode | (() => ViewMode),
): ToolbarState {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  return { search, sort, viewMode, setSearch, setSort, setViewMode };
}
