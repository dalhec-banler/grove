import { useState } from 'react';
import type { FileMeta } from '../types';
import { fileIcon } from '../format';
import { fileUrl, IMAGE_MARKS } from '../api';

interface Props {
  files: FileMeta[];
  allTags: string[];
  onClose: () => void;
  onApply: (opts: { tags: string[]; makePublic: boolean }) => void;
}

export default function BulkTagModal({ files, allTags, onClose, onApply }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [makePublic, setMakePublic] = useState(false);

  function addTag(t: string) {
    const clean = t.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagInput('');
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-xl w-[520px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-medium">Tag {files.length} upload{files.length > 1 ? 's' : ''}</h2>
          <p className="text-xs text-muted mt-1">Tags you add here will apply to all of them.</p>
        </div>

        <div className="p-4 border-b border-border overflow-y-auto max-h-48">
          <div className="space-y-1">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-sm">
                {IMAGE_MARKS.has(f.fileMark.toLowerCase()) ? (
                  <img src={fileUrl(f.id)} alt="" className="w-6 h-6 object-cover rounded border border-border" />
                ) : (
                  <span className="text-base w-6 text-center">{fileIcon(f.fileMark)}</span>
                )}
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <label className="block text-xs text-muted mb-1">Tags</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded bg-accent-soft text-accent flex items-center gap-1">
                {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-ink">×</button>
              </span>
            ))}
          </div>
          <input
            autoFocus
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
            }}
            placeholder="type a tag and press Enter"
            className="w-full border border-border rounded px-2 py-1.5 text-sm mb-2"
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {allTags.filter((t) => !tags.includes(t)).slice(0, 20).map((t) => (
                <button key={t} onClick={() => addTag(t)} className="text-xs px-1.5 py-0.5 rounded border border-border text-muted hover:bg-bg">
                  + {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={makePublic}
              onChange={(e) => setMakePublic(e.target.checked)}
            />
            <span>Make publicly shareable (generates a link anyone can use)</span>
          </label>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-muted hover:text-ink">Skip</button>
          <button
            onClick={() => onApply({ tags, makePublic })}
            disabled={tags.length === 0 && !makePublic}
            className="text-sm px-3 py-1.5 rounded-md bg-accent text-white disabled:opacity-50"
          >
            Apply to {files.length}
          </button>
        </div>
      </div>
    </div>
  );
}
