import { useMemo } from 'react';
import type { CatalogListing, CanopyEntry, InboxEntry, ViewMode } from '../types';
import { formatBytes, shortShip } from '../format';
import { GRID_STYLE } from '../styles';
import Thumb from './Thumb';

interface Props {
  host: string;
  listing: CatalogListing;
  cache: Map<string, InboxEntry>;
  viewMode: ViewMode;
  search: string;
  onFetch: (host: string, id: string) => void;
  onPlant: (host: string, id: string) => void;
  onDropCache: (host: string, id: string) => void;
  onUnsubscribe: (host: string, catalogId: string) => void;
}

export default function BrowseCatalogView({ host, listing, cache, viewMode, search, onFetch, onPlant, onDropCache, onUnsubscribe }: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listing.entries;
    return listing.entries.filter((e) =>
      e.displayName.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [listing.entries, search]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-medium">{listing.name || listing.catalogId}</h2>
          <div className="text-xs text-faint font-mono">{shortShip(host)}</div>
          {listing.description && <p className="text-xs text-muted mt-1">{listing.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-faint">
            <span>{listing.entries.length} file{listing.entries.length !== 1 ? 's' : ''}</span>
            <span className="px-1.5 py-0.5 rounded bg-bg border border-border capitalize">{listing.mode}</span>
          </div>
        </div>
        <button
          onClick={() => { if (confirm(`Unsubscribe from ${listing.name || listing.catalogId}?`)) onUnsubscribe(host, listing.catalogId); }}
          className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-red-600"
        >Unsubscribe</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">{search.trim() ? 'No matching files.' : 'This catalog is empty.'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4" style={GRID_STYLE}>
          {filtered.map((entry) => {
            const cached = cache.has(`${host}/${entry.id}`);
            return (
              <div key={entry.id} className="group relative rounded-lg border border-border bg-surface overflow-hidden hover:border-canopy/40">
                <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
                  <Thumb mark={entry.fileMark} size="fill" />
                </div>
                <div className="p-2">
                  <div className="text-sm truncate" title={entry.displayName}>{entry.displayName}</div>
                  <div className="text-xs text-muted flex justify-between mt-0.5">
                    <span className="uppercase">{entry.fileMark}</span>
                    <span>{formatBytes(entry.size)}</span>
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1 rounded bg-bg border border-border text-muted">{t}</span>
                      ))}
                      {entry.tags.length > 2 && <span className="text-[10px] text-faint">+{entry.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100">
                  {cached ? (
                    <>
                      <button onClick={() => onPlant(host, entry.id)} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-canopy">Save</button>
                      <button onClick={() => onDropCache(host, entry.id)} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600">Drop</button>
                    </>
                  ) : (
                    <button onClick={() => onFetch(host, entry.id)} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-canopy">Fetch</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border">
          {filtered.map((entry) => (
            <EntryRow
              key={entry.id}
              host={host}
              entry={entry}
              cached={cache.has(`${host}/${entry.id}`)}
              onFetch={() => onFetch(host, entry.id)}
              onPlant={() => onPlant(host, entry.id)}
              onDropCache={() => onDropCache(host, entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryRow({ host, entry, cached, onFetch, onPlant, onDropCache }: {
  host: string; entry: CanopyEntry; cached: boolean;
  onFetch: () => void; onPlant: () => void; onDropCache: () => void;
}) {
  return (
    <div className="flex items-center px-4 py-2.5 hover:bg-bg group">
      <Thumb mark={entry.fileMark} size="sm" />
      <div className="min-w-0 flex-1 ml-3">
        <div className="text-sm truncate">{entry.displayName}</div>
        <div className="flex items-center gap-2 text-xs text-faint mt-0.5">
          <span className="uppercase">{entry.fileMark}</span>
          <span>{formatBytes(entry.size)}</span>
          {entry.tags.length > 0 && entry.tags.map((t) => (
            <span key={t} className="px-1 py-0.5 rounded bg-bg border border-border text-[10px]">{t}</span>
          ))}
        </div>
        {entry.description && <div className="text-xs text-muted mt-0.5 line-clamp-1">{entry.description}</div>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
        {cached ? (
          <>
            <button onClick={onPlant} className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-canopy" title="Save to your Grove">Save</button>
            <button onClick={onDropCache} className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-red-600" title="Remove from cache">Drop</button>
          </>
        ) : (
          <button onClick={onFetch} className="text-[10px] px-2 py-1 rounded border border-border text-muted hover:text-canopy" title="Fetch file">Fetch</button>
        )}
      </div>
    </div>
  );
}
