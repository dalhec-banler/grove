import { useState, useMemo } from 'react';
import type { CatalogConfig, CatalogMode, FileMeta, GroupInfo, GroupFlag, ViewMode } from '../types';
import { formatBytes } from '../format';
import { fileUrl } from '../urls';
import { GRID_STYLE } from '../styles';
import Thumb from './Thumb';

interface Props {
  catalogId: string;
  config: CatalogConfig;
  allFiles: Map<string, FileMeta>;
  groups: GroupInfo[];
  viewMode: ViewMode;
  search: string;
  onUpdateCatalog: (id: string, name: string, description: string) => void;
  onSetMode: (id: string, mode: CatalogMode) => void;
  onSetGroup: (id: string, flag: GroupFlag | null) => void;
  onAddFriend: (id: string, who: string) => void;
  onRemoveFriend: (id: string, who: string) => void;
  onRemoveFile: (catalogId: string, fileId: string) => void;
}

export default function CatalogDetailView({
  catalogId, config, allFiles, groups, viewMode, search,
  onUpdateCatalog, onSetMode, onSetGroup, onAddFriend, onRemoveFriend, onRemoveFile,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(config.name);
  const [descVal, setDescVal] = useState(config.description);
  const [friendDraft, setFriendDraft] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const entries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return config.files
      .map((fid) => allFiles.get(fid))
      .filter((f): f is FileMeta => !!f)
      .filter((f) => !q || f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => b.modified.localeCompare(a.modified));
  }, [config.files, allFiles, search]);

  function saveName() {
    onUpdateCatalog(catalogId, nameVal.trim() || config.name, descVal.trim());
    setEditingName(false);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="space-y-2">
              <input
                autoFocus
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm font-medium"
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              />
              <textarea
                value={descVal}
                onChange={(e) => setDescVal(e.target.value)}
                placeholder="Description..."
                rows={2}
                className="w-full border border-border rounded px-2 py-1.5 text-sm resize-none"
              />
              <div className="flex gap-2">
                <button onClick={saveName} className="text-xs px-2 py-1 rounded bg-canopy text-white">Save</button>
                <button onClick={() => setEditingName(false)} className="text-xs px-2 py-1 rounded border border-border text-muted">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => { setNameVal(config.name); setDescVal(config.description); setEditingName(true); }} className="text-left">
                <h2 className="text-base font-medium hover:text-canopy">{config.name || catalogId}</h2>
                {config.description && <p className="text-xs text-muted mt-0.5">{config.description}</p>}
              </button>
              <div className="flex items-center gap-3 mt-2 text-xs text-faint">
                <span>{entries.length} file{entries.length !== 1 ? 's' : ''}</span>
                <span className="px-1.5 py-0.5 rounded bg-bg border border-border capitalize">{config.mode}</span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`text-xs px-2 py-1 rounded border ${showSettings ? 'border-canopy text-canopy bg-canopy-soft' : 'border-border text-muted hover:text-ink'}`}
        >
          Settings
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-bg space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1">Visibility</label>
            <div className="flex gap-2">
              {(['public', 'pals', 'group'] as CatalogMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onSetMode(catalogId, m)}
                  className={`text-xs px-3 py-1.5 rounded border ${
                    config.mode === m ? 'border-canopy bg-canopy-soft text-canopy font-medium' : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  {m === 'public' ? 'Public' : m === 'pals' ? 'Pals' : 'Group'}
                </button>
              ))}
            </div>
          </div>

          {config.mode === 'pals' && (
            <div>
              <label className="text-xs text-muted block mb-1">Additional friends (beyond Pals)</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {config.friends.map((f) => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded bg-surface border border-border flex items-center gap-1 font-mono">
                    {f}
                    <button onClick={() => onRemoveFriend(catalogId, f)} className="text-faint hover:text-red-600">×</button>
                  </span>
                ))}
                {config.friends.length === 0 && <span className="text-xs text-faint">None</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={friendDraft}
                  onChange={(e) => setFriendDraft(e.target.value)}
                  placeholder="~sampel-palnet"
                  className="flex-1 border border-border rounded px-2 py-1 text-xs font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && friendDraft.trim()) {
                      onAddFriend(catalogId, friendDraft.trim());
                      setFriendDraft('');
                    }
                  }}
                />
                <button
                  onClick={() => { if (friendDraft.trim()) { onAddFriend(catalogId, friendDraft.trim()); setFriendDraft(''); } }}
                  className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-ink"
                >Add</button>
              </div>
            </div>
          )}

          {config.mode === 'group' && (
            <div>
              <label className="text-xs text-muted block mb-1">Tlon Group</label>
              {groups.length === 0 ? (
                <p className="text-xs text-faint">No groups found. Is the Groups app installed?</p>
              ) : (
                <select
                  value={config.groupFlag ? `${config.groupFlag.host}/${config.groupFlag.name}` : ''}
                  onChange={(e) => {
                    if (!e.target.value) { onSetGroup(catalogId, null); return; }
                    const [host, name] = e.target.value.split('/');
                    onSetGroup(catalogId, { host, name });
                  }}
                  className="w-full border border-border rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Select a group...</option>
                  {groups.map((g) => (
                    <option key={`${g.host}/${g.name}`} value={`${g.host}/${g.name}`}>
                      {g.title || g.name} ({g.members} members)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">{search.trim() ? 'No matching files.' : 'No files in this catalog yet.'}</p>
          {!search.trim() && <p className="text-xs mt-1">Add files from the file detail panel or drag & drop.</p>}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4" style={GRID_STYLE}>
          {entries.map((f) => (
            <div key={f.id} className="group relative rounded-lg border border-border bg-surface overflow-hidden hover:border-ink/20">
              <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
                <Thumb mark={f.fileMark} src={fileUrl(f.id)} size="fill" />
              </div>
              <div className="p-2">
                <div className="text-sm truncate" title={f.name}>{f.name}</div>
                <div className="text-xs text-muted flex justify-between mt-0.5">
                  <span className="uppercase">{f.fileMark}</span>
                  <span>{formatBytes(f.size)}</span>
                </div>
                {f.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1 rounded bg-bg border border-border text-muted">{t}</span>
                    ))}
                    {f.tags.length > 2 && <span className="text-[10px] text-faint">+{f.tags.length - 2}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemoveFile(catalogId, f.id)}
                className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600 md:opacity-0 md:group-hover:opacity-100"
                title="Remove from catalog"
              >Remove</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border">
          {entries.map((f) => (
            <div key={f.id} className="flex items-center px-4 py-2.5 hover:bg-bg group">
              <Thumb mark={f.fileMark} src={fileUrl(f.id)} size="sm" />
              <div className="min-w-0 flex-1 ml-3">
                <div className="text-sm truncate">{f.name}</div>
                <div className="flex items-center gap-2 text-xs text-faint mt-0.5">
                  <span className="uppercase">{f.fileMark}</span>
                  <span>{formatBytes(f.size)}</span>
                  {f.tags.length > 0 && <span>{f.tags.join(', ')}</span>}
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(catalogId, f.id)}
                className="text-xs text-faint hover:text-red-600 px-2 opacity-0 group-hover:opacity-100"
                title="Remove from catalog"
              >Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
