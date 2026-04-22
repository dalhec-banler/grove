import { useState } from 'react';
import type { CatalogMode } from '../types';
import Backdrop from './Backdrop';

interface Props {
  onClose: () => void;
  onCreate: (id: string, name: string, description: string, mode: CatalogMode) => void;
}

export default function CatalogCreateModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<CatalogMode>('public');

  function submit() {
    const n = name.trim();
    if (!n) return;
    // Generate a slug ID from the name
    const id = n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'catalog';
    onCreate(id, n, description.trim(), mode);
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Create Catalog</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Music, Art, Documents..."
              className="w-full border border-border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What's in this catalog?"
              className="w-full border border-border rounded px-2 py-1.5 text-sm resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Visibility</label>
            <div className="flex gap-2">
              {(['public', 'pals', 'group'] as CatalogMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-xs px-3 py-1.5 rounded border ${
                    mode === m
                      ? 'border-canopy bg-canopy-soft text-canopy font-medium'
                      : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  {m === 'public' ? 'Public' : m === 'pals' ? 'Pals' : 'Group'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-faint mt-1">
              {mode === 'public' && 'Anyone can discover and browse this catalog.'}
              {mode === 'pals' && 'Only your Pals and manually added friends can see this catalog.'}
              {mode === 'group' && 'Only members of a specific Tlon group can see this catalog.'}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-ink">Cancel</button>
            <button
              onClick={submit}
              disabled={!name.trim()}
              className="text-xs px-3 py-1.5 rounded bg-canopy text-white disabled:opacity-40"
            >Create</button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
}
