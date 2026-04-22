import type { CatalogListing, Selection } from '../types';
import { shortShip } from '../format';

interface Props {
  host: string;
  listings: CatalogListing[];
  onSelect: (s: Selection) => void;
  onUnsubscribe: (host: string, catalogId: string) => void;
}

export default function BrowsePeerView({ host, listings, onSelect, onUnsubscribe }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-base font-medium">{shortShip(host)}</h2>
        <div className="text-xs text-faint font-mono">{host}</div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">No catalogs from this ship yet.</p>
          <p className="text-xs mt-1">Waiting for data...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <div
              key={listing.catalogId}
              className="p-4 rounded-lg border border-border hover:border-canopy hover:bg-canopy-soft/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => onSelect({ kind: 'browse-catalog', host, catalogId: listing.catalogId })}
                  className="text-left min-w-0 flex-1"
                >
                  <div className="font-medium text-sm">{listing.name || listing.catalogId}</div>
                  {listing.description && <div className="text-xs text-muted mt-0.5 line-clamp-2">{listing.description}</div>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-faint">
                    <span>{listing.entries.length} file{listing.entries.length !== 1 ? 's' : ''}</span>
                    <span className="px-1.5 py-0.5 rounded bg-bg border border-border capitalize">{listing.mode}</span>
                  </div>
                </button>
                <button
                  onClick={() => { if (confirm(`Unsubscribe from ${listing.name || listing.catalogId}?`)) onUnsubscribe(host, listing.catalogId); }}
                  className="text-xs text-faint hover:text-red-600 px-1 shrink-0"
                  title="Unsubscribe"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
