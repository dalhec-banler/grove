import { useState } from 'react';
import type { CatalogListing, Selection } from '../types';
import { shortShip } from '../format';

interface Props {
  catalogPeers: Map<string, CatalogListing>;
  onSelect: (s: Selection) => void;
  onSubscribe: (who: string, catalogId: string) => void;
}

export default function BrowseView({ catalogPeers, onSelect, onSubscribe }: Props) {
  const [shipDraft, setShipDraft] = useState('');
  const [catalogDraft, setCatalogDraft] = useState('default');

  // Group listings by host
  const peerMap = new Map<string, CatalogListing[]>();
  for (const listing of catalogPeers.values()) {
    const list = peerMap.get(listing.host) ?? [];
    list.push(listing);
    peerMap.set(listing.host, list);
  }
  const hosts = Array.from(peerMap.keys()).sort((a, b) => a.localeCompare(b));

  function handleSubscribe() {
    const ship = shipDraft.trim();
    const cid = catalogDraft.trim() || 'default';
    if (!ship) return;
    onSubscribe(ship, cid);
    setShipDraft('');
    setCatalogDraft('default');
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <h2 className="text-base font-medium mb-4">Browse Catalogs</h2>

      <div className="mb-6 p-4 border border-border rounded-lg bg-bg">
        <div className="text-xs text-muted mb-2">Subscribe to a catalog</div>
        <div className="flex gap-2">
          <input
            value={shipDraft}
            onChange={(e) => setShipDraft(e.target.value)}
            placeholder="~sampel-palnet"
            className="flex-1 border border-border rounded px-2 py-1.5 text-sm font-mono"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
          />
          <input
            value={catalogDraft}
            onChange={(e) => setCatalogDraft(e.target.value)}
            placeholder="catalog id"
            className="w-32 border border-border rounded px-2 py-1.5 text-sm"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
          />
          <button
            onClick={handleSubscribe}
            disabled={!shipDraft.trim()}
            className="text-xs px-3 py-1.5 rounded bg-canopy text-white disabled:opacity-40 shrink-0"
          >Subscribe</button>
        </div>
      </div>

      {hosts.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">No subscriptions yet.</p>
          <p className="text-xs mt-1">Enter a ship name above to subscribe to their catalogs.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {hosts.map((host) => {
            const listings = peerMap.get(host) ?? [];
            const totalEntries = listings.reduce((n, l) => n + l.entries.length, 0);
            return (
              <button
                key={host}
                onClick={() => onSelect({ kind: 'browse-peer', host })}
                className="text-left p-4 rounded-lg border border-border hover:border-canopy hover:bg-canopy-soft/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm font-medium">{shortShip(host)}</div>
                    <div className="text-xs text-faint font-mono mt-0.5">{host}</div>
                  </div>
                  <div className="text-right text-xs text-faint">
                    <div>{listings.length} catalog{listings.length !== 1 ? 's' : ''}</div>
                    <div>{totalEntries} file{totalEntries !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
