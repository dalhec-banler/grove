import { useEffect, useMemo, useState } from 'react';
import type { CanopyEntry, CanopyConfig, CanopyListing, CanopyMode, InboxEntry } from '../types';
import { formatBytes, formatDate, fileIcon } from '../format';
import { remoteFileUrl, IMAGE_MARKS, scryCanopySearch, CanopySearchHit } from '../api';

type SortKey = 'published' | 'name' | 'size' | 'type';

function sortEntries(entries: CanopyEntry[], key: SortKey): CanopyEntry[] {
  const list = entries.slice();
  switch (key) {
    case 'published': return list.sort((a, b) => b.published.localeCompare(a.published));
    case 'name':      return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    case 'size':      return list.sort((a, b) => b.size - a.size);
    case 'type':      return list.sort((a, b) => a.fileMark.localeCompare(b.fileMark) || a.displayName.localeCompare(b.displayName));
  }
}

function filterEntries(entries: CanopyEntry[], tags: Set<string>, types: Set<string>, search: string): CanopyEntry[] {
  const q = search.trim().toLowerCase();
  return entries.filter((e) => {
    if (tags.size > 0 && !Array.from(tags).every((t) => e.tags.includes(t))) return false;
    if (types.size > 0 && !types.has(e.fileMark.toLowerCase())) return false;
    if (q) {
      const hay = `${e.displayName} ${e.description} ${e.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function facets(entries: CanopyEntry[]): { tags: Array<[string, number]>; types: Array<[string, number]> } {
  const t = new Map<string, number>();
  const m = new Map<string, number>();
  for (const e of entries) {
    for (const tag of e.tags) t.set(tag, (t.get(tag) ?? 0) + 1);
    const k = e.fileMark.toLowerCase();
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return {
    tags: Array.from(t.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    types: Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}

function FilterBar({
  search, onSearch, sortKey, onSort, tagFacets, typeFacets, activeTags, activeTypes, onToggleTag, onToggleType, onClear,
}: {
  search: string; onSearch: (s: string) => void;
  sortKey: SortKey; onSort: (k: SortKey) => void;
  tagFacets: Array<[string, number]>; typeFacets: Array<[string, number]>;
  activeTags: Set<string>; activeTypes: Set<string>;
  onToggleTag: (t: string) => void; onToggleType: (t: string) => void;
  onClear: () => void;
}) {
  const hasActive = activeTags.size > 0 || activeTypes.size > 0 || search.trim().length > 0;
  return (
    <div className="border border-border rounded-lg bg-surface p-3 space-y-3">
      <div className="flex gap-2 items-center">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Filter entries…"
          className="flex-1 border border-border rounded px-2 py-1 text-sm"
        />
        <select
          value={sortKey}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="text-xs border border-border rounded px-2 py-1"
        >
          <option value="published">Recently published</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
          <option value="type">Type</option>
        </select>
        {hasActive && (
          <button onClick={onClear} className="text-xs text-muted hover:text-ink">Clear</button>
        )}
      </div>
      {(tagFacets.length > 0 || typeFacets.length > 0) && (
        <div className="space-y-2">
          {typeFacets.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] uppercase tracking-wider text-faint mr-1">Type</span>
              {typeFacets.map(([t, c]) => {
                const on = activeTypes.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => onToggleType(t)}
                    className={`text-xs px-2 py-0.5 rounded border ${on ? 'bg-accent-soft border-accent text-accent' : 'border-border text-muted hover:text-ink'}`}
                  >
                    {t} <span className="text-faint">{c}</span>
                  </button>
                );
              })}
            </div>
          )}
          {tagFacets.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] uppercase tracking-wider text-faint mr-1">Tags</span>
              {tagFacets.map(([t, c]) => {
                const on = activeTags.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => onToggleTag(t)}
                    className={`text-xs px-2 py-0.5 rounded border ${on ? 'bg-accent-soft border-accent text-accent' : 'border-border text-muted hover:text-ink'}`}
                  >
                    #{t} <span className="text-faint">{c}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SHIP_RX = /^~?[a-z]{3,}(-[a-z]{3,})*$/;
function normalizeShip(s: string): string | null {
  const t = s.trim().toLowerCase().replace(/^~/, '');
  if (!t || !SHIP_RX.test(`~${t}`)) return null;
  return `~${t}`;
}

interface MineProps {
  kind: 'mine';
  entries: CanopyEntry[];
  config: CanopyConfig;
  onUnpublish: (fileId: string) => void;
  onSetMode: (m: CanopyMode) => void;
  onSetName: (name: string) => void;
  onAddFriend: (ship: string) => void;
  onRemoveFriend: (ship: string) => void;
}

interface BrowseProps {
  kind: 'browse';
  onSubscribe: (ship: string) => void;
  subscribed: Set<string>;
}

interface PeerProps {
  kind: 'peer';
  host: string;
  listing: CanopyListing | null;
  cache: Map<string, InboxEntry>;
  onFetch: (host: string, id: string) => void;
  onPlant: (host: string, id: string) => void;
  onDropCache: (host: string, id: string) => void;
  onUnsubscribe: (ship: string) => void;
}

export default function CanopyView(p: MineProps | BrowseProps | PeerProps) {
  if (p.kind === 'mine') return <MineView {...p} />;
  if (p.kind === 'browse') return <BrowseView {...p} />;
  return <PeerView {...p} />;
}

function MineView(p: MineProps) {
  const [nameDraft, setNameDraft] = useState(p.config.name);
  const [friendDraft, setFriendDraft] = useState('');
  const [friendErr, setFriendErr] = useState<string | null>(null);

  useEffect(() => { setNameDraft(p.config.name); }, [p.config.name]);

  function addFriend() {
    const norm = normalizeShip(friendDraft);
    if (!norm) { setFriendErr('not a valid @p'); return; }
    if (p.config.friends.includes(norm)) { setFriendErr('already a friend'); return; }
    setFriendErr(null);
    p.onAddFriend(norm);
    setFriendDraft('');
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <section className="border border-border rounded-lg bg-surface p-4">
        <h2 className="text-sm font-medium mb-3">Canopy settings</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1">Catalog name</label>
            <div className="flex gap-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="e.g. Austin's library"
                className="flex-1 border border-border rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() => p.onSetName(nameDraft)}
                disabled={nameDraft === p.config.name}
                className="text-xs px-3 py-1 rounded bg-accent text-white disabled:opacity-40"
              >Save</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Visibility</label>
            <div className="flex border border-border rounded overflow-hidden text-xs w-fit">
              <button
                onClick={() => p.onSetMode('open')}
                className={`px-3 py-1 ${p.config.mode === 'open' ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-bg'}`}
              >Open · anyone</button>
              <button
                onClick={() => p.onSetMode('friends')}
                className={`px-3 py-1 border-l border-border ${p.config.mode === 'friends' ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-bg'}`}
              >Friends only</button>
            </div>
            <div className="text-xs text-faint mt-1">
              {p.config.mode === 'open'
                ? 'Anyone can subscribe and download published files.'
                : 'Only ships on your friends list can see and download.'}
            </div>
          </div>
          {p.config.mode === 'friends' && (
            <div>
              <label className="text-xs text-muted block mb-1">Friends</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {p.config.friends.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1 font-mono">
                    {s}
                    <button onClick={() => p.onRemoveFriend(s)} className="text-faint hover:text-red-600">×</button>
                  </span>
                ))}
                {p.config.friends.length === 0 && <span className="text-xs text-faint">No friends yet</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={friendDraft}
                  onChange={(e) => { setFriendDraft(e.target.value); setFriendErr(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFriend(); } }}
                  placeholder="~sampel-palnet"
                  className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
                />
                <button onClick={addFriend} className="text-xs px-3 py-1 rounded bg-accent text-white">Add</button>
              </div>
              {friendErr && <div className="text-xs text-red-600 mt-1">{friendErr}</div>}
            </div>
          )}
        </div>
      </section>

      <MinePublished entries={p.entries} onUnpublish={p.onUnpublish} />
    </div>
  );
}

function MinePublished({ entries, onUnpublish }: { entries: CanopyEntry[]; onUnpublish: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('published');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const { tags: tagFacets, types: typeFacets } = useMemo(() => facets(entries), [entries]);
  const visible = useMemo(
    () => sortEntries(filterEntries(entries, activeTags, activeTypes, search), sortKey),
    [entries, activeTags, activeTypes, search, sortKey]
  );

  function toggleTag(t: string) {
    const n = new Set(activeTags);
    n.has(t) ? n.delete(t) : n.add(t);
    setActiveTags(n);
  }
  function toggleType(t: string) {
    const n = new Set(activeTypes);
    n.has(t) ? n.delete(t) : n.add(t);
    setActiveTypes(n);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Published files ({visible.length}{visible.length !== entries.length && ` of ${entries.length}`})</h2>
      {entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-faint">
          Nothing published yet. Open a file's details to publish it to your canopy.
        </div>
      ) : (
        <>
          <FilterBar
            search={search} onSearch={setSearch}
            sortKey={sortKey} onSort={setSortKey}
            tagFacets={tagFacets} typeFacets={typeFacets}
            activeTags={activeTags} activeTypes={activeTypes}
            onToggleTag={toggleTag} onToggleType={toggleType}
            onClear={() => { setActiveTags(new Set()); setActiveTypes(new Set()); setSearch(''); }}
          />
          {visible.length === 0 ? (
            <div className="text-xs text-faint">No entries match those filters.</div>
          ) : (
            <div className="space-y-2">
              {visible.map((e) => (
                <MineRow key={e.id} entry={e} onUnpublish={() => onUnpublish(e.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function MineRow({ entry, onUnpublish }: { entry: CanopyEntry; onUnpublish: () => void }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-surface flex items-center gap-3">
      <span className="text-2xl">{fileIcon(entry.fileMark)}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{entry.displayName}</div>
        {entry.description && <div className="text-xs text-muted truncate">{entry.description}</div>}
        <div className="text-xs text-faint">
          {formatBytes(entry.size)} · published {formatDate(entry.published)}
          {entry.tags.length > 0 && <> · {entry.tags.map((t) => `#${t}`).join(' ')}</>}
        </div>
      </div>
      <button
        onClick={() => { if (confirm('Unpublish from canopy?')) onUnpublish(); }}
        className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-red-600"
      >Unpublish</button>
    </div>
  );
}

function BrowseView(p: BrowseProps) {
  const [peerDraft, setPeerDraft] = useState('');
  const [peerErr, setPeerErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hits, setHits] = useState<CanopySearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) { setHits([]); return; }
    let cancelled = false;
    setSearching(true);
    const h = setTimeout(() => {
      scryCanopySearch(q)
        .then((r) => { if (!cancelled) setHits(r); })
        .catch((e) => { if (!cancelled) { console.error('search', e); setHits([]); } })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(h); };
  }, [searchTerm]);

  function subscribe() {
    const norm = normalizeShip(peerDraft);
    if (!norm) { setPeerErr('not a valid @p'); return; }
    setPeerErr(null);
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
            onChange={(e) => { setPeerDraft(e.target.value); setPeerErr(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); subscribe(); } }}
            placeholder="~sampel-palnet"
            className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
          />
          <button onClick={subscribe} className="text-xs px-3 py-1 rounded bg-accent text-white">Subscribe</button>
        </div>
        {peerErr && <div className="text-xs text-red-600 mt-1">{peerErr}</div>}
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
        {!searching && searchTerm.trim() && hits.length === 0 && (
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
                <span className="text-2xl">{fileIcon(h.entry.fileMark)}</span>
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

function PeerView(p: PeerProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('published');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const baseEntries = p.listing?.entries ?? [];
  const { tags: tagFacets, types: typeFacets } = useMemo(() => facets(baseEntries), [baseEntries]);
  const entries = useMemo(
    () => sortEntries(filterEntries(baseEntries, activeTags, activeTypes, search), sortKey),
    [baseEntries, activeTags, activeTypes, search, sortKey]
  );

  function toggleTag(t: string) {
    const n = new Set(activeTags);
    n.has(t) ? n.delete(t) : n.add(t);
    setActiveTags(n);
  }
  function toggleType(t: string) {
    const n = new Set(activeTypes);
    n.has(t) ? n.delete(t) : n.add(t);
    setActiveTypes(n);
  }

  if (!p.listing) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-sm text-faint mb-3">Waiting for {p.host}'s catalog…</div>
          <button
            onClick={() => { if (confirm(`Unsubscribe from ${p.host}?`)) p.onUnsubscribe(p.host); }}
            className="text-xs px-3 py-1 rounded border border-border text-muted hover:text-red-600"
          >Unsubscribe</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium truncate">{p.listing.name || p.listing.host}</h2>
          <div className="text-xs text-faint font-mono truncate">{p.listing.host} · {p.listing.mode}</div>
        </div>
        <button
          onClick={() => { if (confirm(`Unsubscribe from ${p.host}?`)) p.onUnsubscribe(p.host); }}
          className="text-xs px-3 py-1 rounded border border-border text-muted hover:text-red-600"
        >Unsubscribe</button>
      </div>
      <FilterBar
        search={search} onSearch={setSearch}
        sortKey={sortKey} onSort={setSortKey}
        tagFacets={tagFacets} typeFacets={typeFacets}
        activeTags={activeTags} activeTypes={activeTypes}
        onToggleTag={toggleTag} onToggleType={toggleType}
        onClear={() => { setActiveTags(new Set()); setActiveTypes(new Set()); setSearch(''); }}
      />
      {entries.length === 0 ? (
        <div className="text-sm text-faint">
          {p.listing.entries.length === 0 ? 'This catalog is empty.' : 'No matches for those filters.'}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
              const cacheKey = `${p.host}/${e.id}`;
              const cached = p.cache.get(cacheKey);
              return (
                <PeerRow
                  key={e.id}
                  host={p.host}
                  entry={e}
                  cached={cached}
                  onFetch={() => p.onFetch(p.host, e.id)}
                  onPlant={() => p.onPlant(p.host, e.id)}
                  onDropCache={() => p.onDropCache(p.host, e.id)}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}

function PeerRow({ host, entry, cached, onFetch, onPlant, onDropCache }: {
  host: string; entry: CanopyEntry; cached: InboxEntry | undefined;
  onFetch: () => void; onPlant: () => void; onDropCache: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = IMAGE_MARKS.has(entry.fileMark.toLowerCase());
  const isCached = !!cached?.cached;

  function open() {
    if (!isCached) onFetch();
    setShowPreview(true);
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-surface">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{fileIcon(entry.fileMark)}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{entry.displayName}</div>
          {entry.description && <div className="text-xs text-muted truncate">{entry.description}</div>}
          <div className="text-xs text-faint">
            {formatBytes(entry.size)} · published {formatDate(entry.published)}
            {entry.tags.length > 0 && <> · {entry.tags.map((t) => `#${t}`).join(' ')}</>}
            {isCached && ' · cached'}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={open} className="text-xs px-2 py-1 rounded bg-accent text-white hover:opacity-90">
            {isCached ? 'Open' : 'Fetch'}
          </button>
          {isCached && (
            <a
              href={remoteFileUrl(host, entry.id)}
              download={entry.displayName}
              className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent"
            >Download</a>
          )}
          <button
            onClick={onPlant}
            disabled={!isCached}
            className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent disabled:opacity-40"
            title="Copy into your own grove"
          >Plant</button>
        </div>
      </div>
      {showPreview && isCached && (
        <div className="mt-3 border-t border-border pt-3">
          {isImage ? (
            <img src={remoteFileUrl(host, entry.id)} alt={entry.displayName} className="max-h-96 mx-auto rounded" />
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
