import { useState } from 'react';
import type { CanopyEntry, CanopyListing, InboxEntry, SortKey } from '../types';
import { formatBytes, formatDate } from '../format';
import { remoteFileUrl } from '../urls';
import Thumb from './Thumb';
import ListGridLayout from './ListGridLayout';
import PreviewPane from './PreviewPane';
import { useFacetFilter, FacetChips } from '../canopy-utils';

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
  const baseEntries = p.listing?.entries ?? [];
  const { filtered: entries, tagFacets, typeFacets, activeTags, activeTypes, toggleTag, toggleType, clearFilters } = useFacetFilter(baseEntries, p.search, p.sortKey);

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
        onToggleTag={toggleTag}
        onToggleType={toggleType}
        onClear={clearFilters}
      />
      {entries.length === 0 ? (
        <div className="text-sm text-faint">
          {baseEntries.length === 0 ? 'This catalog is empty.' : 'No matches for those filters.'}
        </div>
      ) : (
        <ListGridLayout
          items={entries}
          viewMode={p.viewMode}
          keyFn={(e) => e.id}
          renderRow={(e) => {
            const cached = p.cache.get(`${p.host}/${e.id}`);
            return <PeerRow host={p.host} entry={e} cached={cached} onFetch={() => p.onFetch(p.host, e.id)} onPlant={() => p.onPlant(p.host, e.id)} onDropCache={() => p.onDropCache(p.host, e.id)} />;
          }}
          renderCard={(e) => {
            const cached = p.cache.get(`${p.host}/${e.id}`);
            return <PeerCard host={p.host} entry={e} cached={cached} onFetch={() => p.onFetch(p.host, e.id)} onPlant={() => p.onPlant(p.host, e.id)} onDropCache={() => p.onDropCache(p.host, e.id)} />;
          }}
        />
      )}
    </div>
  );
}

function PeerRow({ host, entry, cached, onFetch, onPlant, onDropCache }: {
  host: string; entry: CanopyEntry; cached: InboxEntry | undefined;
  onFetch: () => void; onPlant: () => void; onDropCache: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
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
        <PreviewPane src={remoteFileUrl(host, entry.id)} name={entry.displayName} mark={entry.fileMark} onClose={() => { setShowPreview(false); onDropCache(); }} />
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
        <Thumb mark={entry.fileMark} src={isCached ? remoteFileUrl(host, entry.id) : undefined} size="fill" />
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
