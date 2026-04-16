import type { CanopyEntry, SortKey } from './types';
import { sortByKey } from './sort';

export function sortEntries(entries: CanopyEntry[], key: SortKey): CanopyEntry[] {
  return sortByKey(entries, key, {
    name: (e) => e.displayName,
    date: (e) => e.published,
    size: (e) => e.size,
    type: (e) => e.fileMark,
  });
}

export function filterEntries(entries: CanopyEntry[], tags: Set<string>, types: Set<string>, search: string): CanopyEntry[] {
  const q = search.trim().toLowerCase();
  return entries.filter((e) => {
    if (tags.size > 0 && !Array.from(tags).every((t) => e.tags.includes(t))) return false;
    if (types.size > 0 && !types.has(e.fileMark.toLowerCase())) return false;
    if (q) {
      const hay = `${e.displayName} ${e.description} ${e.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function facets(entries: CanopyEntry[]): { tags: Array<[string, number]>; types: Array<[string, number]> } {
  const tagMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  for (const e of entries) {
    for (const tag of e.tags) tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    const mark = e.fileMark.toLowerCase();
    typeMap.set(mark, (typeMap.get(mark) ?? 0) + 1);
  }
  return {
    tags: Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    types: Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}

export function toggleSetItem<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  next.has(item) ? next.delete(item) : next.add(item);
  return next;
}

export function FacetChips({
  tagFacets, typeFacets, activeTags, activeTypes, onToggleTag, onToggleType, onClear,
}: {
  tagFacets: Array<[string, number]>; typeFacets: Array<[string, number]>;
  activeTags: Set<string>; activeTypes: Set<string>;
  onToggleTag: (t: string) => void; onToggleType: (t: string) => void;
  onClear: () => void;
}) {
  if (tagFacets.length === 0 && typeFacets.length === 0) return null;
  const hasActive = activeTags.size > 0 || activeTypes.size > 0;
  return (
    <div className="border border-border rounded-lg bg-surface p-3 space-y-2">
      {hasActive && (
        <button onClick={onClear} className="text-xs text-muted hover:text-ink">Clear filters</button>
      )}
      {typeFacets.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] uppercase tracking-wider text-faint mr-1">Type</span>
          {typeFacets.map(([t, c]) => {
            const on = activeTypes.has(t);
            return (
              <button
                key={t}
                onClick={() => onToggleType(t)}
                className={`text-xs px-2 py-0.5 rounded border ${on ? 'bg-canopy-soft border-canopy text-canopy' : 'border-border text-muted hover:text-ink'}`}
              >
                {t} <span className="text-faint">{c}</span>
              </button>
            );
          })}
        </div>
      )}
      {tagFacets.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] uppercase tracking-wider text-faint mr-1">Tags</span>
          {tagFacets.map(([t, c]) => {
            const on = activeTags.has(t);
            return (
              <button
                key={t}
                onClick={() => onToggleTag(t)}
                className={`text-xs px-2 py-0.5 rounded border ${on ? 'bg-canopy-soft border-canopy text-canopy' : 'border-border text-muted hover:text-ink'}`}
              >
                #{t} <span className="text-faint">{c}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
