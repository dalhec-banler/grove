import { useState } from 'react';
import type { GroveViewListing, FileMeta } from '../types';
import { formatBytes, formatDate, shortShip } from '../format';
import { GRID_STYLE } from '../styles';
import Thumb from './Thumb';

interface BrowseProps {
  kind: 'browse';
  svPeers: Map<string, GroveViewListing>;
  onSubscribe: (host: string, name: string) => void;
  onUnsubscribe: (host: string, name: string) => void;
  onSelectView: (host: string, name: string) => void;
}

interface DetailProps {
  kind: 'detail';
  listing: GroveViewListing;
  viewMode: 'list' | 'grid';
  onUnsubscribe: () => void;
}

type Props = BrowseProps | DetailProps;

export default function SharedViewsView(props: Props) {
  if (props.kind === 'detail') return <SharedViewDetail {...props} />;
  return <SharedViewBrowse {...props} />;
}

function SharedViewBrowse({ svPeers, onSubscribe, onUnsubscribe, onSelectView }: BrowseProps) {
  const [shipInput, setShipInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const handleSubscribe = () => {
    const ship = shipInput.trim();
    const name = nameInput.trim();
    if (!ship || !name) return;
    onSubscribe(ship, name);
    setShipInput('');
    setNameInput('');
  };

  const listings = Array.from(svPeers.values());

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mb-8">
        <h2 className="text-sm font-medium mb-3">Subscribe to a shared view</h2>
        <div className="flex gap-2">
          <input
            value={shipInput}
            onChange={(e) => setShipInput(e.target.value)}
            placeholder="~sampel-palnet"
            className="flex-1 border border-border rounded px-3 py-1.5 text-sm font-mono"
          />
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="view name"
            className="flex-1 border border-border rounded px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleSubscribe}
            disabled={!shipInput.trim() || !nameInput.trim()}
            className="px-4 py-1.5 rounded bg-accent text-white text-sm font-medium disabled:opacity-40"
          >
            Subscribe
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-faint text-sm">No shared view subscriptions yet. Subscribe to a view above.</div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Subscribed views</h2>
          {listings.map((l) => (
            <div
              key={`${l.host}/${l.name}`}
              className="border border-border rounded-lg p-4 bg-surface hover:border-ink/20 cursor-pointer group"
              onClick={() => onSelectView(l.host, l.name)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="font-medium">{l.name}</span>
                <span className="text-xs text-faint font-mono">{shortShip(l.host)}</span>
                <span className="text-xs text-muted ml-auto">{l.files.length} file{l.files.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Unsubscribe from "${l.name}" on ${l.host}?`)) onUnsubscribe(l.host, l.name);
                  }}
                  className="text-xs text-muted hover:text-red-600 hidden group-hover:block"
                >
                  Unsubscribe
                </button>
              </div>
              {l.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {l.tags.map((t) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-bg border border-border text-muted">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SharedViewDetail({ listing, viewMode, onUnsubscribe }: DetailProps) {
  if (listing.files.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <DetailHeader listing={listing} onUnsubscribe={onUnsubscribe} />
        <div className="flex-1 flex items-center justify-center text-faint text-sm">
          No files in this shared view.
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <DetailHeader listing={listing} onUnsubscribe={onUnsubscribe} />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4" style={GRID_STYLE}>
            {listing.files.map((f) => (
              <RemoteFileCard key={f.id} file={f} host={listing.host} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DetailHeader listing={listing} onUnsubscribe={onUnsubscribe} />
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted uppercase tracking-wider bg-bg sticky top-0">
            <tr>
              <th className="text-left font-normal px-3 py-2">Name</th>
              <th className="text-left font-normal px-3 py-2 w-32">Type</th>
              <th className="text-left font-normal px-3 py-2 w-48">Tags</th>
              <th className="text-right font-normal px-3 py-2 w-24">Size</th>
              <th className="text-right font-normal px-3 py-2 w-36">Modified</th>
            </tr>
          </thead>
          <tbody>
            {listing.files.map((f) => (
              <tr key={f.id} className="border-b border-border hover:bg-bg">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Thumb mark={f.fileMark} src="" size="sm" />
                    <span className="truncate">{f.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-muted uppercase text-xs">{f.fileMark}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {f.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-bg border border-border text-muted">{t}</span>
                    ))}
                    {f.tags.length > 3 && <span className="text-xs text-faint">+{f.tags.length - 3}</span>}
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-muted">{formatBytes(f.size)}</td>
                <td className="px-3 py-2 text-right text-muted">{formatDate(f.modified)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailHeader({ listing, onUnsubscribe }: { listing: GroveViewListing; onUnsubscribe: () => void }) {
  return (
    <div className="px-6 py-3 border-b border-border flex items-center gap-3">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: listing.color }} />
      <span className="font-medium">{listing.name}</span>
      <span className="text-xs text-faint font-mono">{shortShip(listing.host)}</span>
      {listing.tags.length > 0 && (
        <div className="flex gap-1 ml-2">
          {listing.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border text-muted">{t}</span>
          ))}
        </div>
      )}
      <span className="text-xs text-muted ml-auto">{listing.files.length} file{listing.files.length !== 1 ? 's' : ''}</span>
      <button
        onClick={() => { if (confirm(`Unsubscribe from "${listing.name}"?`)) onUnsubscribe(); }}
        className="text-xs text-muted hover:text-red-600"
      >
        Unsubscribe
      </button>
    </div>
  );
}

function RemoteFileCard({ file, host }: { file: FileMeta; host: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        <Thumb mark={file.fileMark} src="" size="fill" />
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={file.name}>{file.name}</div>
        <div className="text-xs text-muted flex justify-between mt-0.5">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.modified)}</span>
        </div>
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {file.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] px-1 rounded bg-bg border border-border text-muted">{t}</span>
            ))}
            {file.tags.length > 2 && <span className="text-[10px] text-faint">+{file.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
