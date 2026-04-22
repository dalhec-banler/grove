import { useState } from 'react';
import type { View } from '../types';
import { addTag } from '../format';
import Backdrop from './Backdrop';

interface Props {
  initial: View | null;
  allTags: string[];
  onClose: () => void;
  onSave: (name: string, tags: string[], color: string) => void;
}

const PALETTE = ['#3A6BC5', '#D97706', '#059669', '#DC2626', '#7C3AED', '#DB2777', '#0EA5E9', '#65A30D'];

export default function ViewModal({ initial, allTags, onClose, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);

  function handleAddTag(t: string) {
    const updated = addTag(tags, t);
    if (!updated) return;
    setTags(updated);
    setTagInput('');
  }

  const disabled = !name.trim() || tags.length === 0;

  function handleSave() {
    onSave(name.trim(), tags, color);
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-[90vw] max-w-[420px] p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-medium mb-4">{initial ? 'Edit view' : 'New view'}</h2>
        <label className="block text-xs text-muted mb-1">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!!initial}
          placeholder="photos"
          className="w-full border border-border rounded px-2 py-1.5 text-sm mb-3 disabled:bg-bg"
        />
        <label className="block text-xs text-muted mb-1">Tags (files must have all)</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded bg-accent-soft text-accent flex items-center gap-1">
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-ink">×</button>
            </span>
          ))}
        </div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(tagInput); }
          }}
          placeholder="type a tag and press Enter"
          className="w-full border border-border rounded px-2 py-1.5 text-sm mb-2"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {allTags.filter((t) => !tags.includes(t)).map((t) => (
              <button key={t} onClick={() => handleAddTag(t)} className="text-xs px-1.5 py-0.5 rounded border border-border text-muted hover:bg-bg">
                + {t}
              </button>
            ))}
          </div>
        )}
        <label className="block text-xs text-muted mb-1">Color</label>
        <div className="flex gap-2 mb-4">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-ink' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-muted hover:text-ink">Cancel</button>
          <button
            onClick={handleSave}
            disabled={disabled}
            className="text-sm px-3 py-1.5 rounded-md bg-accent text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
