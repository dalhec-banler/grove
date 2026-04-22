import { useState } from 'react';
import type { InboxEntry } from '../types';
import { formatBytes } from '../format';
import { remoteFileUrl } from '../urls';
import Thumb from './Thumb';
import PreviewPane from './PreviewPane';

export function AcceptedRow({ entry, onFetch, onPlant, onDropCache, onDecline }: {
  entry: InboxEntry; onFetch: () => void; onPlant: () => void; onDropCache: () => void; onDecline: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

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
        <PreviewPane src={remoteFileUrl(entry.owner, entry.fileId)} name={entry.name} mark={entry.fileMark} onClose={() => { setShowPreview(false); onDropCache(); }} />
      )}
    </div>
  );
}

export function AcceptedCard({ entry, onFetch, onPlant, onDecline }: {
  entry: InboxEntry; onFetch: () => void; onPlant: () => void; onDecline: () => void;
}) {
  return (
    <div className="group relative rounded-lg border border-border bg-surface overflow-hidden cursor-pointer" onClick={() => { if (!entry.cached) onFetch(); }}>
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        <Thumb mark={entry.fileMark} src={entry.cached ? remoteFileUrl(entry.owner, entry.fileId) : undefined} size="fill" />
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={entry.name}>{entry.name}</div>
        <div className="text-xs text-muted font-mono truncate">{entry.owner}</div>
        <div className="text-xs text-faint">
          {formatBytes(entry.size)} · {entry.cached ? 'cached' : 'live ref'}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100">
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
