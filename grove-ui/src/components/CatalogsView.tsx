import { useState } from 'react';
import type { CatalogConfig, CatalogMode, Selection } from '../types';

interface Props {
  catalogs: Map<string, CatalogConfig>;
  onSelect: (s: Selection) => void;
  onCreateCatalog: (id: string, name: string, description: string, mode: CatalogMode) => void;
  onDeleteCatalog: (id: string) => void;
}

export default function CatalogsView({ catalogs, onSelect, onCreateCatalog, onDeleteCatalog }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMode, setNewMode] = useState<CatalogMode>('public');

  const catalogList = Array.from(catalogs.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name));

  function handleCreate() {
    const n = newName.trim();
    if (!n) return;
    const id = n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'catalog';
    onCreateCatalog(id, n, newDesc.trim(), newMode);
    setNewName('');
    setNewDesc('');
    setNewMode('public');
    setShowCreate(false);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium">My Catalogs</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs px-3 py-1.5 rounded bg-canopy text-white hover:opacity-90"
        >
          + New Catalog
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-bg">
          <div className="space-y-3">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Catalog name..."
              className="w-full border border-border rounded px-2 py-1.5 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full border border-border rounded px-2 py-1.5 text-sm resize-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Visibility:</span>
              {(['public', 'pals', 'group'] as CatalogMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setNewMode(m)}
                  className={`text-xs px-2 py-1 rounded border ${
                    newMode === m ? 'border-canopy bg-canopy-soft text-canopy' : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  {m === 'public' ? 'Public' : m === 'pals' ? 'Pals' : 'Group'}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="text-xs px-3 py-1.5 rounded border border-border text-muted">Cancel</button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="text-xs px-3 py-1.5 rounded bg-canopy text-white disabled:opacity-40">Create</button>
            </div>
          </div>
        </div>
      )}

      {catalogList.length === 0 && !showCreate ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">No catalogs yet.</p>
          <p className="text-xs mt-1">Create a catalog to organize and share files with others.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {catalogList.map(([cid, cat]) => (
            <button
              key={cid}
              onClick={() => onSelect({ kind: 'catalog', catalogId: cid })}
              className="text-left p-4 rounded-lg border border-border hover:border-canopy hover:bg-canopy-soft/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">{cat.name || cid}</div>
                  {cat.description && <div className="text-xs text-muted mt-0.5 line-clamp-2">{cat.description}</div>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-faint">
                    <span>{cat.files.length} file{cat.files.length !== 1 ? 's' : ''}</span>
                    <span className="px-1.5 py-0.5 rounded bg-bg border border-border capitalize">{cat.mode}</span>
                    {cat.friends.length > 0 && <span>{cat.friends.length} friend{cat.friends.length !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete catalog "${cat.name || cid}"? Files won't be deleted.`)) onDeleteCatalog(cid);
                  }}
                  className="text-xs text-faint hover:text-red-600 px-1 shrink-0"
                  title="Delete catalog"
                >×</button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
