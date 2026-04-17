import { useEffect, useState } from 'react';
import type { CanopyConfig, CanopyEntry, CanopyMode, GroupInfo, SortKey } from '../types';
import { formatBytes, formatDate, normalizeShip } from '../format';
import { fileUrl } from '../urls';
import Thumb from './Thumb';
import ListGridLayout from './ListGridLayout';
import ShipChip from './ShipChip';
import { useFacetFilter, FacetChips } from './CanopyUtils';

export interface MineProps {
  kind: 'mine';
  entries: CanopyEntry[];
  config: CanopyConfig;
  search: string;
  sortKey: SortKey;
  viewMode: 'list' | 'grid';
  onUnpublish: (fileId: string) => void;
  onSetMode: (m: CanopyMode) => void;
  onSetName: (name: string) => void;
  onAddFriend: (ship: string) => void;
  onRemoveFriend: (ship: string) => void;
  onSetGroup: (flag: { host: string; name: string } | null) => void;
  groups: GroupInfo[];
}

export default function MineView({
  entries, config, search, sortKey, viewMode,
  onUnpublish, onSetMode, onSetName, onAddFriend, onRemoveFriend, onSetGroup, groups,
}: MineProps) {
  const [nameDraft, setNameDraft] = useState(config.name);
  const [friendDraft, setFriendDraft] = useState('');
  const [friendError, setFriendError] = useState<string | null>(null);

  useEffect(() => { setNameDraft(config.name); }, [config.name]);

  function addFriend() {
    const norm = normalizeShip(friendDraft);
    if (!norm) { setFriendError('not a valid @p'); return; }
    if (config.friends.includes(norm)) { setFriendError('already a friend'); return; }
    setFriendError(null);
    onAddFriend(norm);
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
                onClick={() => onSetName(nameDraft)}
                disabled={nameDraft === config.name}
                className="text-xs px-3 py-1 rounded bg-canopy text-white disabled:opacity-40"
              >Save</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Visibility</label>
            <div className="flex border border-border rounded overflow-hidden text-xs w-fit">
              <button
                onClick={() => onSetMode('open')}
                className={`px-3 py-1 ${config.mode === 'open' ? 'bg-canopy-soft text-canopy' : 'text-muted hover:bg-bg'}`}
              >Open · anyone</button>
              <button
                onClick={() => onSetMode('friends')}
                className={`px-3 py-1 border-l border-border ${config.mode === 'friends' ? 'bg-canopy-soft text-canopy' : 'text-muted hover:bg-bg'}`}
              >Friends only</button>
              <button
                onClick={() => onSetMode('group')}
                className={`px-3 py-1 border-l border-border ${config.mode === 'group' ? 'bg-canopy-soft text-canopy' : 'text-muted hover:bg-bg'}`}
              >Group</button>
            </div>
            <div className="text-xs text-faint mt-1">
              {config.mode === 'open'
                ? 'Anyone can subscribe and download published files.'
                : config.mode === 'friends'
                ? 'Only ships on your friends list can see and download.'
                : 'Only members of the selected Tlon group can see and download.'}
            </div>
          </div>
          {config.mode === 'friends' && (
            <div>
              <label className="text-xs text-muted block mb-1">Friends</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {config.friends.map((s) => (
                  <ShipChip key={s} ship={s} onRemove={() => onRemoveFriend(s)} />
                ))}
                {config.friends.length === 0 && <span className="text-xs text-faint">No friends yet</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={friendDraft}
                  onChange={(e) => { setFriendDraft(e.target.value); setFriendError(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFriend(); } }}
                  placeholder="~sampel-palnet"
                  className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
                />
                <button onClick={addFriend} className="text-xs px-3 py-1 rounded bg-canopy text-white">Add</button>
              </div>
              {friendError && <div className="text-xs text-red-600 mt-1">{friendError}</div>}
            </div>
          )}
          {config.mode === 'group' && (
            <div>
              <label className="text-xs text-muted block mb-1">Select a group</label>
              {groups.length === 0 ? (
                <div className="text-xs text-faint">No groups found. Join a group in Tlon Messenger first.</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g) => {
                      const isSelected = config.groupFlag?.host === g.host && config.groupFlag?.name === g.name;
                      return (
                        <button
                          key={`${g.host}/${g.name}`}
                          onClick={() => onSetGroup(isSelected ? null : { host: g.host, name: g.name })}
                          className={`text-xs px-3 py-1.5 rounded border ${isSelected ? 'bg-canopy-soft border-canopy text-canopy font-medium' : 'border-border text-muted hover:text-ink hover:border-ink/30'}`}
                        >
                          <div className="font-medium">{g.title || g.name}</div>
                          <div className="text-[10px] opacity-70">{g.members} members</div>
                        </button>
                      );
                    })}
                  </div>
                  {config.groupFlag && (
                    <div className="text-xs text-faint">
                      Linked to <span className="font-mono">{config.groupFlag.host}/{config.groupFlag.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <MinePublished entries={entries} search={search} sortKey={sortKey} viewMode={viewMode} onUnpublish={onUnpublish} />
    </div>
  );
}

function MinePublished({ entries, search, sortKey, viewMode, onUnpublish }: {
  entries: CanopyEntry[]; search: string; sortKey: SortKey; viewMode: 'list' | 'grid'; onUnpublish: (id: string) => void;
}) {
  const { filtered: visible, tagFacets, typeFacets, activeTags, activeTypes, toggleTag, toggleType, clearFilters } = useFacetFilter(entries, search, sortKey);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Published files ({visible.length}{visible.length !== entries.length && ` of ${entries.length}`})</h2>
      {entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-faint">
          Nothing published yet. Open a file's details to publish it to your canopy.
        </div>
      ) : (
        <>
          <FacetChips
            tagFacets={tagFacets} typeFacets={typeFacets}
            activeTags={activeTags} activeTypes={activeTypes}
            onToggleTag={toggleTag}
            onToggleType={toggleType}
            onClear={clearFilters}
          />
          {visible.length === 0 ? (
            <div className="text-xs text-faint">No entries match those filters.</div>
          ) : (
            <ListGridLayout
              items={visible}
              viewMode={viewMode}
              keyFn={(e) => e.id}
              renderRow={(e) => <MineRow entry={e} onUnpublish={() => onUnpublish(e.id)} />}
              renderCard={(e) => <MineCard entry={e} onUnpublish={() => onUnpublish(e.id)} />}
            />
          )}
        </>
      )}
    </section>
  );
}

function MineRow({ entry, onUnpublish }: { entry: CanopyEntry; onUnpublish: () => void }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-surface flex items-center gap-3">
      <Thumb mark={entry.fileMark} src={fileUrl(entry.id)} size="md" />
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

function MineCard({ entry, onUnpublish }: { entry: CanopyEntry; onUnpublish: () => void }) {
  return (
    <div className="group relative rounded-lg border border-border bg-surface overflow-hidden">
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        <Thumb mark={entry.fileMark} src={fileUrl(entry.id)} size="fill" />
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={entry.displayName}>{entry.displayName}</div>
        <div className="text-xs text-muted flex justify-between">
          <span>{formatBytes(entry.size)}</span>
          <span>{formatDate(entry.published)}</span>
        </div>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {entry.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] px-1 rounded bg-canopy-soft border border-canopy/20 text-canopy">{t}</span>
            ))}
            {entry.tags.length > 2 && <span className="text-[10px] text-faint">+{entry.tags.length - 2}</span>}
          </div>
        )}
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={() => { if (confirm('Unpublish from canopy?')) onUnpublish(); }}
          className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600"
        >×</button>
      </div>
    </div>
  );
}
