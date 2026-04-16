import type { InboxEntry, SortKey } from '../types';
import { sortByKey } from '../sort';
import { GRID_STYLE } from '../styles';
import { PendingRow, PendingCard } from './InboxPending';
import { AcceptedRow, AcceptedCard } from './InboxAccepted';
import TrustList from './InboxTrust';

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
  return sortByKey(entries, key, {
    name: (e) => e.name,
    date: (e) => e.offered,
    size: (e) => e.size,
    type: (e) => e.fileMark,
  });
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
            <div className="grid gap-4" style={GRID_STYLE}>
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
          <div className="grid gap-4" style={GRID_STYLE}>
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
