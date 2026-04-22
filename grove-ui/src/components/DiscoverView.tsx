import { useMemo, useState } from 'react';
import type { CatalogListing, CanopyEntry, InboxEntry, ViewMode } from '../types';
import { formatBytes, shortShip } from '../format';
import { GRID_STYLE } from '../styles';
import Thumb from './Thumb';
import { useCatalogSearch } from '../useCatalogSearch';

type FilterChip = 'all' | 'images' | 'audio' | 'video' | 'documents';

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv']);
const DOC_EXTS = new Set(['pdf', 'txt', 'md', 'html', 'json', 'csv', 'doc', 'docx']);

function matchesFilter(mark: string, filter: FilterChip): boolean {
  if (filter === 'all') return true;
  const m = mark.toLowerCase();
  if (filter === 'images') return IMAGE_EXTS.has(m);
  if (filter === 'audio') return AUDIO_EXTS.has(m);
  if (filter === 'video') return VIDEO_EXTS.has(m);
  if (filter === 'documents') return DOC_EXTS.has(m);
  return false;
}

interface FlatEntry {
  host: string;
  catalogId: string;
  catalogName: string;
  entry: CanopyEntry;
}

interface Props {
  catalogPeers: Map<string, CatalogListing>;
  cache: Map<string, InboxEntry>;
  viewMode: ViewMode;
  search: string;
  onFetch: (host: string, id: string) => void;
  onPlant: (host: string, id: string) => void;
  onDropCache: (host: string, id: string) => void;
}

export default function DiscoverView({ catalogPeers, cache, viewMode, search, onFetch, onPlant, onDropCache }: Props) {
  const [filter, setFilter] = useState<FilterChip>('all');
  const { hits: searchHits, searching } = useCatalogSearch(search);

  // Flatten all peer entries into a single feed, deduplicated by file ID
  const allEntries = useMemo(() => {
    const seen = new Set<string>();
    const result: FlatEntry[] = [];
    for (const listing of catalogPeers.values()) {
      for (const entry of listing.entries) {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
        result.push({
          host: listing.host,
          catalogId: listing.catalogId,
          catalogName: listing.name,
          entry,
        });
      }
    }
    // Sort by published date, newest first
    result.sort((a, b) => b.entry.published.localeCompare(a.entry.published));
    return result;
  }, [catalogPeers]);

  const filtered = useMemo(() => {
    if (search.trim()) {
      // Show search results instead
      return searchHits.map((h) => ({
        host: h.host,
        catalogId: h.catalogId,
        catalogName: h.catalogName,
        entry: h.entry,
      }));
    }
    if (filter === 'all') return allEntries;
    return allEntries.filter((e) => matchesFilter(e.entry.fileMark, filter));
  }, [allEntries, filter, search, searchHits]);

  const chips: { key: FilterChip; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'images', label: 'Images' },
    { key: 'audio', label: 'Audio' },
    { key: 'video', label: 'Video' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
              filter === c.key && !search.trim()
                ? 'border-canopy bg-canopy-soft text-canopy font-medium'
                : 'border-border text-muted hover:text-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {searching && <div className="text-xs text-muted mb-2">Searching...</div>}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">{search.trim() ? 'No results found.' : 'Nothing to discover yet.'}</p>
          <p className="text-xs mt-1">
            {search.trim()
              ? 'Try different search terms.'
              : 'Subscribe to catalogs from the Browse page to see files here.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4" style={GRID_STYLE}>
          {filtered.map((item) => {
            const cached = cache.has(`${item.host}/${item.entry.id}`);
            return (
              <div key={`${item.host}/${item.entry.id}`} className="group relative rounded-lg border border-border bg-surface overflow-hidden hover:border-canopy/40">
                <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
                  <Thumb mark={item.entry.fileMark} size="fill" />
                </div>
                <div className="p-2">
                  <div className="text-sm truncate font-medium" title={item.entry.displayName}>{item.entry.displayName}</div>
                  <div className="text-xs text-muted flex justify-between mt-0.5">
                    <span className="uppercase">{item.entry.fileMark}</span>
                    <span>{formatBytes(item.entry.size)}</span>
                  </div>
                  {item.entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.entry.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1 rounded bg-bg border border-border text-muted">{t}</span>
                      ))}
                      {item.entry.tags.length > 2 && <span className="text-[10px] text-faint">+{item.entry.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100">
                  {cached ? (
                    <>
                      <button onClick={() => onPlant(item.host, item.entry.id)} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-canopy">Save</button>
                      <button onClick={() => onDropCache(item.host, item.entry.id)} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600">Drop</button>
                    </>
                  ) : (
                    <button onClick={() => onFetch(item.host, item.entry.id)} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-canopy">Fetch</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((item) => {
            const cached = cache.has(`${item.host}/${item.entry.id}`);
            return (
              <div key={`${item.host}/${item.entry.id}`} className="flex items-center px-4 py-3 rounded-lg border border-border hover:border-canopy/40 hover:bg-canopy-soft/20 transition-colors group">
                <Thumb mark={item.entry.fileMark} size="sm" />
                <div className="min-w-0 flex-1 ml-3">
                  <div className="text-sm truncate font-medium">{item.entry.displayName}</div>
                  <div className="flex items-center gap-2 text-xs text-faint mt-0.5">
                    <span className="uppercase">{item.entry.fileMark}</span>
                    <span>{formatBytes(item.entry.size)}</span>
                    {item.entry.tags.length > 0 && item.entry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="px-1 py-0.5 rounded bg-bg border border-border text-[10px]">{t}</span>
                    ))}
                  </div>
                  {item.entry.description && <div className="text-xs text-muted mt-0.5 line-clamp-1">{item.entry.description}</div>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  {cached ? (
                    <>
                      <button onClick={() => onPlant(item.host, item.entry.id)} className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-canopy">Save</button>
                      <button onClick={() => onDropCache(item.host, item.entry.id)} className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-red-600">Drop</button>
                    </>
                  ) : (
                    <button onClick={() => onFetch(item.host, item.entry.id)} className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-canopy">Fetch</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
