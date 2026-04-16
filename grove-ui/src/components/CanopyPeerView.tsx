import { useMemo, useState } from 'react';
import type { CanopyEntry, CanopyListing, InboxEntry, SortKey } from '../types';
import { formatBytes, formatDate, IMAGE_MARKS } from '../format';
import { remoteFileUrl } from '../urls';
import { GRID_STYLE } from '../styles';
import FileIcon from './FileIcon';
import Thumb from './Thumb';
import { sortEntries, filterEntries, facets, toggleSetItem, FacetChips } from '../canopy-utils';

export interface PeerProps {
  kind: 'peer';
  host: string;
  listing: CanopyListing | null;
  cache: Map<string, InboxEntry>;
  search: string;
  sortKey: SortKey;
  viewMode: 'list' | 'grid';
  onFetch: (host: string, id: string) => void;
  onPlant: (host: string, id: string) => void;
  onDropCache: (host: string, id: string) => void;
  onUnsubscribe: (ship: string) => void;
}

export default function PeerView(p: PeerProps) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const baseEntries = p.listing?.entries ?? [];
  const { tags: tagFacets, types: typeFacets } = useMemo(() => facets(baseEntries), [baseEntries]);
  const entries = useMemo(
    () => sortEntries(filterEntries(baseEntries, activeTags, activeTypes, p.search), p.sortKey),
    [baseEntries, activeTags, activeTypes, p.search, p.sortKey]
  );

  if (!p.listing) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-sm text-faint mb-3">Waiting for {p.host}'s catalog…</div>
          <button
            onClick={() => { if (confirm(`Unsubscribe from ${p.host}?`)) p.onUnsubscribe(p.host); }}
            className="text-xs px-3 py-1 rounded border border-border text-muted hover:text-red-600"
          >Unsubscribe</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium truncate">{p.listing.name || p.listing.host}</h2>
          <div className="text-xs text-faint font-mono truncate">{p.listing.host} · {p.listing.mode}</div>
        </div>
        <button
          onClick={() => { if (confirm(`Unsubscribe from ${p.host}?`)) p.onUnsubscribe(p.host); }}
          className="text-xs px-3 py-1 rounded border border-border text-muted hover:text-red-600"
        >Unsubscribe</button>
      </div>
      <FacetChips
        tagFacets={tagFacets} typeFacets={typeFacets}
        activeTags={activeTags} activeTypes={activeTypes}
        onToggleTag={(t) => setActiveTags(toggleSetItem(activeTags, t))}
        onToggleType={(t) => setActiveTypes(toggleSetItem(activeTypes, t))}
        onClear={() => { setActiveTags(new Set()); setActiveTypes(new Set()); }}
      />
      {entries.length === 0 ? (
        <div className="text-sm text-faint">
          {baseEntries.length === 0 ? 'This catalog is empty.' : 'No matches for those filters.'}
        </div>
      ) : p.viewMode === 'grid' ? (
        <div className="grid gap-4" style={GRID_STYLE}>
          {entries.map((e) => {
            const cacheKey = `${p.host}/${e.id}`;
            const cached = p.cache.get(cacheKey);
            return (
              <PeerCard
                key={e.id}
                host={p.host}
                entry={e}
                cached={cached}
                onFetch={() => p.onFetch(p.host, e.id)}
                onPlant={() => p.onPlant(p.host, e.id)}
                onDropCache={() => p.onDropCache(p.host, e.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
            const cacheKey = `${p.host}/${e.id}`;
            const cached = p.cache.get(cacheKey);
            return (
              <PeerRow
                key={e.id}
                host={p.host}
                entry={e}
                cached={cached}
                onFetch={() => p.onFetch(p.host, e.id)}
                onPlant={() => p.onPlant(p.host, e.id)}
                onDropCache={() => p.onDropCache(p.host, e.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PeerRow({ host, entry, cached, onFetch, onPlant, onDropCache }: {
  host: string; entry: CanopyEntry; cached: InboxEntry | undefined;
  onFetch: () => void; onPlant: () => void; onDropCache: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = IMAGE_MARKS.has(entry.fileMark.toLowerCase());
  const isCached = !!cached?.cached;

  function open() {
    if (!isCached) onFetch();
    setShowPreview(true);
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-surface">
      <div className="flex items-center gap-3">
        <Thumb mark={entry.fileMark} src={isCached ? remoteFileUrl(host, entry.id) : undefined} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{entry.displayName}</div>
          {entry.description && <div className="text-xs text-muted truncate">{entry.description}</div>}
          <div className="text-xs text-faint">
            {formatBytes(entry.size)} · published {formatDate(entry.published)}
            {entry.tags.length > 0 && <> · {entry.tags.map((t) => `#${t}`).join(' ')}</>}
            {isCached && ' · cached'}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={open} className="text-xs px-2 py-1 rounded bg-canopy text-white hover:opacity-90">
            {isCached ? 'Open' : 'Fetch'}
          </button>
          {isCached && (
            <a
              href={remoteFileUrl(host, entry.id)}
              download={entry.displayName}
              className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-canopy"
            >Download</a>
          )}
          <button
            onClick={onPlant}
            disabled={!isCached}
            className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-canopy disabled:opacity-40"
            title="Copy into your own grove"
          >Plant</button>
        </div>
      </div>
      {showPreview && isCached && (
        <div className="mt-3 border-t border-border pt-3">
          {isImage ? (
            <img src={remoteFileUrl(host, entry.id)} alt={entry.displayName} className="max-h-96 mx-auto rounded" />
          ) : (
            <div className="text-xs text-muted">Preview not supported. Use Download.</div>
          )}
          <button onClick={() => { setShowPreview(false); onDropCache(); }} className="mt-2 text-xs text-muted hover:text-red-600">
            Close & drop cache
          </button>
        </div>
      )}
    </div>
  );
}

function PeerCard({ host, entry, cached, onFetch, onPlant, onDropCache }: {
  host: string; entry: CanopyEntry; cached: InboxEntry | undefined;
  onFetch: () => void; onPlant: () => void; onDropCache: () => void;
}) {
  const isCached = !!cached?.cached;

  return (
    <div className="group relative rounded-lg border border-border bg-surface overflow-hidden cursor-pointer" onClick={() => { if (!isCached) onFetch(); }}>
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        {IMAGE_MARKS.has(entry.fileMark.toLowerCase()) && isCached ? (
          <img src={remoteFileUrl(host, entry.id)} alt={entry.displayName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <FileIcon mark={entry.fileMark} className="w-16 h-16" />
        )}
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={entry.displayName}>{entry.displayName}</div>
        <div className="text-xs text-muted flex justify-between">
          <span>{formatBytes(entry.size)}</span>
          <span>{isCached ? 'cached' : ''}</span>
        </div>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {entry.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] px-1 rounded bg-canopy-soft border border-canopy/20 text-canopy">{t}</span>
            ))}
            {entry.tags.length > 2 && <span className="text-[10px] text-faint">+{entry.tags.length - 2}</span>}
          </div>
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
        {isCached && (
          <a
            href={remoteFileUrl(host, entry.id)}
            download={entry.displayName}
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-black/80"
            title="Download"
          >↓</a>
        )}
        {isCached && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlant(); }}
            className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-canopy"
            title="Plant to grove"
          >Plant</button>
        )}
      </div>
    </div>
  );
}
