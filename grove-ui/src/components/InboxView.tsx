import { useState } from 'react';
import type { InboxEntry } from '../types';
import { formatBytes, formatDate, fileIcon } from '../format';
import { remoteFileUrl, IMAGE_MARKS } from '../api';

interface Props {
  entries: InboxEntry[];
  trusted: Set<string>;
  blocked: Set<string>;
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

export default function InboxView(p: Props) {
  const pending = p.entries.filter((e) => !e.accepted);
  const accepted = p.entries.filter((e) => e.accepted);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      {pending.length > 0 && (
        <Section title={`Pending offers (${pending.length})`}>
          <div className="space-y-2">
            {pending.map((e) => (
              <PendingRow
                key={`${e.owner}/${e.fileId}`}
                entry={e}
                trusted={p.trusted.has(e.owner)}
                blocked={p.blocked.has(e.owner)}
                onAccept={() => p.onAccept(e)}
                onDecline={() => p.onDecline(e)}
                onTrust={() => p.onTrust(e.owner)}
                onBlock={() => p.onBlock(e.owner)}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title={`Shared with me (${accepted.length})`}>
        {accepted.length === 0 ? (
          <div className="text-sm text-faint">Nothing shared with you yet.</div>
        ) : (
          <div className="space-y-2">
            {accepted.map((e) => (
              <AcceptedRow
                key={`${e.owner}/${e.fileId}`}
                entry={e}
                onFetch={() => p.onFetch(e)}
                onPlant={() => p.onPlant(e)}
                onDropCache={() => p.onDropCache(e)}
                onDecline={() => p.onDecline(e)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Trust">
        <TrustList
          trusted={p.trusted}
          blocked={p.blocked}
          onUntrust={p.onUntrust}
          onUnblock={p.onUnblock}
          onTrust={p.onTrust}
          onBlock={p.onBlock}
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
      <span className="text-2xl">{fileIcon(entry.fileMark)}</span>
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
        <span className="text-2xl">{fileIcon(entry.fileMark)}</span>
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

function TrustList({ trusted, blocked, onUntrust, onUnblock, onTrust, onBlock }: {
  trusted: Set<string>; blocked: Set<string>;
  onUntrust: (s: string) => void; onUnblock: (s: string) => void;
  onTrust: (s: string) => void; onBlock: (s: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'trust' | 'block'>('trust');

  function add() {
    const t = draft.trim().toLowerCase();
    if (!t) return;
    const norm = t.startsWith('~') ? t : `~${t}`;
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
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="~sampel-palnet"
          className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
        />
        <button onClick={add} className="text-xs px-2 py-1 rounded bg-accent text-white">Add</button>
      </div>
    </div>
  );
}
