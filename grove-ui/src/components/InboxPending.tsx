import type { InboxEntry } from '../types';
import { formatBytes, formatDate } from '../format';
import FileIcon from './FileIcon';
import Thumb from './Thumb';

export function PendingRow({ entry, trusted, blocked, onAccept, onDecline, onTrust, onBlock }: {
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

export function PendingCard({ entry, trusted, blocked, onAccept, onDecline, onTrust, onBlock }: {
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
