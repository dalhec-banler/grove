import { useState } from 'react';
import type { InboxEntry, SortKey } from '../types';
import { formatBytes, formatDate, IMAGE_MARKS, normalizeShip, remoteFileUrl } from '../format';
import FileIcon from './FileIcon';
import Thumb from './Thumb';

interface Props {
  entries: InboxEntry[];
  trusted: Set<string>;
  blocked: Set<string>;
  search: string;
  sortKey: SortKey;
  viewMode: 'list' | 'grid';
  onAccept: (e: InboxEntry) => void;
  onDecline: (e: InboxEntry) => void;
  onTrust: (ship: string) => void;
  onUntrust: (ship: string) => void;
  onBlock: (ship: string) => void;
  onUnblock: (ship: string) => void;
  onFetch: (e: InboxEntry) => void;
  onPlant: (e: InboxEntry) => void;
  onDropCache: (e: InboxEntry) => void;
}

function sortInbox(entries: InboxEntry[], key: SortKey): InboxEntry[] {
  const list = entries.slice();
  switch (key) {
    case 'newest':    return list.sort((a, b) => b.offered.localeCompare(a.offered));
    case 'oldest':    return list.sort((a, b) => a.offered.localeCompare(b.offered));
    case 'name-asc':  return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc': return list.sort((a, b) => b.name.localeCompare(a.name));
    case 'largest':   return list.sort((a, b) => b.size - a.size);
    case 'smallest':  return list.sort((a, b) => a.size - b.size);
    case 'type':      return list.sort((a, b) => a.fileMark.localeCompare(b.fileMark) || a.name.localeCompare(b.name));
  }
}

function filterInbox(entries: InboxEntry[], search: string): InboxEntry[] {
  const q = search.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((e) => {
    const hay = `${e.name} ${e.owner} ${e.fileMark}`.toLowerCase();
    return hay.includes(q);
  });
}

export default function InboxView({
  entries, trusted, blocked, search, sortKey, viewMode,
  onAccept, onDecline, onTrust, onUntrust, onBlock, onUnblock,
  onFetch, onPlant, onDropCache,
}: Props) {
  const pending = sortInbox(filterInbox(entries.filter((e) => !e.accepted), search), sortKey);
  const accepted = sortInbox(filterInbox(entries.filter((e) => e.accepted), search), sortKey);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      {pending.length > 0 && (
        <Section title={`Pending offers (${pending.length})`}>
          {viewMode === 'grid' ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {pending.map((e) => (
                <PendingCard
                  key={`${e.owner}/${e.fileId}`}
                  entry={e}
                  trusted={trusted.has(e.owner)}
                  blocked={blocked.has(e.owner)}
                  onAccept={() => onAccept(e)}
                  onDecline={() => onDecline(e)}
                  onTrust={() => onTrust(e.owner)}
                  onBlock={() => onBlock(e.owner)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((e) => (
                <PendingRow
                  key={`${e.owner}/${e.fileId}`}
                  entry={e}
                  trusted={trusted.has(e.owner)}
                  blocked={blocked.has(e.owner)}
                  onAccept={() => onAccept(e)}
                  onDecline={() => onDecline(e)}
                  onTrust={() => onTrust(e.owner)}
                  onBlock={() => onBlock(e.owner)}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title={`Shared with me (${accepted.length})`}>
        {accepted.length === 0 ? (
          <div className="text-sm text-faint">Nothing shared with you yet.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {accepted.map((e) => (
              <AcceptedCard
                key={`${e.owner}/${e.fileId}`}
                entry={e}
                onFetch={() => onFetch(e)}
                onPlant={() => onPlant(e)}
                onDecline={() => onDecline(e)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {accepted.map((e) => (
              <AcceptedRow
                key={`${e.owner}/${e.fileId}`}
                entry={e}
                onFetch={() => onFetch(e)}
                onPlant={() => onPlant(e)}
                onDropCache={() => onDropCache(e)}
                onDecline={() => onDecline(e)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Trust">
        <TrustList
          trusted={trusted}
          blocked={blocked}
          onUntrust={onUntrust}
          onUnblock={onUnblock}
          onTrust={onTrust}
          onBlock={onBlock}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-ink mb-3">{title}</h2>
      {children}
    </div>
  );
}

function PendingRow({ entry, trusted, blocked, onAccept, onDecline, onTrust, onBlock }: {
  entry: InboxEntry; trusted: boolean; blocked: boolean;
  onAccept: () => void; onDecline: () => void; onTrust: () => void; onBlock: () => void;
}) {
  return (
    <div className="border border-border rounded-lg p-3 bg-surface flex items-center gap-3">
      <Thumb mark={entry.fileMark} size="md" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{entry.name}</div>
        <div className="text-xs text-muted font-mono truncate">{entry.owner}</div>
        <div className="text-xs text-faint">{formatBytes(entry.size)} · offered {formatDate(entry.offered)}</div>
      </div>
      <div className="flex flex-col gap-1">
        <button onClick={onAccept} className="text-xs px-2 py-1 rounded bg-accent text-white hover:opacity-90">Accept</button>
        <button onClick={onDecline} className="text-xs px-2 py-1 rounded text-muted hover:text-red-600">Decline</button>
      </div>
      <div className="flex flex-col gap-1">
        {!trusted && (
          <button onClick={onTrust} className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent" title="Always accept from this ship">
            Trust
          </button>
        )}
        {!blocked && (
          <button onClick={onBlock} className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-red-600" title="Block all future offers">
            Block
          </button>
        )}
      </div>
    </div>
  );
}

function AcceptedRow({ entry, onFetch, onPlant, onDropCache, onDecline }: {
  entry: InboxEntry; onFetch: () => void; onPlant: () => void; onDropCache: () => void; onDecline: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = IMAGE_MARKS.has(entry.fileMark.toLowerCase());

  function open() {
    if (!entry.cached) {
      onFetch();
    }
    setShowPreview(true);
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-surface">
      <div className="flex items-center gap-3">
        <Thumb mark={entry.fileMark} src={entry.cached ? remoteFileUrl(entry.owner, entry.fileId) : undefined} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{entry.name}</div>
          <div className="text-xs text-muted font-mono truncate">{entry.owner}</div>
          <div className="text-xs text-faint">
            {formatBytes(entry.size)} · {entry.cached ? 'cached' : 'live ref'}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={open} className="text-xs px-2 py-1 rounded bg-accent text-white hover:opacity-90">
            {entry.cached ? 'Open' : 'Fetch'}
          </button>
          {entry.cached && (
            <a
              href={remoteFileUrl(entry.owner, entry.fileId)}
              download={entry.name}
              className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent"
            >Download</a>
          )}
          {entry.cached && (
            <button onClick={onFetch} className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent" title="Re-fetch from owner">
              Re-fetch
            </button>
          )}
          <button onClick={onPlant} className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent" title="Copy to your grove as a regular file" disabled={!entry.cached}>
            Plant
          </button>
          <button onClick={onDecline} className="text-xs px-2 py-1 rounded text-muted hover:text-red-600" title="Remove from inbox">
            ×
          </button>
        </div>
      </div>
      {showPreview && entry.cached && (
        <div className="mt-3 border-t border-border pt-3">
          {isImage ? (
            <img src={remoteFileUrl(entry.owner, entry.fileId)} alt={entry.name} className="max-h-96 mx-auto rounded" />
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

function PendingCard({ entry, trusted, blocked, onAccept, onDecline, onTrust, onBlock }: {
  entry: InboxEntry; trusted: boolean; blocked: boolean;
  onAccept: () => void; onDecline: () => void; onTrust: () => void; onBlock: () => void;
}) {
  return (
    <div className="group relative rounded-lg border border-border bg-surface overflow-hidden">
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        <FileIcon mark={entry.fileMark} className="w-16 h-16" />
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={entry.name}>{entry.name}</div>
        <div className="text-xs text-muted font-mono truncate">{entry.owner}</div>
        <div className="text-xs text-faint">{formatBytes(entry.size)}</div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={onAccept} className="text-xs px-1.5 py-0.5 rounded bg-accent text-white hover:opacity-90">Accept</button>
        {!trusted && (
          <button onClick={onTrust} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-accent" title="Trust">✓</button>
        )}
        {!blocked && (
          <button onClick={onBlock} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600" title="Block">⊘</button>
        )}
        <button onClick={onDecline} className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600">×</button>
      </div>
    </div>
  );
}

function AcceptedCard({ entry, onFetch, onPlant, onDecline }: {
  entry: InboxEntry; onFetch: () => void; onPlant: () => void; onDecline: () => void;
}) {
  const isImage = IMAGE_MARKS.has(entry.fileMark.toLowerCase());

  return (
    <div className="group relative rounded-lg border border-border bg-surface overflow-hidden cursor-pointer" onClick={() => { if (!entry.cached) onFetch(); }}>
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        {isImage && entry.cached ? (
          <img src={remoteFileUrl(entry.owner, entry.fileId)} alt={entry.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <FileIcon mark={entry.fileMark} className="w-16 h-16" />
        )}
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={entry.name}>{entry.name}</div>
        <div className="text-xs text-muted font-mono truncate">{entry.owner}</div>
        <div className="text-xs text-faint">
          {formatBytes(entry.size)} · {entry.cached ? 'cached' : 'live ref'}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
        {entry.cached && (
          <a
            href={remoteFileUrl(entry.owner, entry.fileId)}
            download={entry.name}
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-black/80"
            title="Download"
          >↓</a>
        )}
        {entry.cached && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlant(); }}
            className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-accent"
            title="Plant to grove"
          >Plant</button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDecline(); }}
          className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600"
          title="Remove"
        >×</button>
      </div>
    </div>
  );
}

function TrustList({ trusted, blocked, onUntrust, onUnblock, onTrust, onBlock }: {
  trusted: Set<string>; blocked: Set<string>;
  onUntrust: (s: string) => void; onUnblock: (s: string) => void;
  onTrust: (s: string) => void; onBlock: (s: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'trust' | 'block'>('trust');

  function addShip() {
    const norm = normalizeShip(draft);
    if (!norm) return;
    if (mode === 'trust') onTrust(norm);
    else onBlock(norm);
    setDraft('');
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-muted mb-1">Trusted (offers auto-accept)</div>
        <div className="flex flex-wrap gap-1">
          {Array.from(trusted).sort().map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1 font-mono">
              {s}
              <button onClick={() => onUntrust(s)} className="text-faint hover:text-red-600">×</button>
            </span>
          ))}
          {trusted.size === 0 && <span className="text-xs text-faint">No trusted ships</span>}
        </div>
      </div>
      <div>
        <div className="text-xs text-muted mb-1">Blocked (offers dropped silently)</div>
        <div className="flex flex-wrap gap-1">
          {Array.from(blocked).sort().map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1 font-mono">
              {s}
              <button onClick={() => onUnblock(s)} className="text-faint hover:text-red-600">×</button>
            </span>
          ))}
          {blocked.size === 0 && <span className="text-xs text-faint">No blocked ships</span>}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <select value={mode} onChange={(e) => setMode(e.target.value as 'trust' | 'block')} className="text-xs border border-border rounded px-1 py-1">
          <option value="trust">Trust</option>
          <option value="block">Block</option>
        </select>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addShip(); } }}
          placeholder="~sampel-palnet"
          className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
        />
        <button onClick={addShip} className="text-xs px-2 py-1 rounded bg-accent text-white">Add</button>
      </div>
    </div>
  );
}
