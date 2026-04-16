import { useState } from 'react';
import type { FileMeta } from '../types';

interface Props {
  file: FileMeta;
  onClose: () => void;
  onPublish: (args: { displayName: string; tags: string[]; description: string }) => void;
}

export default function PublishModal({ file, onClose, onPublish }: Props) {
  const [displayName, setDisplayName] = useState(file.name);
  const [description, setDescription] = useState(file.description || '');
  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>(file.tags);

  function addTag() {
    const t = tagDraft.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagDraft('');
  }

  function submit() {
    if (!displayName.trim()) return;
    onPublish({ displayName: displayName.trim(), tags, description });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Publish to canopy</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">×</button>
        </div>
        <div className="space-y-4">
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
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
              placeholder="Add tag…"
              className="w-full border border-border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="text-xs text-faint">
            This file will be visible to everyone (or just friends) depending on your canopy visibility setting.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-ink">Cancel</button>
            <button
              onClick={submit}
              disabled={!displayName.trim()}
              className="text-xs px-3 py-1.5 rounded bg-accent text-white disabled:opacity-40"
            >Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
}
