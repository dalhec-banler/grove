import { useState } from 'react';
import type { FileMeta, CatalogConfig } from '../types';
import { addTag } from '../format';
import Backdrop from './Backdrop';

interface Props {
  file: FileMeta;
  catalogs: Map<string, CatalogConfig>;
  onClose: () => void;
  onPublish: (catalogId: string, args: { displayName: string; tags: string[]; description: string }) => void;
}

export default function PublishModal({ file, catalogs, onClose, onPublish }: Props) {
  const catalogList = Array.from(catalogs.entries());
  const [selectedCatalog, setSelectedCatalog] = useState(catalogList.length > 0 ? catalogList[0][0] : '');
  const [displayName, setDisplayName] = useState(file.name);
  const [description, setDescription] = useState(file.description || '');
  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>(file.tags);

  function handleAddTag(t: string) {
    const updated = addTag(tags, t);
    if (!updated) return;
    setTags(updated);
    setTagDraft('');
  }

  function submit() {
    if (!displayName.trim() || !selectedCatalog) return;
    onPublish(selectedCatalog, { displayName: displayName.trim(), tags, description });
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Add to catalog</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">×</button>
        </div>
        <div className="space-y-4">
          {catalogList.length === 0 ? (
            <div className="text-xs text-muted p-3 bg-bg rounded border border-border">
              No catalogs yet. Create a catalog first from the Catalogs page.
            </div>
          ) : (
            <div>
              <label className="text-xs text-muted block mb-1">Catalog</label>
              <select
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm"
              >
                {catalogList.map(([cid, cat]) => (
                  <option key={cid} value={cid}>{cat.name || cid} ({cat.mode})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-muted block mb-1">Display name</label>
            <input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional. What is this?"
              className="w-full border border-border rounded px-2 py-1.5 text-sm resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-faint hover:text-red-600">×</button>
                </span>
              ))}
              {tags.length === 0 && <span className="text-xs text-faint">No tags</span>}
            </div>
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(tagDraft); } }}
              placeholder="Add tag..."
              className="w-full border border-border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-ink">Cancel</button>
            <button
              onClick={submit}
              disabled={!displayName.trim() || !selectedCatalog}
              className="text-xs px-3 py-1.5 rounded bg-canopy text-white disabled:opacity-40"
            >Add to Catalog</button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
}
