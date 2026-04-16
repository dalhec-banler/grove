import type { InboxEntry, SortKey } from '../types';
import { sortByKey } from '../sort';
import { PendingRow, PendingCard } from './InboxPending';
import { AcceptedRow, AcceptedCard } from './InboxAccepted';
import TrustList from './InboxTrust';
import ListGridLayout from './ListGridLayout';

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
          <ListGridLayout
            items={pending}
            viewMode={viewMode}
            keyFn={(e) => `${e.owner}/${e.fileId}`}
            renderRow={(e) => (
              <PendingRow entry={e} trusted={trusted.has(e.owner)} blocked={blocked.has(e.owner)}
                onAccept={() => onAccept(e)} onDecline={() => onDecline(e)} onTrust={() => onTrust(e.owner)} onBlock={() => onBlock(e.owner)} />
            )}
            renderCard={(e) => (
              <PendingCard entry={e} trusted={trusted.has(e.owner)} blocked={blocked.has(e.owner)}
                onAccept={() => onAccept(e)} onDecline={() => onDecline(e)} onTrust={() => onTrust(e.owner)} onBlock={() => onBlock(e.owner)} />
            )}
          />
        </Section>
      )}

      <Section title={`Shared with me (${accepted.length})`}>
        {accepted.length === 0 ? (
          <div className="text-sm text-faint">Nothing shared with you yet.</div>
        ) : (
          <ListGridLayout
            items={accepted}
            viewMode={viewMode}
            keyFn={(e) => `${e.owner}/${e.fileId}`}
            renderRow={(e) => (
              <AcceptedRow entry={e} onFetch={() => onFetch(e)} onPlant={() => onPlant(e)} onDropCache={() => onDropCache(e)} onDecline={() => onDecline(e)} />
            )}
            renderCard={(e) => (
              <AcceptedCard entry={e} onFetch={() => onFetch(e)} onPlant={() => onPlant(e)} onDropCache={() => onDropCache(e)} onDecline={() => onDecline(e)} />
            )}
          />
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
