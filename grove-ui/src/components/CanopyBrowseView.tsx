import { useEffect, useState } from 'react';
import type { CanopySearchHit } from '../types';
import { formatBytes, normalizeShip } from '../format';
import { scryCanopySearch } from '../api';
import Thumb from './Thumb';

export interface BrowseProps {
  kind: 'browse';
  onSubscribe: (ship: string) => void;
  subscribed: Set<string>;
}

export default function BrowseView(p: BrowseProps) {
  const [peerDraft, setPeerDraft] = useState('');
  const [peerError, setPeerError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hits, setHits] = useState<CanopySearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) { setHits([]); setSearchError(null); return; }
    let cancelled = false;
    setSearching(true);
    setSearchError(null);
    const h = setTimeout(() => {
      scryCanopySearch(q)
        .then((r) => { if (!cancelled) setHits(r); })
        .catch((e) => { if (!cancelled) { console.error('search', e); setSearchError('Search failed — try again.'); } })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(h); };
  }, [searchTerm]);

  function subscribe() {
    const norm = normalizeShip(peerDraft);
    if (!norm) { setPeerError('not a valid @p'); return; }
    setPeerError(null);
    p.onSubscribe(norm);
    setPeerDraft('');
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <section className="border border-border rounded-lg bg-surface p-4">
        <h2 className="text-sm font-medium mb-2">Subscribe to a canopy</h2>
        <p className="text-xs text-faint mb-3">
          Enter a ship to follow their public catalog. You'll see their published files in the sidebar under Subscriptions.
        </p>
        <div className="flex gap-2">
          <input
            value={peerDraft}
            onChange={(e) => { setPeerDraft(e.target.value); setPeerError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); subscribe(); } }}
            placeholder="~sampel-palnet"
            className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
          />
          <button onClick={subscribe} className="text-xs px-3 py-1 rounded bg-canopy text-white">Subscribe</button>
        </div>
        {peerError && <div className="text-xs text-red-600 mt-1">{peerError}</div>}
      </section>

      <section>
        <h2 className="text-sm font-medium mb-2">Search your subscriptions</h2>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by filename, tag, or description…"
          className="w-full border border-border rounded px-2 py-1.5 text-sm mb-3"
        />
        {searching && <div className="text-xs text-faint">Searching…</div>}
        {searchError && <div className="text-xs text-red-600">{searchError}</div>}
        {!searching && !searchError && searchTerm.trim() && hits.length === 0 && (
          <div className="text-xs text-faint">No results across {p.subscribed.size} subscription(s).</div>
        )}
        {!searchTerm.trim() && (
          <div className="text-xs text-faint">
            {p.subscribed.size === 0
              ? 'No subscriptions yet. Subscribe to a ship above to start browsing.'
              : 'Type to search across your subscriptions.'}
          </div>
        )}
        {hits.length > 0 && (
          <div className="space-y-2">
            {hits.map((h, i) => (
              <div key={`${h.host}/${h.entry.id}/${i}`} className="border border-border rounded-lg p-3 bg-surface flex items-center gap-3">
                <Thumb mark={h.entry.fileMark} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{h.entry.displayName}</div>
                  <div className="text-xs text-muted font-mono truncate">{h.host}</div>
                  <div className="text-xs text-faint">
                    {formatBytes(h.entry.size)}
                    {h.entry.tags.length > 0 && <> · {h.entry.tags.map((t) => `#${t}`).join(' ')}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
